import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useEthereum } from '@/hooks/use-ethereum';
import NetworkSelector from '@/components/network-selector';
import TabNavigation from '@/components/tab-navigation';
import PositionTable from '@/components/position-table';
import PortfolioChart from '@/components/portfolio-chart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Plus, RotateCw } from 'lucide-react';

export default function Positions() {
  const { address } = useEthereum();
  const [showAddPositionModal, setShowAddPositionModal] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [positionForm, setPositionForm] = useState({
    asset: '',
    ticker: '',
    amount: '',
    price: '',
    value: '',
    change24h: '',
    contractAddress: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch positions
  const { data: positions, isLoading: isLoadingPositions, refetch: refetchPositions } = useQuery({
    queryKey: ['/api/positions', address],
    queryFn: async () => {
      const response = await fetch(`/api/positions?userId=1`); // In a real app, use actual userId
      if (!response.ok) throw new Error('Failed to fetch positions');
      return response.json();
    },
    enabled: !!address
  });

  // Fetch market data
  const { data: marketData, isLoading: isLoadingMarket } = useQuery({
    queryKey: ['/api/market-data'],
    enabled: true
  });

  const handleAddPosition = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const value = parseFloat(positionForm.amount) * parseFloat(positionForm.price);
      
      await apiRequest('POST', '/api/positions', {
        userId: 1, // In a real app, use actual userId
        asset: positionForm.asset,
        ticker: positionForm.ticker,
        amount: positionForm.amount,
        value: value.toString(),
        price: positionForm.price,
        change24h: positionForm.change24h || '0',
        contractAddress: positionForm.contractAddress || null
      });

      toast({
        title: 'Position Added',
        description: `Successfully added ${positionForm.amount} ${positionForm.ticker}`
      });

      // Reset form and close modal
      setPositionForm({
        asset: '',
        ticker: '',
        amount: '',
        price: '',
        value: '',
        change24h: '',
        contractAddress: ''
      });
      setShowAddPositionModal(false);
      
      // Refresh positions
      refetchPositions();
      
    } catch (error) {
      toast({
        title: 'Error Adding Position',
        description: 'Failed to add position',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <NetworkSelector onOpenApiModal={() => setShowApiModal(true)} />
      
      <div className="mb-6">
        <TabNavigation activeTab="positions" setActiveTab={() => {}} />
      </div>
      
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Positions</h1>
        <Button 
          onClick={() => setShowAddPositionModal(true)}
          className="btn-primary"
        >
          <Plus size={18} className="mr-2" />
          Add New Position
        </Button>
      </div>
      
      {/* Position Table */}
      <PositionTable 
        positions={positions} 
        isLoading={isLoadingPositions} 
        onRefresh={refetchPositions}
      />
      
      {/* Portfolio Performance Chart */}
      <div className="mt-6">
        <PortfolioChart positions={positions} isLoading={isLoadingPositions} />
      </div>
      
      {/* Historical Performance Section */}
      <div className="mt-6 card">
        <div className="card-header">
          <h2 className="card-title">Position Performance History</h2>
          <Button variant="outline" size="sm" onClick={() => refetchPositions()}>
            <RotateCw size={16} className="mr-2" />
            Refresh
          </Button>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-secondary/20 rounded-md">
              <div className="text-sm text-muted-foreground">Daily Change</div>
              <div className="text-xl font-medium text-success">+5.3%</div>
              <div className="text-xs text-muted-foreground">+$673.89</div>
            </div>
            
            <div className="p-3 bg-secondary/20 rounded-md">
              <div className="text-sm text-muted-foreground">Weekly Change</div>
              <div className="text-xl font-medium text-success">+12.7%</div>
              <div className="text-xs text-muted-foreground">+$1,573.42</div>
            </div>
            
            <div className="p-3 bg-secondary/20 rounded-md">
              <div className="text-sm text-muted-foreground">Monthly Change</div>
              <div className="text-xl font-medium text-success">+28.4%</div>
              <div className="text-xs text-muted-foreground">+$3,286.15</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Position Modal */}
      <Dialog open={showAddPositionModal} onOpenChange={setShowAddPositionModal}>
        <DialogContent className="bg-card border border-secondary">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Add New Position</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleAddPosition} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="asset">Asset Name</Label>
                <Input
                  id="asset"
                  placeholder="Ethereum, Bitcoin, etc."
                  value={positionForm.asset}
                  onChange={(e) => setPositionForm({...positionForm, asset: e.target.value})}
                  required
                  className="bg-secondary border-secondary-light"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ticker">Ticker Symbol</Label>
                <Input
                  id="ticker"
                  placeholder="ETH, BTC, etc."
                  value={positionForm.ticker}
                  onChange={(e) => setPositionForm({...positionForm, ticker: e.target.value})}
                  required
                  className="bg-secondary border-secondary-light"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={positionForm.amount}
                  onChange={(e) => setPositionForm({...positionForm, amount: e.target.value})}
                  required
                  className="bg-secondary border-secondary-light"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Price (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={positionForm.price}
                  onChange={(e) => setPositionForm({...positionForm, price: e.target.value})}
                  required
                  className="bg-secondary border-secondary-light"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contractAddress">Contract Address (Optional)</Label>
              <Input
                id="contractAddress"
                placeholder="0x..."
                value={positionForm.contractAddress}
                onChange={(e) => setPositionForm({...positionForm, contractAddress: e.target.value})}
                className="bg-secondary border-secondary-light"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowAddPositionModal(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !positionForm.asset || !positionForm.ticker || !positionForm.amount || !positionForm.price}
              >
                {isSubmitting ? 'Adding...' : 'Add Position'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
