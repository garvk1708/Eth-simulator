import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useEthereum } from '@/hooks/use-ethereum';
import ConnectWalletModal from '@/components/connect-wallet-modal';
import { Moon, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatAddress } from '@/lib/ethereum';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { isConnected, address, connectWallet, disconnectWallet, balance } = useEthereum();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleThemeToggle = () => {
    // Theme functionality would go here
    // For simplicity, we'll just use a dark theme consistently in this app
  };

  const handleConnectWallet = () => {
    setShowWalletModal(true);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-secondary px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary-light">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold">Ethereum Position System</h1>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            id="theme-toggle" 
            className="p-2 rounded-md hover:bg-secondary"
            onClick={handleThemeToggle}
          >
            <Moon size={20} />
          </button>
          
          {!isConnected ? (
            <Button 
              variant="default" 
              size="sm" 
              className="btn-primary"
              onClick={handleConnectWallet}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
              </svg>
              <span>Connect Wallet</span>
            </Button>
          ) : (
            <div className="relative">
              <button 
                className="flex items-center space-x-2 bg-secondary text-white px-3 py-2 rounded-md"
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
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-4 md:p-6">
        {children}
      </main>

      {/* Connect Wallet Modal */}
      {showWalletModal && (
        <ConnectWalletModal 
          isOpen={showWalletModal} 
          onClose={() => setShowWalletModal(false)} 
          onConnect={connectWallet}
        />
      )}
    </div>
  );
}
