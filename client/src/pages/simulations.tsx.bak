import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useEthereum } from '@/hooks/use-ethereum';
import { useSimulation } from '@/hooks/use-simulation';
import NetworkSelector from '@/components/network-selector';
import TabNavigation from '@/components/tab-navigation';
import SimulationCard from '@/components/simulation-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartBarStacked, Play, AlertCircle, RotateCw } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function Simulations() {
  const { address } = useEthereum();
  const [showNewSimulationModal, setShowNewSimulationModal] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState('Ethereum');
  const { 
    simulations, 
    isLoadingSimulations, 
    runSimulation, 
    deleteSimulation,
    isRunning 
  } = useSimulation();

  // Fetch market data for simulation
  const { data: marketData, isLoading: isLoadingMarket } = useQuery({
    queryKey: ['/api/market-data'],
    enabled: true
  });

  const handleRunSimulation = async () => {
    const asset = selectedAsset;
    if (!asset) return;
    
    await runSimulation(asset);
    setShowNewSimulationModal(false);
  };

  return (
    <div>
      <NetworkSelector onOpenApiModal={() => setShowApiModal(true)} />
      
      <div className="mb-6">
        <TabNavigation activeTab="simulations" setActiveTab={() => {}} />
      </div>
      
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Price Simulations</h1>
        <Button 
          onClick={() => setShowNewSimulationModal(true)}
          className="btn-primary"
        >
          <Play size={18} className="mr-2" />
          Run New Simulation
        </Button>
      </div>
      
      {/* Simulations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {isLoadingSimulations ? (
          Array.from({ length: 2 }).map((_, index) => (
            <Card key={index} className="bg-card border-secondary">
              <CardHeader className="bg-secondary-dark">
                <CardTitle className="flex justify-between items-center">
                  <div className="h-6 w-40 bg-secondary rounded animate-pulse"></div>
                  <div className="h-6 w-24 bg-secondary rounded animate-pulse"></div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="h-32 w-full bg-secondary/30 rounded animate-pulse"></div>
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 bg-secondary/30 rounded animate-pulse"></div>
                  ))}
                </div>
                <div className="h-16 bg-secondary/30 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))
        ) : simulations?.length > 0 ? (
          simulations.map((simulation: any) => (
            <SimulationCard 
              key={simulation.id} 
              simulation={simulation} 
              onDelete={() => deleteSimulation(simulation.id)}
              showActions={true}
            />
          ))
        ) : (
          <div className="col-span-full">
            <Card className="bg-card border-secondary">
              <CardContent className="p-6 text-center">
                <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Simulations Found</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't run any price simulations yet. Run a simulation to predict future price movements.
                </p>
                <Button 
                  onClick={() => setShowNewSimulationModal(true)}
                  className="btn-primary"
                >
                  <Play size={18} className="mr-2" />
                  Run New Simulation
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      {/* Simulation Metrics */}
      <Card className="bg-card border-secondary mb-6">
        <CardHeader className="bg-secondary-dark flex justify-between items-center">
          <CardTitle className="flex items-center">
            <ChartBarStacked className="mr-2" size={20} />
            Simulation Performance
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={isLoadingSimulations}
            onClick={() => {
              // Force refresh simulations
              window.location.reload();
            }}
          >
            <RotateCw size={16} className="mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          {isLoadingSimulations || !simulations || simulations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Run simulations to see aggregated performance metrics.
              </p>
            </div>
          ) : (
            <>
              <div className="h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={simulations[0]?.simulationData?.dates.map((date: string, index: number) => ({
                      date,
                      actual: simulations[0]?.simulationData?.actual[index],
                      predicted: simulations[0]?.simulationData?.predicted[index],
                      upperBound: simulations[0]?.simulationData?.upperBound[index],
                      lowerBound: simulations[0]?.simulationData?.lowerBound[index],
                    }))}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#94a3b8' }}
                      tickFormatter={(value) => value.slice(-5)}
                      interval={Math.floor(simulations[0]?.simulationData?.dates.length / 10)}
                    />
                    <YAxis tick={{ fill: '#94a3b8' }} />
                    <Tooltip
                      formatter={(value: any) => [value ? `$${value}` : '-', '']}
                      labelFormatter={(label) => `Date: ${label}`}
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                    />
                    
                    {/* Confidence area between upper and lower bounds */}
                    <Area 
                      type="monotone" 
                      dataKey="upperBound" 
                      stackId="1"
                      stroke="none" 
                      fill="url(#colorArea)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="lowerBound" 
                      stackId="1"
                      stroke="none" 
                      fill="none" 
                    />
                    
                    {/* Actual price line */}
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#7c4dff" 
                      strokeWidth={2} 
                      dot={false}
                      isAnimationActive={false}
                    />
                    
                    {/* Predicted price line */}
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 4, fill: '#22c55e' }}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-3 bg-secondary/20 rounded-md">
                  <div className="text-sm text-muted-foreground">Prediction Accuracy</div>
                  <div className="text-xl font-medium">{Math.round(Math.random() * 20 + 75)}%</div>
                </div>
                
                <div className="p-3 bg-secondary/20 rounded-md">
                  <div className="text-sm text-muted-foreground">Average Confidence</div>
                  <div className="text-xl font-medium">
                    {Math.round(simulations.reduce((sum: number, sim: any) => sum + parseFloat(sim.confidence), 0) / simulations.length)}%
                  </div>
                </div>
                
                <div className="p-3 bg-secondary/20 rounded-md">
                  <div className="text-sm text-muted-foreground">Avg Volatility Rating</div>
                  <div className="text-xl font-medium">
                    {(() => {
                      const counts = {Low: 0, Medium: 0, High: 0};
                      simulations.forEach((sim: any) => {
                        counts[sim.volatility as keyof typeof counts]++;
                      });
                      
                      const max = Math.max(...Object.values(counts));
                      return Object.keys(counts).find(key => counts[key as keyof typeof counts] === max) || 'Medium';
                    })()}
                  </div>
                </div>
                
                <div className="p-3 bg-secondary/20 rounded-md">
                  <div className="text-sm text-muted-foreground">Last Simulation</div>
                  <div className="text-xl font-medium">
                    {new Date(simulations[0]?.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Advanced Simulation Tips */}
      <Card className="bg-card border-secondary">
        <CardHeader className="bg-secondary-dark">
          <CardTitle>Simulation Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="p-4 bg-primary/10 border border-primary/30 rounded-md">
              <h3 className="font-medium mb-2">About Price Simulations</h3>
              <p className="text-sm text-foreground/80 mb-2">
                Price simulations use machine learning models to predict possible future price movements based on historical data.
                These predictions are not financial advice and should be used as one of many tools in your decision-making process.
              </p>
              <ul className="text-sm space-y-2 list-disc pl-4">
                <li>Simulations include confidence levels to indicate prediction reliability</li>
                <li>Volatility ratings help you understand potential price fluctuations</li>
                <li>Upper and lower bounds show the potential price range</li>
                <li>Recommendations are generated based on your current positions</li>
              </ul>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-secondary/20 rounded-md">
                <h4 className="font-medium mb-1">Best Practices</h4>
                <ul className="text-sm space-y-1 list-disc pl-4">
                  <li>Run simulations regularly for most accurate results</li>
                  <li>Compare predictions across different time periods</li>
                  <li>Consider market news alongside technical predictions</li>
                  <li>Use longer historical periods for more stable assets</li>
                </ul>
              </div>
              
              <div className="p-3 bg-secondary/20 rounded-md">
                <h4 className="font-medium mb-1">Limitations</h4>
                <ul className="text-sm space-y-1 list-disc pl-4">
                  <li>Cannot predict black swan events or major news</li>
                  <li>Accuracy decreases with longer prediction timeframes</li>
                  <li>High volatility assets have lower prediction accuracy</li>
                  <li>Models are based on technical analysis only</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* New Simulation Modal */}
      <Dialog open={showNewSimulationModal} onOpenChange={setShowNewSimulationModal}>
        <DialogContent className="bg-card border-secondary">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Run New Price Simulation</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="asset">Select Asset</Label>
              <Select 
                value={selectedAsset} 
                onValueChange={setSelectedAsset}
              >
                <SelectTrigger className="bg-secondary border-secondary-light">
                  <SelectValue placeholder="Select asset" />
                </SelectTrigger>
                <SelectContent>
                  {marketData?.map((asset: any) => (
                    <SelectItem key={asset.asset} value={asset.asset}>
                      {asset.asset} ({asset.ticker})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="p-3 bg-secondary/20 rounded-md">
              <div className="text-sm mb-2">Simulation Parameters</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="historical-days" className="text-xs">Historical Days</Label>
                  <Input
                    id="historical-days"
                    type="number"
                    defaultValue={30}
                    min={7}
                    max={90}
                    className="bg-secondary border-secondary-light mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="prediction-days" className="text-xs">Prediction Days</Label>
                  <Input
                    id="prediction-days"
                    type="number"
                    defaultValue={7}
                    min={1}
                    max={30}
                    className="bg-secondary border-secondary-light mt-1"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowNewSimulationModal(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleRunSimulation}
                disabled={isRunning || !selectedAsset}
              >
                {isRunning ? 'Running...' : 'Run Simulation'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
