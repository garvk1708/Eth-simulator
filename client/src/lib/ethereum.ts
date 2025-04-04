import { ethers } from 'ethers';

// Network configurations
export const NETWORKS = {
  ethereum: {
    chainId: '0x1',
    name: 'Ethereum Mainnet',
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io',
    rpcUrl: 'https://mainnet.infura.io/v3/'
  },
  polygon: {
    chainId: '0x89',
    name: 'Polygon Mainnet',
    currency: 'MATIC',
    explorerUrl: 'https://polygonscan.com',
    rpcUrl: 'https://polygon-rpc.com/'
  },
  arbitrum: {
    chainId: '0xa4b1',
    name: 'Arbitrum One',
    currency: 'ETH',
    explorerUrl: 'https://arbiscan.io',
    rpcUrl: 'https://arb1.arbitrum.io/rpc'
  },
  optimism: {
    chainId: '0xa',
    name: 'Optimism',
    currency: 'ETH',
    explorerUrl: 'https://optimistic.etherscan.io',
    rpcUrl: 'https://mainnet.optimism.io'
  },
  avalanche: {
    chainId: '0xa86a',
    name: 'Avalanche C-Chain',
    currency: 'AVAX',
    explorerUrl: 'https://snowtrace.io',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc'
  }
};

// Check if MetaMask is installed
export function isMetaMaskInstalled(): boolean {
  return typeof window !== 'undefined' && !!window.ethereum;
}

// Format blockchain address to display format (0x1234...5678)
export function formatAddress(address: string | null, charsToShow = 4): string {
  if (!address) return '';
  return `${address.substring(0, charsToShow + 2)}...${address.substring(address.length - charsToShow)}`;
}

// Format Ether value with specified decimals
export function formatEther(value: string | number, decimals = 4): string {
  if (typeof value === 'string') {
    const numValue = parseFloat(value);
    return numValue.toFixed(decimals);
  }
  return value.toFixed(decimals);
}

// Format percentage values
export function formatPercentage(value: string | number, includeSign = true): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  const formatted = Math.abs(numValue).toFixed(1);
  const sign = includeSign ? (numValue >= 0 ? '+' : '-') : '';
  return `${sign}${formatted}%`;
}

// Check if a string is a valid Ethereum address
export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address);
}

// Get explorer URL for an address or transaction
export function getExplorerUrl(chainId: number, hash: string, type: 'address' | 'tx' = 'address'): string {
  // Convert chainId to hex to match our network config
  const chainIdHex = `0x${chainId.toString(16)}`;
  
  // Find the network
  const network = Object.values(NETWORKS).find(net => net.chainId === chainIdHex);
  
  if (!network) {
    return `https://etherscan.io/${type}/${hash}`; // Default to Ethereum
  }
  
  return `${network.explorerUrl}/${type}/${hash}`;
}

// Format token amount based on decimals
export function formatTokenAmount(amount: string | number, decimals = 18, displayDecimals = 4): string {
  if (typeof amount === 'string') {
    try {
      // Parse the string to ensure it's a valid number
      const numAmount = parseFloat(amount);
      
      // For very large or small numbers, use exponential notation
      if (numAmount > 1e9 || (numAmount < 1e-3 && numAmount > 0)) {
        return numAmount.toExponential(displayDecimals);
      }
      
      return numAmount.toFixed(displayDecimals);
    } catch (e) {
      return '0';
    }
  }
  
  // For very large or small numbers, use exponential notation
  if (amount > 1e9 || (amount < 1e-3 && amount > 0)) {
    return amount.toExponential(displayDecimals);
  }
  
  return amount.toFixed(displayDecimals);
}
