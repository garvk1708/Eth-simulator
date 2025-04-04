import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useEthereum } from '@/hooks/use-ethereum';
import NetworkSelector from '@/components/network-selector';
import MarketOverview from '@/components/market-overview';
import TabNavigation from '@/components/tab-navigation';
import PositionTable from '@/components/position-table';
import PortfolioChart from '@/components/portfolio-chart';
import SmartContractCard from '@/components/smart-contract-card';
import SimulationCard from '@/components/simulation-card';
import ApiIntegrationCard from '@/components/api-integration-card';
import { ApiIntegration } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Home() {
  const { address } = useEthereum();
  const [activeTab, setActiveTab] = useState<string>('positions');
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiName, setApiName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch market data
  const { data: marketData, isLoading: isLoadingMarket } = useQuery({
    queryKey: ['/api/market-data'],
    enabled: true
  });

  // Fetch positions
  const { data: positions, isLoading: isLoadingPositions } = useQuery({
    queryKey: ['/api/positions', address],
    queryFn: async () => {
      const response = await fetch(`/api/positions?userId=1`); // In a real app, use actual userId
      if (!response.ok) throw new Error('Failed to fetch positions');
      return response.json();
    },
    enabled: !!address
  });

  // Fetch smart contracts
  const { data: smartContracts, isLoading: isLoadingContracts } = useQuery({
    queryKey: ['/api/smart-contracts', address],
    queryFn: async () => {
      const response = await fetch(`/api/smart-contracts?userId=1`); // In a real app, use actual userId
      if (!response.ok) throw new Error('Failed to fetch smart contracts');
      return response.json();
    },
    enabled: !!address
  });

  // Fetch simulations
  const { data: simulations, isLoading: isLoadingSimulations } = useQuery({
    queryKey: ['/api/simulations', address],
    queryFn: async () => {
      const response = await fetch(`/api/simulations?userId=1`); // In a real app, use actual userId
      if (!response.ok) throw new Error('Failed to fetch simulations');
      return response.json();
    },
    enabled: !!address
  });

  // Fetch API integrations
  const { data: apiIntegrations, isLoading: isLoadingApis } = useQuery({
    queryKey: ['/api/api-integrations', address],
    queryFn: async () => {
      const response = await fetch(`/api/api-integrations?userId=1`); // In a real app, use actual userId
      if (!response.ok) throw new Error('Failed to fetch API integrations');
      return response.json();
    },
    enabled: !!address
  });

  // Handle API integration form submission
  const handleApiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiRequest('POST', '/api/api-integrations', {
        userId: 1, // In a real app, use actual userId
        name: apiName,
        apiKey,
        apiUrl,
        description: `API integration for ${apiName}`,
        status: 'Connected'
      });

      toast({
        title: 'API Integration Added',
        description: `Successfully connected to ${apiName} API`
      });

      // Reset form and close modal
      setApiName('');
      setApiKey('');
      setApiUrl('');
      setShowApiModal(false);
      
      // Refresh API integrations
      await fetch(`/api/api-integrations?userId=1`);
      
    } catch (error) {
      toast({
        title: 'Error Adding API',
        description: 'Failed to add API integration',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <NetworkSelector onOpenApiModal={() => setShowApiModal(true)} />
      
      {/* Market Overview Cards */}
      <MarketOverview marketData={marketData} isLoading={isLoadingMarket} />
      
      {/* Tab Navigation */}
      <div className="mb-6">
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      
      {/* Tab Content */}
      <div className="grid grid-cols-1 gap-6">
        {/* Positions Content - Default Tab */}
        {activeTab === 'positions' && (
          <>
            {/* Position Table */}
            <PositionTable positions={positions} isLoading={isLoadingPositions} />
            
            {/* Position Analysis Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Portfolio Performance Chart */}
              <div className="lg:col-span-2">
                <PortfolioChart positions={positions} isLoading={isLoadingPositions} />
              </div>
              
              {/* Smart Contract Integration Card */}
              <div>
                <SmartContractCard 
                  smartContracts={smartContracts} 
                  isLoading={isLoadingContracts} 
                />
              </div>
            </div>
            
            {/* Simulation & API Integration Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Simulation Card */}
              <SimulationCard 
                simulations={simulations?.[0]} 
                isLoading={isLoadingSimulations} 
              />
              
              {/* API Integration Card */}
              <ApiIntegrationCard 
                apiIntegrations={apiIntegrations as ApiIntegration[]} 
                isLoading={isLoadingApis}
                onOpenApiModal={() => setShowApiModal(true)} 
              />
            </div>
          </>
        )}
        
        {/* Other tabs would render their content here */}
        {activeTab === 'trading' && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Trading Interface</h2>
            </div>
            <div className="card-content">
              <p className="text-muted-foreground">Visit the Trading page for full trading functionality.</p>
            </div>
          </div>
        )}
        
        {activeTab === 'analytics' && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Analytics Dashboard</h2>
            </div>
            <div className="card-content">
              <p className="text-muted-foreground">Visit the Analytics page for detailed analytics.</p>
            </div>
          </div>
        )}
        
        {activeTab === 'smart-contracts' && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Smart Contracts</h2>
            </div>
            <div className="card-content">
              <p className="text-muted-foreground">Visit the Smart Contracts page for detailed contract management.</p>
            </div>
          </div>
        )}
        
        {activeTab === 'simulations' && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Simulations</h2>
            </div>
            <div className="card-content">
              <p className="text-muted-foreground">Visit the Simulations page for detailed simulation features.</p>
            </div>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Settings</h2>
            </div>
            <div className="card-content">
              <p className="text-muted-foreground">Visit the Settings page to configure your preferences.</p>
            </div>
          </div>
        )}
      </div>
      
      {/* API Integration Modal */}
      <Dialog open={showApiModal} onOpenChange={setShowApiModal}>
        <DialogContent className="bg-card border border-secondary">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Configure API Integration</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleApiSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-name">API Name</Label>
              <Input
                id="api-name"
                placeholder="CoinGecko, Etherscan, etc."
                value={apiName}
                onChange={(e) => setApiName(e.target.value)}
                required
                className="bg-secondary border-secondary-light"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                placeholder="Your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
                className="bg-secondary border-secondary-light"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="api-url">API URL (Optional)</Label>
              <Input
                id="api-url"
                placeholder="https://api.example.com"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="bg-secondary border-secondary-light"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowApiModal(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !apiName || !apiKey}
              >
                {isSubmitting ? 'Connecting...' : 'Connect API'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
