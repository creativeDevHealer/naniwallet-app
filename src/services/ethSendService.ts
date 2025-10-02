import { ethers } from 'ethers';

export interface ETHSendParams {
  fromAddress: string;
  toAddress: string;
  amountETH: number;
  network: 'mainnet' | 'sepolia' | 'goerli';
  privateKey?: string;
  mnemonic?: string;
}

export interface ETHSendResult {
  success: boolean;
  txHash?: string;
  error?: string;
  message?: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  network: string;
  gasUsed?: string;
  gasPrice?: string;
}

export default class ETHSendService {
  private static instance: ETHSendService;

  static getInstance(): ETHSendService {
    if (!ETHSendService.instance) {
      ETHSendService.instance = new ETHSendService();
    }
    return ETHSendService.instance;
  }

  /**
   * Send ETH transaction
   */
  async sendETH(params: ETHSendParams): Promise<ETHSendResult> {
    try {
      console.log('🚀 Starting ETH send transaction...');
      console.log('📤 From:', params.fromAddress);
      console.log('📥 To:', params.toAddress);
      console.log('💰 Amount:', params.amountETH, 'ETH');
      console.log('🌐 Network:', params.network);

      // Validate inputs
      if (!params.fromAddress || !params.toAddress || params.amountETH <= 0) {
        throw new Error('Invalid transaction parameters');
      }

      // Get provider for the network
      const provider = this.getProvider(params.network);
      
      // Get wallet from private key or mnemonic
      const wallet = await this.getWallet(params, provider);
      
      // Connect wallet to provider
      const connectedWallet = wallet.connect(provider);
      
      // Convert ETH to wei
      const amountWei = ethers.parseEther(params.amountETH.toString());
      
      // Get current gas price
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');
      
      // Estimate gas for the transaction
      const gasEstimate = await connectedWallet.estimateGas({
        to: params.toAddress,
        value: amountWei
      });

      // Add 10% buffer to gas estimate
      const gasLimit = (gasEstimate * 110n) / 100n;

      console.log('⚡ Sending transaction...');
      console.log('⛽ Gas limit:', gasLimit.toString());
      console.log('⛽ Gas price:', gasPrice.toString());

      // Send transaction
      const tx = await connectedWallet.sendTransaction({
        to: params.toAddress,
        value: amountWei,
        gasPrice: gasPrice,
        gasLimit: gasLimit
      });

      console.log('📡 Transaction sent:', tx.hash);
      
      // Wait for transaction to be mined
      console.log('⏳ Waiting for confirmation...');
      const receipt = await tx.wait();
      
      console.log('✅ ETH transaction confirmed:', receipt?.hash);
      console.log('⛽ Gas used:', receipt?.gasUsed?.toString());
      console.log('⛽ Gas price:', receipt?.gasPrice?.toString());

      return {
        success: true,
        txHash: tx.hash,
        message: `Transaction sent successfully! Hash: ${tx.hash}`,
        fromAddress: params.fromAddress,
        toAddress: params.toAddress,
        amount: params.amountETH,
        network: params.network,
        gasUsed: receipt?.gasUsed?.toString(),
        gasPrice: receipt?.gasPrice?.toString()
      };

    } catch (error: any) {
      console.error('❌ ETH transaction failed:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
        message: error.message || 'Failed to send ETH transaction',
        fromAddress: params.fromAddress,
        toAddress: params.toAddress,
        amount: params.amountETH,
        network: params.network
      };
    }
  }

  /**
   * Get provider for the specified network
   */
  private getProvider(network: 'mainnet' | 'sepolia' | 'goerli'): ethers.Provider {
    const rpcUrls = {
      mainnet: 'https://eth-mainnet.g.alchemy.com/v2/demo', // Replace with your RPC URL
      sepolia: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY', // Replace with your Infura key
      goerli: 'https://goerli.infura.io/v3/YOUR_INFURA_KEY' // Replace with your Infura key
    };

    return new ethers.JsonRpcProvider(rpcUrls[network]);
  }

  /**
   * Get wallet from private key or mnemonic
   */
  private async getWallet(params: ETHSendParams, provider: ethers.Provider): Promise<ethers.Wallet> {
    if (params.privateKey) {
      // Use private key if provided
      return new ethers.Wallet(params.privateKey, provider);
    } else if (params.mnemonic) {
      // Derive wallet from mnemonic
      return ethers.Wallet.fromPhrase(params.mnemonic, provider);
    } else {
      throw new Error('Either private key or mnemonic must be provided');
    }
  }

  /**
   * Estimate transaction fee
   */
  async estimateFee(
    fromAddress: string, 
    toAddress: string, 
    amountETH: number, 
    network: 'mainnet' | 'sepolia' | 'goerli'
  ): Promise<{ gasLimit: string; gasPrice: string; estimatedFeeETH: string }> {
    try {
      const provider = this.getProvider(network);
      
      // Estimate gas for the transaction
      const gasEstimate = await provider.estimateGas({
        to: toAddress,
        from: fromAddress,
        value: ethers.parseEther(amountETH.toString())
      });

      // Get current gas price
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');
      
      // Calculate estimated fee in ETH
      const estimatedFeeWei = gasEstimate * gasPrice;
      const estimatedFeeETH = ethers.formatEther(estimatedFeeWei);

      return {
        gasLimit: gasEstimate.toString(),
        gasPrice: gasPrice.toString(),
        estimatedFeeETH: estimatedFeeETH
      };
    } catch (error) {
      console.error('Error estimating fee:', error);
      throw new Error('Failed to estimate transaction fee');
    }
  }

  /**
   * Validate Ethereum address
   */
  isValidAddress(address: string): boolean {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  }

  /**
   * Get current gas price
   */
  async getCurrentGasPrice(network: 'mainnet' | 'sepolia' | 'goerli'): Promise<string> {
    try {
      const provider = this.getProvider(network);
      const feeData = await provider.getFeeData();
      return ethers.formatUnits(feeData.gasPrice || 0, 'gwei');
    } catch (error) {
      console.error('Error getting gas price:', error);
      return '20'; // Default gas price in gwei
    }
  }
}
