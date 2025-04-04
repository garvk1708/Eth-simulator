import { useState } from 'react';
import { useEthereum } from '@/hooks/use-ethereum';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { formatAddress } from '@/lib/ethereum';
import { Wallet, ChevronDown } from 'lucide-react';

interface WalletConnectProps {
  showOnConnect?: boolean;
}

export default function WalletConnect({ showOnConnect = true }: WalletConnectProps) {
  const { isConnected, address, connectWallet, disconnectWallet, balance, isConnecting } = useEthereum();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleConnectWallet = () => {
    setShowWalletModal(true);
  };

  const handleWalletConnect = async (provider: string) => {
    try {
      await connectWallet();
      setShowWalletModal(false);
    } catch (error) {
      console.error(`Error connecting with ${provider}:`, error);
    }
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  if (!isConnected) {
    return (
      <>
        <Button
          variant="default"
          className="btn-primary"
          onClick={handleConnectWallet}
        >
          <Wallet size={20} className="mr-2" />
          <span>Connect Wallet</span>
        </Button>

        <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
          <DialogContent className="bg-card border border-secondary max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">Connect Wallet</DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Connect with one of our available wallet providers or create a new one.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <button
                className="w-full flex items-center justify-between bg-secondary hover:bg-secondary-light p-3 rounded-md transition-colors"
                onClick={() => handleWalletConnect('MetaMask')}
                disabled={isConnecting}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-md flex items-center justify-center">
                    <svg viewBox="0 0 40 40" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M36.25 20a16.23 16.23 0 0 1-3.493 10.044l-.54.705a16.25 16.25 0 0 1-25.46.004 16.236 16.236 0 0 1-.506-.653A16.25 16.25 0 0 1 36.25 20Z" fill="#F5841F"/>
                      <path d="m19.997 8.751 6.105 10.271-10.07-2.796 3.965-7.475Z" fill="#E17726" stroke="#E17726" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="m19.997 8.751-4 7.56-9.934 2.706 13.933-10.266Z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="m11.997 22.63 3.66 6.906h-7.87l4.21-6.905Z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="m27.997 22.63-4.22 6.923 7.88-.017-3.66-6.905Z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="m16.102 16.312-3.66 6.317 8.31-5.9-4.65-.418Z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="m23.892 16.312-4.67.418 8.329 5.9-3.66-6.318Z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span>MetaMask</span>
                </div>
                <ChevronDown size={20} />
              </button>
              
              <button
                className="w-full flex items-center justify-between bg-secondary hover:bg-secondary-light p-3 rounded-md transition-colors"
                onClick={() => handleWalletConnect('WalletConnect')}
                disabled={isConnecting}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-md flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 40c11.046 0 20-8.954 20-20S31.046 0 20 0 0 8.954 0 20s8.954 20 20 20Z" fill="#3396FF"/>
                      <path d="M20 6.25c-7.811 0-14.205 6.15-14.608 13.883-.26.502.39.957.909.957h27.404c.519 0 .924-.455.908-.957-.402-7.734-6.796-13.883-14.608-13.883h-.005Z" fill="#fff"/>
                      <path d="M31.764 32.909a1.666 1.666 0 0 1-2.334-.256l-4.305-5.196A1.667 1.667 0 0 1 26.4 25c2.775 0 4.166-3.334 2.217-5.283a3.75 3.75 0 0 0-5.284 0 3.752 3.752 0 0 0 0 5.283 1.667 1.667 0 0 1-2.35 2.35 7.084 7.084 0 0 1 0-9.984 7.085 7.085 0 0 1 9.984 0A7.088 7.088 0 0 1 32.9 24.5a1.667 1.667 0 0 1-2.577 1.424 1.756 1.756 0 0 1-.338.482l4.035 4.87a1.667 1.667 0 0 1-.256 2.333z" fill="#fff"/>
                    </svg>
                  </div>
                  <span>WalletConnect</span>
                </div>
                <ChevronDown size={20} />
              </button>
              
              <button
                className="w-full flex items-center justify-between bg-secondary hover:bg-secondary-light p-3 rounded-md transition-colors"
                onClick={() => handleWalletConnect('Coinbase')}
                disabled={isConnecting}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-md flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="24" height="24" rx="12" fill="#0052FF"/>
                      <path d="M12 20c4.4 0 8-3.6 8-8s-3.6-8-8-8-8 3.6-8 8 3.6 8 8 8Z" fill="#0052FF"/>
                      <path d="M12 6.92c-2.8 0-5.08 2.28-5.08 5.08 0 2.8 2.28 5.08 5.08 5.08 2.8 0 5.08-2.28 5.08-5.08 0-2.8-2.28-5.08-5.08-5.08Zm0 8.2c-1.72 0-3.12-1.4-3.12-3.12 0-1.72 1.4-3.12 3.12-3.12 1.72 0 3.12 1.4 3.12 3.12 0 1.72-1.4 3.12-3.12 3.12Z" fill="white"/>
                    </svg>
                  </div>
                  <span>Coinbase Wallet</span>
                </div>
                <ChevronDown size={20} />
              </button>
            </div>
            
            <div className="mt-4 text-center text-xs text-muted-foreground">
              By connecting a wallet, you agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  if (isConnected && showOnConnect) {
    return (
      <div className="relative">
        <button 
          className="flex items-center space-x-2 bg-secondary hover:bg-secondary-light text-white px-3 py-2 rounded-md transition-colors"
          onClick={toggleUserMenu}
        >
          <div className="w-2 h-2 rounded-full bg-success"></div>
          <span className="font-mono text-sm">{formatAddress(address)}</span>
          <ChevronDown size={16} />
        </button>
        
        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-card border border-secondary rounded-md shadow-lg z-50">
            <div className="p-3 border-b border-secondary">
              <div className="text-sm text-muted-foreground">Balance</div>
              <div className="font-medium">{balance ? `${Number(balance).toFixed(4)} ETH` : '0 ETH'}</div>
            </div>
            <div className="p-2">
              <button 
                className="w-full text-left px-3 py-2 text-sm hover:bg-secondary rounded-md"
                onClick={disconnectWallet}
              >
                Disconnect Wallet
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
