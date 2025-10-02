import { 
  Connection, 
  Keypair, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  clusterApiUrl
} from '@solana/web3.js';
import { mnemonicToSeedSync } from '@scure/bip39';

export interface SOLSendParams {
  fromAddress: string;
  toAddress: string;
  amountSOL: number;
  network: 'mainnet' | 'devnet' | 'testnet';
  privateKey?: string;
  mnemonic?: string;
}

export interface SOLSendResult {
  success: boolean;
  txHash?: string;
  error?: string;
  message?: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  network: string;
}

export default class SOLSendService {
  private static instance: SOLSendService;

  static getInstance(): SOLSendService {
    if (!SOLSendService.instance) {
      SOLSendService.instance = new SOLSendService();
    }
    return SOLSendService.instance;
  }

  /**
   * Send SOL transaction
   */
  async sendSOL(params: SOLSendParams): Promise<SOLSendResult> {
    try {
      console.log('🚀 Starting SOL send transaction...');
      console.log('📤 From:', params.fromAddress);
      console.log('📥 To:', params.toAddress);
      console.log('💰 Amount:', params.amountSOL, 'SOL');
      console.log('🌐 Network:', params.network);

      // Validate inputs
      if (!params.fromAddress || !params.toAddress || params.amountSOL <= 0) {
        throw new Error('Invalid transaction parameters');
      }

      // Get connection for the network
      const connection = this.getConnection(params.network);
      
      // Get keypair from mnemonic or private key
      const keypair = await this.getKeypair(params);
      
      // Convert SOL to lamports
      const amountLamports = Math.floor(params.amountSOL * LAMPORTS_PER_SOL);
      
      // Create transaction
      const transaction = new Transaction();
      
      // Add transfer instruction
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: keypair.publicKey,
          toPubkey: new PublicKey(params.toAddress),
          lamports: amountLamports,
        })
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = keypair.publicKey;

      console.log('⚡ Signing and sending transaction...');
      
      // Send and confirm transaction
      const txHash = await sendAndConfirmTransaction(
        connection,
        transaction,
        [keypair],
        {
          commitment: 'confirmed',
          maxRetries: 3,
        }
      );

      console.log('✅ SOL transaction sent successfully:', txHash);

      return {
        success: true,
        txHash,
        message: `Transaction sent successfully! Hash: ${txHash}`,
        fromAddress: params.fromAddress,
        toAddress: params.toAddress,
        amount: params.amountSOL,
        network: params.network
      };

    } catch (error: any) {
      console.error('❌ SOL transaction failed:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
        message: error.message || 'Failed to send SOL transaction',
        fromAddress: params.fromAddress,
        toAddress: params.toAddress,
        amount: params.amountSOL,
        network: params.network
      };
    }
  }

  /**
   * Get Solana connection for the specified network
   */
  private getConnection(network: 'mainnet' | 'devnet' | 'testnet'): Connection {
    const endpoints = {
      mainnet: 'https://api.mainnet-beta.solana.com',
      devnet: clusterApiUrl('devnet'),
      testnet: clusterApiUrl('testnet')
    };

    return new Connection(endpoints[network], 'confirmed');
  }

  /**
   * Get keypair from mnemonic or private key
   */
  private async getKeypair(params: SOLSendParams): Promise<Keypair> {
    if (params.privateKey) {
      // Use private key if provided
      const privateKeyBytes = new Uint8Array(JSON.parse(params.privateKey));
      return Keypair.fromSecretKey(privateKeyBytes);
    } else if (params.mnemonic) {
      // Derive keypair from mnemonic
      return this.deriveKeypairFromMnemonic(params.mnemonic);
    } else {
      throw new Error('Either private key or mnemonic must be provided');
    }
  }

  /**
   * Derive Solana keypair from mnemonic
   */
  private deriveKeypairFromMnemonic(mnemonic: string): Keypair {
    try {
      // Use the first 32 bytes of the mnemonic seed for Solana keypair
      const seed = mnemonicToSeedSync(mnemonic).slice(0, 32);
      return Keypair.fromSeed(seed);
    } catch (error) {
      throw new Error('Failed to derive keypair from mnemonic');
    }
  }

  /**
   * Estimate transaction fee
   */
  async estimateFee(
    fromAddress: string, 
    toAddress: string, 
    amountSOL: number, 
    network: 'mainnet' | 'devnet' | 'testnet'
  ): Promise<number> {
    try {
      const connection = this.getConnection(network);
      
      // Create a dummy transaction to estimate fee
      const transaction = new Transaction();
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(fromAddress),
          toPubkey: new PublicKey(toAddress),
          lamports: Math.floor(amountSOL * LAMPORTS_PER_SOL),
        })
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(fromAddress);

      // Calculate fee (this is a simplified estimation)
      const fee = await connection.getFeeForMessage(transaction.compileMessage());
      return fee.value || 5000; // Default fee in lamports
    } catch (error) {
      console.error('Error estimating fee:', error);
      return 5000; // Default fee in lamports
    }
  }

  /**
   * Validate Solana address
   */
  isValidAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }
}
