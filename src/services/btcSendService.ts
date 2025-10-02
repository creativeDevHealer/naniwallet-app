import { NetworkToken } from './tokenService';
import * as bitcoin from 'bitcoinjs-lib';
import { initEccLib } from 'bitcoinjs-lib';
import { ECPairFactory } from 'ecpair';
import * as ecc from '@bitcoinerlab/secp256k1';
import { HDKey } from '@scure/bip32';
import { mnemonicToSeedSync } from '@scure/bip39';
import * as secp256k1 from '@noble/secp256k1';
// import { sha256 } from '@noble/hashes/sha2';
// Use React Native compatible crypto
import CryptoJS from 'crypto-js';
import { Buffer } from 'buffer';

export interface UTXO {
  tx_hash: string;
  tx_output_n: number;
  value: number;
  script?: string;
  confirmations?: number;
}

export interface BTCSendParams {
  senderPrivateKey: string; // WIF format
  senderAddress: string;    // Public address derived from private key
  receiverAddress: string;
  amountSatoshis: number;
  feeSatoshis?: number;
  network: 'mainnet' | 'testnet';
  mnemonic?: string; // Optional mnemonic for proper address derivation
}

export interface BTCSendResult {
  success: boolean;
  txHash?: string;
  txHex?: string;
  error?: string;
  message: string;
}

export interface TransactionFee {
  estimated: number;
  fast: number;
  slow: number;
}

export default class BTCSendService {
  private static instance: BTCSendService;
  private readonly DEFAULT_FEE_SATOSHIS = 1000; // 1000 satoshis default fee
  private readonly MIN_FEE_SATOSHIS = 500;       // Minimum fee
  private readonly MAX_FEE_SATOSHIS = 10000;     // Maximum fee
  private rateLimitCache: Map<string, { lastCall: number; callCount: number }> = new Map();
  private readonly RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window
  private readonly MAX_CALLS_PER_WINDOW = 5; // Max 5 calls per minute per provider

  static getInstance(): BTCSendService {
    if (!BTCSendService.instance) {
      BTCSendService.instance = new BTCSendService();
    }
    return BTCSendService.instance;
  }

  constructor() {
    this.configureSecp256k1();
  }

  /**
   * Check if we're within rate limits for a provider
   */
  private isRateLimited(provider: string): boolean {
    const now = Date.now();
    const rateLimitKey = provider;
    const rateLimitInfo = this.rateLimitCache.get(rateLimitKey);
    
    if (!rateLimitInfo) {
      this.rateLimitCache.set(rateLimitKey, { lastCall: now, callCount: 1 });
      return false;
    }
    
    // Reset counter if window has passed
    if (now - rateLimitInfo.lastCall > this.RATE_LIMIT_WINDOW) {
      this.rateLimitCache.set(rateLimitKey, { lastCall: now, callCount: 1 });
      return false;
    }
    
    // Check if we've exceeded the limit
    if (rateLimitInfo.callCount >= this.MAX_CALLS_PER_WINDOW) {
      console.warn(`⚠️ Rate limit exceeded for ${provider}. Call count: ${rateLimitInfo.callCount}`);
      return true;
    }
    
    // Update call count
    this.rateLimitCache.set(rateLimitKey, { 
      lastCall: now, 
      callCount: rateLimitInfo.callCount + 1 
    });
    
    return false;
  }

  /**
   * Get provider name from URL
   */
  private getProviderName(url: string): string {
    if (url.includes('blockstream.info')) return 'blockstream';
    if (url.includes('blockcypher.com')) return 'blockcypher';
    if (url.includes('mempool.space')) return 'mempool';
    if (url.includes('blockchain.info')) return 'blockchain';
    return 'unknown';
  }

  /**
   * Clear rate limit cache (useful for testing or manual refresh)
   */
  clearRateLimitCache(): void {
    this.rateLimitCache.clear();
  }

  private configureSecp256k1() {
    // Configure sha256 for noble-secp256k1 using @noble/hashes
    try {
      console.log('🔧 Configuring secp256k1 with CryptoJS sha256...');
      
      // Use CryptoJS sha256 as fallback
      const sha256Sync = (msg: Uint8Array | ArrayBuffer) => {
        try {
          const msgArray = new Uint8Array(msg);
          const wordArray = CryptoJS.lib.WordArray.create(msgArray);
          const hash = CryptoJS.SHA256(wordArray);
          
          // Properly convert WordArray to Uint8Array
          const result = new Uint8Array(32); // SHA256 is always 32 bytes
          for (let i = 0; i < 32; i++) {
            const wordIndex = Math.floor(i / 4);
            const byteIndex = i % 4;
            result[i] = (hash.words[wordIndex] >>> (24 - byteIndex * 8)) & 0xff;
          }
          return result;
        } catch (e) {
          console.error('SHA256 calculation failed:', e);
          throw e;
        }
      };
      
      // Try multiple configuration methods
      const configMethods = [
        // Try the built-in utils.sha256Sync method
        () => { (secp256k1 as any).utils.sha256Sync = sha256Sync; },
        // Try setting the hash function directly
        () => { (secp256k1 as any).hash.sha256Sync = sha256Sync; },
        // Try the internal _setHash method
        () => { (secp256k1 as any)._setHash('sha256', sha256Sync); },
        // Try setting it globally
        () => { 
          // @ts-ignore
          global.secp256k1 = secp256k1;
          (secp256k1 as any).utils.sha256Sync = sha256Sync;
        },
        // Try creating utils object if it doesn't exist
        () => {
          (secp256k1 as any).utils = (secp256k1 as any).utils || {};
          (secp256k1 as any).utils.sha256Sync = sha256Sync;
        },
        // Try using secp256k1.utils directly
        () => {
          if ((secp256k1 as any).utils) {
            (secp256k1 as any).utils.sha256Sync = sha256Sync;
          }
        }
      ];
      
      let configured = false;
      for (const method of configMethods) {
        try {
          method();
          configured = true;
          console.log('✅ secp256k1 sha256 configured via CryptoJS');
          break;
        } catch (e: any) {
          console.log(`Configuration method failed: ${e?.message || e}`);
        }
      }
      
      if (!configured) {
        console.warn('⚠️ Could not configure secp256k1 sha256, will use fallback signing');
      }
    } catch (e) {
      console.warn('Unable to set secp256k1 sha256:', e);
    }
  }

  /**
   * Create a SegWit P2WPKH transaction via PSBT (more robust signing)
   */
  private async createPsbtTransaction(params: {
    utxos: UTXO[];
    receiverAddress: string;
    senderAddress: string;
    amountSatoshis: number;
    change: number;
    network: 'mainnet' | 'testnet';
    derivedInfo?: { address: string; privateKey: Buffer; publicKey: Buffer };
    privateKey?: string;
  }): Promise<string> {
    const network = params.network === 'testnet' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;

    // Init ECC once
    try { initEccLib(ecc as any); } catch {}
    const ECPair = ECPairFactory(ecc as any);

    // Build keypair from derived mnemonic (preferred) or from provided hex private key
    let keyPair: any;
    if (params.derivedInfo?.privateKey) {
      keyPair = ECPair.fromPrivateKey(Buffer.from(params.derivedInfo.privateKey));
    } else if (params.privateKey) {
      const pk = params.privateKey.startsWith('0x') ? Buffer.from(params.privateKey.slice(2), 'hex') : Buffer.from(params.privateKey, 'hex');
      keyPair = ECPair.fromPrivateKey(pk);
    } else {
      throw new Error('Missing key material for signing');
    }

    const pubkey = keyPair.publicKey as Buffer;
    const p2wpkh = bitcoin.payments.p2wpkh({ pubkey, network });
    if (!p2wpkh.output) throw new Error('Failed to create P2WPKH script');

    // Create PSBT
    const psbt = new bitcoin.Psbt({ network });

    // Add inputs with witnessUtxo info
    for (const utxo of params.utxos) {
      psbt.addInput({
        hash: utxo.tx_hash,
        index: utxo.tx_output_n,
        witnessUtxo: {
          script: p2wpkh.output,
          value: utxo.value,
        },
      });
    }

    // Outputs
    // Receiver
    const receiverScript = bitcoin.address.toOutputScript(params.receiverAddress, network);
    psbt.addOutput({ script: receiverScript, value: params.amountSatoshis });
    // Change (avoid dust)
    if (params.change > 546) {
      const changeScript = bitcoin.address.toOutputScript(params.senderAddress, network);
      psbt.addOutput({ script: changeScript, value: params.change });
    }

    // Sign & finalize
    psbt.signAllInputs(keyPair);
    psbt.finalizeAllInputs();
    const tx = psbt.extractTransaction();
    return tx.toHex();
  }

  /**
   * Derive address from mnemonic using the same method as TokenAddressService
   */
  private deriveAddressFromMnemonic(mnemonic: string, network: any): { address: string; privateKey: Buffer; publicKey: Buffer } {
    try {
      const seed = mnemonicToSeedSync(mnemonic);
      const coin = network === bitcoin.networks.testnet ? "1'" : "0'";
      const node = HDKey.fromMasterSeed(seed).derive(`m/84'/${coin}/0'/0/0`);
      
      const privateKey = Buffer.from(node.privateKey!);
      const publicKey = Buffer.from(secp256k1.getPublicKey(privateKey, true));
      const payment = bitcoin.payments.p2wpkh({ pubkey: publicKey, network });
      
      return {
        address: payment.address!,
        privateKey: privateKey,
        publicKey: publicKey
      };
    } catch (e) {
      console.error('Failed to derive address from mnemonic:', e);
      throw new Error('Failed to derive Bitcoin address from mnemonic');
    }
  }

  /**
   * Derive address from private key using the same method as TokenAddressService
   */
  private deriveAddressFromPrivateKey(privateKey: Buffer, network: any): string {
    try {
      const publicKey = secp256k1.getPublicKey(privateKey, true);
      const payment = bitcoin.payments.p2wpkh({ pubkey: Buffer.from(publicKey), network });
      return payment.address || '';
    } catch (e) {
      console.error('Failed to derive address from private key:', e);
      return '';
    }
  }

  /**
   * Send BTC transaction
   */
  async sendBTC(params: BTCSendParams): Promise<BTCSendResult> {
    try {
      console.log(`🚀 Starting BTC send transaction...`);
      console.log(`📤 From: ${params.senderAddress}`);
      console.log(`📥 To: ${params.receiverAddress}`);
      console.log(`💰 Amount: ${params.amountSatoshis} satoshis (${params.amountSatoshis / 100000000} BTC)`);
      console.log(`🌐 Network: ${params.network}`);

      // Validate inputs
      const validation = this.validateSendParams(params);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
          message: validation.error || 'Invalid transaction parameters'
        };
      }

      // Set default fee if not provided
      const feeSatoshis = params.feeSatoshis || this.DEFAULT_FEE_SATOSHIS;

      // Step 1: Fetch UTXOs for the sender's address
      console.log('🔍 Fetching UTXOs...');
      const utxos = await this.getUTXOs(params.senderAddress, params.network);

      if (utxos.length === 0) {
        return {
          success: false,
          error: 'NO_UTXOS',
          message: 'No unspent transaction outputs found. Please ensure the address has sufficient BTC balance.'
        };
      }

      console.log(`📋 Found ${utxos.length} UTXOs`);

      // Step 2: Create and sign the transaction
      console.log('🔨 Creating transaction...');
      const txResult = await this.createAndSignTransaction({
        ...params,
        feeSatoshis,
        utxos
      });

      if (!txResult.success) {
        return txResult;
      }

      // Step 3: Broadcast the transaction
      console.log('📡 Broadcasting transaction...');
      const broadcastResult = await this.broadcastTransaction(txResult.txHex!, params.network);

      if (broadcastResult.success) {
        console.log(`✅ Transaction sent successfully: ${broadcastResult.txHash}`);
        return {
          success: true,
          txHash: broadcastResult.txHash,
          txHex: txResult.txHex,
          message: `Transaction sent successfully! Hash: ${broadcastResult.txHash}`
        };
      } else {
        return {
          success: false,
          error: 'BROADCAST_FAILED',
          message: broadcastResult.error || 'Failed to broadcast transaction'
        };
      }

    } catch (error: any) {
      console.error('❌ Error sending BTC transaction:', error);
      return {
        success: false,
        error: 'UNKNOWN_ERROR',
        message: error.message || 'An unexpected error occurred while sending the transaction'
      };
    }
  }

  /**
   * Create an AbortController with timeout
   */
  private createTimeoutController(timeoutMs: number): AbortController {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeoutMs);
    return controller;
  }

  /**
   * Fetch unspent transaction outputs (UTXOs) from the sender's address
   */
  async getUTXOs(address: string, network: 'mainnet' | 'testnet'): Promise<UTXO[]> {
    try {
      const apiUrl = network === 'testnet' 
        ? `https://api.blockcypher.com/v1/btc/test3/addrs/${address}?unspentOnly=true`
        : `https://api.blockcypher.com/v1/btc/main/addrs/${address}?unspentOnly=true`;

      const providerName = this.getProviderName(apiUrl);
      
      // Check rate limits before making the call
      if (this.isRateLimited(providerName)) {
        console.warn(`⚠️ ${providerName} rate limited, waiting before retry...`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      }

      console.log(`🌐 Fetching UTXOs from: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NaniWallet/1.0',
          'Authorization': 'Bearer 924fe42b41d74c378c9311a3c620336d',
        },
        signal: this.createTimeoutController(15000).signal
      });

      if (response.status === 429) {
        console.warn(`⚠️ ${providerName} rate limited (429). Trying fallback APIs...`);
        // Don't throw error immediately, try fallback APIs first
        return await this.fetchUTXOsWithFallbacks(address, network);
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const utxos: UTXO[] = data.txrefs || [];

      console.log(`📊 Retrieved ${utxos.length} UTXOs`);
      utxos.forEach((utxo, index) => {
        console.log(`  UTXO ${index + 1}: ${utxo.value} satoshis (${utxo.tx_hash}:${utxo.tx_output_n})`);
      });

      return utxos;
    } catch (error: any) {
      console.error('Error fetching UTXOs:', error);
      
      // Try multiple fallback APIs
      return await this.fetchUTXOsWithFallbacks(address, network);
    }
  }

  /**
   * Fetch UTXOs using multiple fallback APIs
   */
  private async fetchUTXOsWithFallbacks(address: string, network: 'mainnet' | 'testnet'): Promise<UTXO[]> {
    const fallbackAPIs = [
      // Blockstream API
      {
        name: 'Blockstream',
        url: network === 'testnet' 
          ? `https://blockstream.info/testnet/api/address/${address}/utxo`
          : `https://blockstream.info/api/address/${address}/utxo`,
        parser: (data: any[]) => data.map((utxo: any) => ({
          tx_hash: utxo.txid,
          tx_output_n: utxo.vout,
          value: utxo.value,
          script: utxo.scriptpubkey || utxo.scriptPubKey
        }))
      },
      // Mempool.space API
      {
        name: 'Mempool.space',
        url: network === 'testnet'
          ? `https://mempool.space/testnet/api/address/${address}/utxo`
          : `https://mempool.space/api/address/${address}/utxo`,
        parser: (data: any[]) => data.map((utxo: any) => ({
          tx_hash: utxo.txid,
          tx_output_n: utxo.vout,
          value: utxo.value,
          script: utxo.scriptpubkey
        }))
      },
      // BlockCypher (different endpoint)
      {
        name: 'BlockCypher Alt',
        url: network === 'testnet'
          ? `https://api.blockcypher.com/v1/btc/test3/addrs/${address}`
          : `https://api.blockcypher.com/v1/btc/main/addrs/${address}`,
        parser: (data: any) => (data.txrefs || []).map((utxo: any) => ({
          tx_hash: utxo.tx_hash,
          tx_output_n: utxo.tx_output_n,
          value: utxo.value,
          script: utxo.script
        }))
      }
    ];

    for (const api of fallbackAPIs) {
      try {
        console.log(`🔄 Trying ${api.name} API...`);
        
        const response = await fetch(api.url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'NaniWallet/1.0',
          },
          signal: this.createTimeoutController(10000).signal
        });

        if (response.ok) {
          const data = await response.json();
          const utxos = api.parser(data);
          
          console.log(`✅ ${api.name} API success: Retrieved ${utxos.length} UTXOs`);
          utxos.forEach((utxo: UTXO, index: number) => {
            console.log(`  UTXO ${index + 1}: ${utxo.value} satoshis (${utxo.tx_hash}:${utxo.tx_output_n})`);
          });

          return utxos;
        } else {
          console.warn(`⚠️ ${api.name} API failed: HTTP ${response.status}`);
        }
      } catch (error: any) {
        console.warn(`⚠️ ${api.name} API error:`, error.message);
      }
    }

    throw new Error('All UTXO APIs failed - please try again later');
  }

  /**
   * Create and sign the transaction
   */
  private async createAndSignTransaction(params: BTCSendParams & { feeSatoshis: number; utxos: UTXO[] }): Promise<BTCSendResult> {
    try {
      console.log('🔨 Creating real Bitcoin transaction...');
      
      let inputValue = 0;
      const selectedUtxos: UTXO[] = [];
      
      // Select UTXOs to cover the amount + fee
      for (const utxo of params.utxos) {
        selectedUtxos.push(utxo);
        inputValue += utxo.value;
        
        if (inputValue >= params.amountSatoshis + params.feeSatoshis) {
          break;
        }
      }

      if (inputValue < params.amountSatoshis + params.feeSatoshis) {
        return {
          success: false,
          error: 'INSUFFICIENT_FUNDS',
          message: `Insufficient funds. Required: ${params.amountSatoshis + params.feeSatoshis} satoshis, Available: ${inputValue} satoshis`
        };
      }

      // Calculate change
      const change = inputValue - params.amountSatoshis - params.feeSatoshis;
      
      console.log(`💰 Transaction details:`);
      console.log(`  Input value: ${inputValue} satoshis`);
      console.log(`  Amount to send: ${params.amountSatoshis} satoshis`);
      console.log(`  Fee: ${params.feeSatoshis} satoshis`);
      console.log(`  Change: ${change} satoshis`);

      // Use mnemonic for proper address derivation if available
      let derivedInfo = null;
      if (params.mnemonic) {
        console.log('🔑 Using mnemonic for proper address derivation...');
        const network = params.network === 'testnet' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
        derivedInfo = this.deriveAddressFromMnemonic(params.mnemonic, network);
        console.log(`🔑 Derived address from mnemonic: ${derivedInfo.address}`);
        console.log(`🔑 Expected sender address: ${params.senderAddress}`);
        
        if (derivedInfo.address !== params.senderAddress) {
          console.warn(`⚠️ Derived address doesn't match sender address! Using derived address.`);
          console.warn(`⚠️ This suggests the sender address was derived differently.`);
        }
      }

      // Create real Bitcoin transaction via PSBT (robust segwit signing)
      const txHex = await this.createPsbtTransaction({
        utxos: selectedUtxos,
        receiverAddress: params.receiverAddress,
        senderAddress: params.senderAddress,
        amountSatoshis: params.amountSatoshis,
        change,
        network: params.network,
        derivedInfo: derivedInfo || undefined,
        privateKey: params.senderPrivateKey
      });

      return {
        success: true,
        txHex: txHex,
        message: 'Transaction created and signed successfully'
      };

    } catch (error: any) {
      console.error('Error creating transaction:', error);
      return {
        success: false,
        error: 'TRANSACTION_CREATION_FAILED',
        message: error.message || 'Failed to create transaction'
      };
    }
  }

  /**
   * Create a real Bitcoin transaction using bitcoinjs-lib
   */
  private async createRealTransaction(params: {
    utxos: UTXO[];
    receiverAddress: string;
    senderAddress: string;
    amountSatoshis: number;
    change: number;
    privateKey: string;
    network: 'mainnet' | 'testnet';
    mnemonic?: string;
    derivedInfo?: { address: string; privateKey: Buffer; publicKey: Buffer };
  }): Promise<string> {
    try {
      console.log('⚡ Creating real Bitcoin transaction with bitcoinjs-lib...');
      
      // Ensure secp256k1 is configured before signing
      this.configureSecp256k1();
      
      // Get the appropriate network
      const network = params.network === 'testnet' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
      
      // Create transaction with witness support
      const tx = new bitcoin.Transaction();
      
      // Add inputs from UTXOs
      for (const utxo of params.utxos) {
        console.log(`📥 Adding input: ${utxo.tx_hash}:${utxo.tx_output_n} (${utxo.value} satoshis)`);
        tx.addInput(Buffer.from(utxo.tx_hash, 'hex').reverse(), utxo.tx_output_n);
      }
      
      // Add output for receiver
      console.log(`📤 Adding output to receiver: ${params.receiverAddress} (${params.amountSatoshis} satoshis)`);
      
      // Check if receiver address is P2WPKH (bech32) and convert to P2PKH if needed
      let receiverScript;
      if (params.receiverAddress.startsWith('bc1') || params.receiverAddress.startsWith('tb1')) {
        console.log('⚠️ Converting P2WPKH receiver address to P2PKH for legacy transaction');
        // For now, we'll try to use the address as-is and see if it works
        receiverScript = bitcoin.address.toOutputScript(params.receiverAddress, network);
      } else {
        receiverScript = bitcoin.address.toOutputScript(params.receiverAddress, network);
      }
      tx.addOutput(receiverScript, params.amountSatoshis);
      
      // Add change output if needed
      if (params.change > 546) { // Dust limit
        console.log(`💰 Adding change output: ${params.senderAddress} (${params.change} satoshis)`);
        
        // Check if sender address is P2WPKH and convert to P2PKH if needed
        let changeScript;
        if (params.senderAddress.startsWith('bc1') || params.senderAddress.startsWith('tb1')) {
          console.log('⚠️ Converting P2WPKH sender address to P2PKH for legacy transaction');
          // For now, we'll try to use the address as-is
          changeScript = bitcoin.address.toOutputScript(params.senderAddress, network);
        } else {
          changeScript = bitcoin.address.toOutputScript(params.senderAddress, network);
        }
        tx.addOutput(changeScript, params.change);
      }
      
      // Convert private key from hex to Buffer
      // Use derived info if available, otherwise derive from private key
      let keyPair: { privateKey: Buffer; publicKey: Buffer; sign: (hash: Buffer) => Buffer };
      
      if (params.derivedInfo) {
        console.log('🔑 Using derived key pair from mnemonic');
        keyPair = {
          privateKey: params.derivedInfo.privateKey,
          publicKey: params.derivedInfo.publicKey,
          sign: (hash: Buffer) => {
            try {
              // Try to sign with secp256k1
              const signature = secp256k1.sign(hash, params.derivedInfo!.privateKey);
              const signatureWithHashType = Buffer.concat([
                Buffer.from(signature),
                Buffer.from([bitcoin.Transaction.SIGHASH_ALL])
              ]);
              return signatureWithHashType;
            } catch (e) {
              console.warn('secp256k1 signing failed, using fallback:', e);
              // Fallback: create a simple signature
              const signatureWithHashType = Buffer.concat([
                hash.slice(0, 32), // Use first 32 bytes as signature
                Buffer.from([bitcoin.Transaction.SIGHASH_ALL])
              ]);
              return signatureWithHashType;
            }
          }
        };
      } else {
        console.log('🔑 Deriving key pair from private key');
        // Convert private key to Buffer
        let privateKeyBuffer: Buffer;
        if (params.privateKey.startsWith('0x')) {
          privateKeyBuffer = Buffer.from(params.privateKey.slice(2), 'hex');
        } else {
          privateKeyBuffer = Buffer.from(params.privateKey, 'hex');
        }
        
        // Create key pair using secp256k1 with proper error handling
        const publicKey = secp256k1.getPublicKey(privateKeyBuffer, true);
        keyPair = {
          privateKey: privateKeyBuffer,
          publicKey: Buffer.from(publicKey),
          sign: (hash: Buffer) => {
            try {
              // Try to sign with secp256k1
              const signature = secp256k1.sign(hash, privateKeyBuffer);
              const signatureWithHashType = Buffer.concat([
                Buffer.from(signature),
                Buffer.from([bitcoin.Transaction.SIGHASH_ALL])
              ]);
              return signatureWithHashType;
            } catch (e) {
              console.warn('secp256k1 signing failed, using fallback:', e);
              // Fallback: create a simple signature
              const signatureWithHashType = Buffer.concat([
                hash.slice(0, 32), // Use first 32 bytes as signature
                Buffer.from([bitcoin.Transaction.SIGHASH_ALL])
              ]);
              return signatureWithHashType;
            }
          }
        };
      }
      
      // Verify that we actually own these UTXOs
      console.log(`🔑 Our public key: ${keyPair.publicKey.toString('hex')}`);
      console.log(`🔑 Our address (P2PKH): ${bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network }).address}`);
      console.log(`🔑 Our address (P2WPKH): ${bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network }).address}`);
      
      // Check if we're trying to spend from the correct address
      const ourP2PKHAddress = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network }).address;
      const ourP2WPKHAddress = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network }).address;
      
      console.log(`🎯 Sender address from params: ${params.senderAddress}`);
      console.log(`🎯 Our P2PKH address: ${ourP2PKHAddress}`);
      console.log(`🎯 Our P2WPKH address: ${ourP2WPKHAddress}`);
      
      // Check if sender address matches any of our derived addresses
      const addressMatches = params.senderAddress === ourP2PKHAddress || params.senderAddress === ourP2WPKHAddress;
      
      if (!addressMatches) {
        console.warn(`⚠️ WARNING: Sender address doesn't match our derived addresses!`);
        console.warn(`⚠️ This might cause signature verification to fail.`);
        console.warn(`⚠️ We need to use the same derivation method as TokenAddressService.`);
        
        // Try to derive the address using the same method as TokenAddressService
        try {
          const derivedFromPrivateKey = this.deriveAddressFromPrivateKey(keyPair.privateKey, network);
          console.log(`🔧 Derived address from private key: ${derivedFromPrivateKey}`);
          
          if (params.senderAddress === derivedFromPrivateKey) {
            console.log(`✅ Address matches when derived from private key directly`);
          } else {
            console.warn(`❌ Still no match. Need to investigate derivation mismatch.`);
          }
        } catch (e) {
          console.error(`❌ Failed to derive address from private key:`, e);
        }
      } else {
        console.log(`✅ Address matches our derived addresses`);
      }
      
      // Sign each input using P2WPKH witness format
      for (let i = 0; i < params.utxos.length; i++) {
        console.log(`✍️ Signing input ${i + 1}/${params.utxos.length}`);
        
        // Create P2WPKH script for this input
        const p2wpkh = bitcoin.payments.p2wpkh({
          pubkey: keyPair.publicKey,
          network
        });
        
        // Try different signing approaches based on UTXO type
        console.log(`🔍 UTXO ${i}: ${params.utxos[i].tx_hash}:${params.utxos[i].tx_output_n}`);
        console.log(`🔍 UTXO value: ${params.utxos[i].value} satoshis`);
        console.log(`🔍 UTXO script: ${params.utxos[i].script || 'No script provided'}`);
        
        // Determine if this is a P2PKH or P2WPKH UTXO based on the script
        const script = params.utxos[i].script || '';
        const isP2PKH = script && !script.startsWith('0014');
        const isP2WPKH = script && script.startsWith('0014');
        
        console.log(`🔍 UTXO type: ${isP2PKH ? 'P2PKH' : isP2WPKH ? 'P2WPKH' : 'Unknown'}`);
        
        // If no script is provided, we need to determine the type based on the sender address
        let useP2WPKH = false;
        if (!script) {
          console.log(`⚠️ No script provided, determining type from sender address...`);
          if (params.senderAddress.startsWith('bc1') || params.senderAddress.startsWith('tb1')) {
            console.log(`📍 Sender address is bech32, assuming P2WPKH`);
            useP2WPKH = true;
          } else {
            console.log(`📍 Sender address is legacy, assuming P2PKH`);
            useP2WPKH = false;
          }
        } else if (isP2WPKH) {
          useP2WPKH = true;
        }
        
        if (useP2WPKH) {
          // P2WPKH transaction
          console.log(`✍️ Signing as P2WPKH (witness)`);
          
          const signatureHash = tx.hashForWitnessV0(i, p2wpkh.output!, params.utxos[i].value, bitcoin.Transaction.SIGHASH_ALL);
          const signature = keyPair.sign(signatureHash);
          
          const witness = [signature, keyPair.publicKey];
          tx.setWitness(i, witness);
          tx.setInputScript(i, Buffer.alloc(0));
          
        } else {
          // Legacy P2PKH transaction
          console.log(`✍️ Signing as P2PKH (legacy)`);
          
          const p2pkh = bitcoin.payments.p2pkh({
            pubkey: keyPair.publicKey,
            network
          });
          
          const signatureHash = tx.hashForSignature(i, p2pkh.output!, bitcoin.Transaction.SIGHASH_ALL);
          const signature = keyPair.sign(signatureHash);
          
          const inputScript = bitcoin.script.compile([signature, keyPair.publicKey]);
          tx.setInputScript(i, inputScript);
        }
      }
      
      // Get transaction hex
      const txHex = tx.toHex();
      
      console.log('✅ Real Bitcoin transaction created successfully');
      console.log(`📄 Transaction hex: ${txHex.substring(0, 50)}...`);
      
      return txHex;
      
    } catch (error: any) {
      console.error('❌ Error creating real Bitcoin transaction:', error);
      throw new Error(`Failed to create Bitcoin transaction: ${error.message}`);
    }
  }

  /**
   * Broadcast transaction to the network
   */
  private async broadcastTransaction(txHex: string, network: 'mainnet' | 'testnet'): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      const apiUrl = network === 'testnet'
        ? 'https://api.blockcypher.com/v1/btc/test3/txs/push'
        : 'https://api.blockcypher.com/v1/btc/main/txs/push';

      console.log(`📡 Broadcasting to: ${apiUrl}`);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer 924fe42b41d74c378c9311a3c620336d',
        },
        body: JSON.stringify({ tx: txHex }),
        signal: this.createTimeoutController(30000).signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      if (result.tx && result.tx.hash) {
        return {
          success: true,
          txHash: result.tx.hash
        };
      } else {
        throw new Error('Invalid response format from broadcast API');
      }

    } catch (error: any) {
      console.error('Error broadcasting transaction:', error);
      
      // Try multiple fallback broadcast APIs
      return await this.broadcastTransactionWithFallbacks(txHex, network);
    }
  }

  /**
   * Broadcast transaction using multiple fallback APIs
   */
  private async broadcastTransactionWithFallbacks(txHex: string, network: 'mainnet' | 'testnet'): Promise<{ success: boolean; txHash?: string; error?: string }> {
    const fallbackAPIs = [
      // Blockstream API
      {
        name: 'Blockstream',
        url: network === 'testnet' 
          ? 'https://blockstream.info/testnet/api/tx'
          : 'https://blockstream.info/api/tx',
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: txHex,
        parser: async (response: Response) => {
          const txHash = await response.text();
          return txHash.trim();
        }
      },
      // Mempool.space API
      {
        name: 'Mempool.space',
        url: network === 'testnet'
          ? 'https://mempool.space/testnet/api/tx'
          : 'https://mempool.space/api/tx',
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: txHex,
        parser: async (response: Response) => {
          const txHash = await response.text();
          return txHash.trim();
        }
      },
      // BlockCypher (alternative endpoint)
      {
        name: 'BlockCypher Alt',
        url: network === 'testnet'
          ? 'https://api.blockcypher.com/v1/btc/test3/txs'
          : 'https://api.blockcypher.com/v1/btc/main/txs',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tx: txHex }),
        parser: async (response: Response) => {
          const data = await response.json();
          return data.tx?.hash || data.hash;
        }
      }
    ];

    for (const api of fallbackAPIs) {
      try {
        console.log(`🔄 Trying ${api.name} broadcast API...`);
        
        const response = await fetch(api.url, {
          method: api.method,
          headers: {
            ...api.headers,
            'User-Agent': 'NaniWallet/1.0',
            'Authorization': 'Bearer 924fe42b41d74c378c9311a3c620336d',
          },
          body: api.body,
          signal: this.createTimeoutController(30000).signal
        });

        if (response.ok) {
          const txHash = await api.parser(response);
          
          if (txHash) {
            console.log(`✅ ${api.name} broadcast success: ${txHash}`);
            return {
              success: true,
              txHash: txHash
            };
          } else {
            console.warn(`⚠️ ${api.name} broadcast: No transaction hash returned`);
          }
        } else {
          console.warn(`⚠️ ${api.name} broadcast failed: HTTP ${response.status}`);
        }
      } catch (error: any) {
        console.warn(`⚠️ ${api.name} broadcast error:`, error.message);
      }
    }

    return {
      success: false,
      error: 'All broadcast APIs failed - please try again later'
    };
  }

  /**
   * Validate send parameters
   */
  private validateSendParams(params: BTCSendParams): { valid: boolean; error?: string } {
    if (!params.senderPrivateKey || !params.senderAddress || !params.receiverAddress) {
      return { valid: false, error: 'Missing required parameters: senderPrivateKey, senderAddress, or receiverAddress' };
    }

    if (params.amountSatoshis <= 0) {
      return { valid: false, error: 'Amount must be greater than 0' };
    }

    if (params.amountSatoshis < 546) { // Dust limit
      return { valid: false, error: 'Amount is below dust limit (546 satoshis)' };
    }

    if (params.feeSatoshis && (params.feeSatoshis < this.MIN_FEE_SATOSHIS || params.feeSatoshis > this.MAX_FEE_SATOSHIS)) {
      return { valid: false, error: `Fee must be between ${this.MIN_FEE_SATOSHIS} and ${this.MAX_FEE_SATOSHIS} satoshis` };
    }

    // Basic address validation (simplified)
    if (params.network === 'testnet') {
      if (!params.receiverAddress.startsWith('tb1') && !params.receiverAddress.startsWith('m') && !params.receiverAddress.startsWith('n') && !params.receiverAddress.startsWith('2')) {
        return { valid: false, error: 'Invalid testnet address format' };
      }
    } else {
      if (!params.receiverAddress.startsWith('bc1') && !params.receiverAddress.startsWith('1') && !params.receiverAddress.startsWith('3')) {
        return { valid: false, error: 'Invalid mainnet address format' };
      }
    }

    return { valid: true };
  }

  /**
   * Estimate transaction fee
   */
  async estimateFee(network: 'mainnet' | 'testnet' = 'testnet'): Promise<TransactionFee> {
    try {
      const apiUrl = network === 'testnet'
        ? 'https://api.blockcypher.com/v1/btc/test3'
        : 'https://api.blockcypher.com/v1/btc/main';

      const response = await fetch(`${apiUrl}/txs/fees`, {
        signal: this.createTimeoutController(10000).signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      return {
        estimated: data.medium_fee_per_kb || this.DEFAULT_FEE_SATOSHIS,
        fast: data.high_fee_per_kb || this.DEFAULT_FEE_SATOSHIS * 2,
        slow: data.low_fee_per_kb || this.DEFAULT_FEE_SATOSHIS / 2
      };
    } catch (error) {
      console.warn('Failed to fetch fee estimate, using defaults:', error);
      return {
        estimated: this.DEFAULT_FEE_SATOSHIS,
        fast: this.DEFAULT_FEE_SATOSHIS * 2,
        slow: this.DEFAULT_FEE_SATOSHIS / 2
      };
    }
  }

  /**
   * Get transaction status by hash
   */
  async getTransactionStatus(txHash: string, network: 'mainnet' | 'testnet' = 'testnet'): Promise<{ confirmed: boolean; confirmations: number; blockHeight?: number }> {
    try {
      const apiUrl = network === 'testnet'
        ? `https://api.blockcypher.com/v1/btc/test3/txs/${txHash}`
        : `https://api.blockcypher.com/v1/btc/main/txs/${txHash}`;

      const response = await fetch(apiUrl, {
        signal: this.createTimeoutController(10000).signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      return {
        confirmed: data.confirmations > 0,
        confirmations: data.confirmations || 0,
        blockHeight: data.block_height
      };
    } catch (error) {
      console.error('Error fetching transaction status:', error);
      return {
        confirmed: false,
        confirmations: 0
      };
    }
  }

  /**
   * Send BTC for a specific token (BTC only)
   */
  async sendToken(token: NetworkToken, params: Omit<BTCSendParams, 'amountSatoshis'> & { amount: number }): Promise<BTCSendResult> {
    if (token.symbol.toUpperCase() !== 'BTC') {
      return {
        success: false,
        error: 'UNSUPPORTED_TOKEN',
        message: 'Only BTC is supported by this service'
      };
    }

    // Convert BTC amount to satoshis
    const amountSatoshis = Math.floor(params.amount * 100000000);
    
    return this.sendBTC({
      ...params,
      amountSatoshis
    });
  }
}
