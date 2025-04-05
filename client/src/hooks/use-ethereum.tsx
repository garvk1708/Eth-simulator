import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

type NetworkType = 'ethereum' | 'polygon' | 'arbitrum' | 'optimism' | 'avalanche';

interface EthereumContextType {
  isConnected: boolean;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  address: string | null;
  network: NetworkType;
  balance: string | null;
  chainId: number | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (network: NetworkType) => Promise<void>;
  isConnecting: boolean;
}

const networks = {
  ethereum: {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.infura.io/v3/'],
    blockExplorerUrls: ['https://etherscan.io'],
  },
  polygon: {
    chainId: '0x89',
    chainName: 'Polygon Mainnet',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://polygonscan.com'],
  },
  arbitrum: {
    chainId: '0xa4b1',
    chainName: 'Arbitrum One',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://arbiscan.io'],
  },
  optimism: {
    chainId: '0xa',
    chainName: 'Optimism',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.optimism.io'],
    blockExplorerUrls: ['https://optimistic.etherscan.io'],
  },
  avalanche: {
    chainId: '0xa86a',
    chainName: 'Avalanche C-Chain',
    nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://snowtrace.io'],
  },
};

const EthereumContext = createContext<EthereumContextType | undefined>(undefined);

export function EthereumProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [network, setNetwork] = useState<NetworkType>('ethereum');
  const [isConnecting, setIsConnecting] = useState(false);

  const { toast } = useToast();

  const updateUserData = useCallback(async () => {
    if (!provider || !signer) return;

    try {
      const address = await signer.getAddress();
      setAddress(address);

      const balance = await provider.getBalance(address);
      setBalance(ethers.formatEther(balance));

      const network = await provider.getNetwork();
      setChainId(Number(network.chainId));

      // Determine the current network based on chainId
      const chainIdHex = `0x${network.chainId.toString(16)}`;
      Object.entries(networks).forEach(([networkName, networkData]) => {
        if (networkData.chainId === chainIdHex) {
          setNetwork(networkName as NetworkType);
        }
      });
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  }, [provider, signer]);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    try {
      if (!window.ethereum) {
        toast({
          title: 'MetaMask not found',
          description: 'Please install MetaMask extension to connect your wallet.',
          variant: 'destructive',
        });
        return;
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      setProvider(provider);
      setSigner(signer);

      toast({
        title: 'Wallet connected',
        description: 'Your Ethereum wallet has been successfully connected',
      });

      // Update address and balance after connecting
      await updateUserData();
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast({
        title: 'Connection failed',
        description: error.message || 'Failed to connect wallet',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  }, [updateUserData, toast]);

  const disconnectWallet = useCallback(async () => {
    if (window.ethereum) {
      try {
        // Clear MetaMask connection
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }]
        });
        await window.ethereum.request({
          method: 'eth_requestAccounts',
          params: [[]],
        });
      } catch (error) {
        console.error('Error disconnecting wallet:', error);
      }
    }
    
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setBalance(null);
    setChainId(null);
    
    toast({
      title: 'Wallet disconnected',
      description: 'Your wallet has been disconnected',
    });
  }, [toast]);

  const switchNetwork = useCallback(async (networkName: NetworkType) => {
    if (!window.ethereum || !provider) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    const networkConfig = networks[networkName];

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkConfig.chainId }],
      });
      
      // Update the state to reflect the new network
      setNetwork(networkName);
      
      // Update user data after switching network
      await updateUserData();
      
      toast({
        title: 'Network switched',
        description: `Switched to ${networkConfig.chainName}`,
      });
    } catch (error: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfig],
          });
          
          // Update the state to reflect the new network
          setNetwork(networkName);
          
          // Update user data after adding network
          await updateUserData();
          
          toast({
            title: 'Network added',
            description: `${networkConfig.chainName} has been added to your wallet`,
          });
        } catch (addError: any) {
          console.error('Error adding network:', addError);
          toast({
            title: 'Failed to add network',
            description: addError.message || 'An error occurred while adding the network',
            variant: 'destructive',
          });
        }
      } else {
        console.error('Error switching network:', error);
        toast({
          title: 'Failed to switch network',
          description: error.message || 'An error occurred while switching networks',
          variant: 'destructive',
        });
      }
    }
  }, [provider, updateUserData, toast]);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          disconnectWallet();
        } else if (accounts[0] !== address) {
          // User switched accounts
          updateUserData();
        }
      };

      const handleChainChanged = () => {
        // When the chain changes, we need to update provider and user data
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [address, disconnectWallet, updateUserData]);

  // Check if the user already has an active wallet session
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            
            setProvider(provider);
            setSigner(signer);
            
            // Update address and balance
            await updateUserData();
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkConnection();
  }, [updateUserData]);

  const isConnected = !!address;

  const contextValue: EthereumContextType = {
    isConnected,
    provider,
    signer,
    address,
    network,
    balance,
    chainId,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    isConnecting,
  };

  return (
    <EthereumContext.Provider value={contextValue}>
      {children}
    </EthereumContext.Provider>
  );
}

export function useEthereum() {
  const context = useContext(EthereumContext);
  if (context === undefined) {
    throw new Error('useEthereum must be used within an EthereumProvider');
  }
  return context;
}
