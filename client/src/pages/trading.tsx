import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useEthereum } from '@/hooks/use-ethereum';
import { useToast } from '@/hooks/use-toast';
import { useTokenContract } from '@/hooks/use-contracts';
import NetworkSelector from '@/components/network-selector';
import TabNavigation from '@/components/tab-navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeftRight, ArrowDown, AlertCircle, Info, ChartBarStacked } from 'lucide-react';
import { formatAddress, isValidAddress } from '@/lib/ethereum';
import { ethers } from 'ethers';

export default function Trading() {
  const { address, provider, signer, balance } = useEthereum();
  const [tokenAddress, setTokenAddress] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [showApiModal, setShowApiModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  
  const { tokenData, fetchTokenData, isLoading: isLoadingToken, transfer } = useTokenContract(
    tokenAddress && isValidAddress(tokenAddress) ? tokenAddress : undefined
  );

  // Fetch positions for reference
  const { data: positions } = useQuery({
    queryKey: ['/api/positions', address],
    queryFn: async () => {
      const response = await fetch(`/api/positions?userId=1`); // In a real app, use actual userId
      if (!response.ok) throw new Error('Failed to fetch positions');
      return response.json();
    },
    enabled: !!address
  });

  // Fetch market data
  const { data: marketData } = useQuery({
    queryKey: ['/api/market-data'],
    enabled: true
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenAddress && isValidAddress(tokenAddress)) {
      fetchTokenData();
    } else {
      toast({
        title: 'Invalid Address',
        description: 'Please enter a valid Ethereum token address',
        variant: 'destructive'
      });
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !isValidAddress(recipient)) {
      toast({
        title: 'Invalid Recipient',
        description: 'Please enter a valid Ethereum address',
        variant: 'destructive'
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount to transfer',
        variant: 'destructive'
      });
      return;
    }

    setIsSending(true);
    try {
      // For native ETH transfer
      if (!tokenAddress) {
        if (!signer) throw new Error('Wallet not connected');
        
        const tx = await signer.sendTransaction({
          to: recipient,
          value: ethers.parseEther(amount)
        });
        
        await tx.wait();
        
        toast({
          title: 'Transfer Successful',
          description: `Successfully sent ${amount} ETH to ${formatAddress(recipient)}`
        });
      } 
      // For token transfer
      else if (tokenData) {
        await transfer(recipient, amount);
      }
      
      // Reset form
      setRecipient('');
      setAmount('');
      
    } catch (error: any) {
      console.error('Transfer error:', error);
      toast({
        title: 'Transfer Failed',
        description: error.message || 'An error occurred during the transfer',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      <NetworkSelector onOpenApiModal={() => setShowApiModal(true)} />
      
      <div className="mb-6">
        <TabNavigation activeTab="trading" setActiveTab={() => {}} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Trading Panel */}
        <div className="md:col-span-2">
          <Card className="bg-card border-secondary">
            <CardHeader className="bg-secondary-dark">
              <CardTitle className="flex items-center">
                <ArrowLeftRight className="mr-2" size={20} />
                Trading Interface
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Tabs defaultValue="send" className="w-full">
                <TabsList className="mb-4 w-full">
                  <TabsTrigger value="send" className="flex-1">Send</TabsTrigger>
                  <TabsTrigger value="swap" className="flex-1">Swap</TabsTrigger>
                  <TabsTrigger value="limit" className="flex-1">Limit Order</TabsTrigger>
                </TabsList>
                
                <TabsContent value="send">
                  <form onSubmit={handleTransfer} className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="token-address">Token Address (Optional for ETH)</Label>
                        <Badge variant="outline" className="text-xs">
                          {tokenData ? tokenData.symbol : 'ETH'}
                        </Badge>
                      </div>
                      <div className="flex">
                        <Input
                          id="token-address"
                          placeholder="0x... (leave empty for ETH)"
                          value={tokenAddress}
                          onChange={(e) => setTokenAddress(e.target.value)}
                          className="bg-secondary border-secondary-light"
                        />
                        <Button 
                          type="button" 
                          onClick={handleSearch} 
                          disabled={!tokenAddress || !isValidAddress(tokenAddress)}
                          className="ml-2"
                        >
                          Search
                        </Button>
                      </div>
                      
                      {isLoadingToken && (
                        <div className="mt-2">
                          <Skeleton className="h-4 w-full" />
                        </div>
                      )}
                      
                      {tokenData && (
                        <div className="mt-2 p-2 bg-secondary/30 rounded text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Name:</span>
                            <span>{tokenData.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Symbol:</span>
                            <span>{tokenData.symbol}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Balance:</span>
                            <span>{tokenData.balance} {tokenData.symbol}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="recipient">Recipient Address</Label>
                      <Input
                        id="recipient"
                        placeholder="0x..."
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        required
                        className="bg-secondary border-secondary-light"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="amount">Amount</Label>
                        {balance && !tokenAddress && (
                          <button 
                            type="button" 
                            className="text-xs text-primary hover:underline"
                            onClick={() => setAmount(ethers.formatEther(balance))}
                          >
                            Max: {Number(balance).toFixed(6)} ETH
                          </button>
                        )}
                        {tokenData && (
                          <button 
                            type="button" 
                            className="text-xs text-primary hover:underline"
                            onClick={() => setAmount(tokenData.balance)}
                          >
                            Max: {tokenData.balance} {tokenData.symbol}
                          </button>
                        )}
                      </div>
                      <Input
                        id="amount"
                        type="number"
                        step="any"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        className="bg-secondary border-secondary-light"
                      />
                    </div>
                    
                    <div className="flex justify-center py-4">
                      <ArrowDown size={24} className="text-muted-foreground" />
                    </div>
                    
                    <div className="p-3 bg-secondary/30 rounded">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Gas Estimate:</span>
                        <span>~0.0023 ETH ($7.45)</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Network Fee:</span>
                        <span>Regular (34 Gwei)</span>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={
                        isSending || 
                        !recipient || 
                        !amount || 
                        !parseFloat(amount) || 
                        (tokenAddress && !tokenData)
                      }
                      className="w-full"
                    >
                      {isSending ? 'Sending...' : `Send ${tokenData ? tokenData.symbol : 'ETH'}`}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="swap">
                  <div className="flex items-center justify-center h-40">
                    <div className="text-center">
                      <AlertCircle size={40} className="mx-auto mb-2 text-muted-foreground" />
                      <h3 className="text-lg font-medium">Swap Interface Coming Soon</h3>
                      <p className="text-sm text-muted-foreground">
                        Token swapping functionality will be available in the next update.
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="limit">
                  <div className="flex items-center justify-center h-40">
                    <div className="text-center">
                      <AlertCircle size={40} className="mx-auto mb-2 text-muted-foreground" />
                      <h3 className="text-lg font-medium">Limit Orders Coming Soon</h3>
                      <p className="text-sm text-muted-foreground">
                        Limit order functionality will be available in the next update.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Market Information */}
        <div>
          <Card className="bg-card border-secondary">
            <CardHeader className="bg-secondary-dark">
              <CardTitle className="flex items-center">
                <ChartBarStacked className="mr-2" size={20} />
                Market Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Market Data */}
                {marketData?.map((data: any) => (
                  <div 
                    key={data.asset} 
                    className="p-3 bg-secondary/20 rounded-md"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        data.asset === 'Ethereum' 
                          ? 'bg-primary/20' 
                          : 'bg-info/20'
                      }`}>
                        {data.asset === 'Ethereum' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="22" viewBox="0 0 24 24" fill="#7c4dff" fillOpacity="0.8">
                            <path d="M12 1.75l-6.25 10.5L12 16l6.25-3.75L12 1.75z M12 16l-6.25 3.75L12 22.25l6.25-2.5L12 16z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#3b82f6" fillOpacity="0.8">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{data.asset}</div>
                        <div className="text-xs text-muted-foreground">{data.ticker}</div>
                      </div>
                      <div className="ml-auto">
                        <div className="font-mono font-medium">${parseFloat(data.price).toFixed(2)}</div>
                        <div className={`text-xs flex items-center justify-end ${
                          parseFloat(data.change24h) >= 0 ? 'text-success' : 'text-destructive'
                        }`}>
                          {parseFloat(data.change24h) >= 0 ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="m6 9 6-6 6 6" />
                              <path d="M6 15h12" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="m6 15 6 6 6-6" />
                              <path d="M6 9h12" />
                            </svg>
                          )}
                          <span>{parseFloat(data.change24h).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Small chart placeholder */}
                    <div className="h-10 mt-2">
                      <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
                        <path 
                          d="M0,15 L10,10 L20,20 L30,15 L40,18 L50,5 L60,10 L70,5 L80,12 L90,7 L100,2" 
                          stroke={parseFloat(data.change24h) >= 0 ? "#22c55e" : "#ef4444"} 
                          strokeWidth="2" 
                          fill="none" 
                        />
                      </svg>
                    </div>
                  </div>
                ))}
                
                {/* Gas Price Info */}
                {marketData?.find((data: any) => data.asset === 'Ethereum')?.gasData && (
                  <div className="p-3 bg-secondary/20 rounded-md">
                    <div className="font-medium mb-2">Current Gas Prices</div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 bg-secondary-dark rounded text-center">
                        <div className="text-xs text-muted-foreground">Slow</div>
                        <div>
                          {marketData?.find((data: any) => data.asset === 'Ethereum')?.gasData.slow} Gwei
                        </div>
                      </div>
                      <div className="p-2 bg-secondary-dark rounded text-center">
                        <div className="text-xs text-muted-foreground">Average</div>
                        <div>
                          {marketData?.find((data: any) => data.asset === 'Ethereum')?.gasData.average} Gwei
                        </div>
                      </div>
                      <div className="p-2 bg-secondary-dark rounded text-center">
                        <div className="text-xs text-muted-foreground">Fast</div>
                        <div>
                          {marketData?.find((data: any) => data.asset === 'Ethereum')?.gasData.fast} Gwei
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Trading Tips */}
                <div className="p-3 bg-primary/10 border border-primary/30 rounded-md">
                  <div className="flex space-x-2">
                    <Info size={20} className="text-primary" />
                    <div>
                      <h4 className="font-medium">Trading Tip</h4>
                      <p className="text-sm text-foreground/80">
                        Always check gas prices before making transactions. Higher gas prices mean faster confirmations but higher fees.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
