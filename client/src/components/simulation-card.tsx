import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Play, Trash2, Info } from 'lucide-react';
import { Simulation } from '@shared/schema';

interface SimulationCardProps {
  simulation?: Simulation;
  isLoading?: boolean;
  onDelete?: (id: number) => void;
  showActions?: boolean;
}

export default function SimulationCard({ 
  simulation, 
  isLoading = false, 
  onDelete,
  showActions = false
}: SimulationCardProps) {
  const formatChartData = (simulationData: any) => {
    if (!simulationData) return [];
    
    return simulationData.dates.map((date: string, index: number) => ({
      date,
      actual: simulationData.actual[index],
      predicted: simulationData.predicted[index],
      upperBound: simulationData.upperBound[index],
      lowerBound: simulationData.lowerBound[index],
    }));
  };
  
  return (
    <Card className="bg-card border-secondary">
      <CardHeader className="bg-secondary-dark flex justify-between items-center">
        <CardTitle className="font-semibold">
          {isLoading ? (
            <Skeleton className="h-6 w-40" />
          ) : (
            simulation ? `${simulation.asset} Price Prediction` : 'Simulation Data'
          )}
        </CardTitle>
        
        {!isLoading && showActions && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (simulation && onDelete) {
                onDelete(simulation.id);
              }
            }}
            className="h-8 px-2"
          >
            <Trash2 size={16} />
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="p-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
            <Skeleton className="h-16 w-full" />
          </div>
        ) : simulation ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">{simulation.asset} Price Prediction</h3>
              <span className="text-xs text-muted-foreground">
                Last updated: {new Date(simulation.createdAt).toLocaleString()}
              </span>
            </div>
            
            <div className="h-32 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={formatChartData(simulation.simulationData)}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  
                  {/* Actual price line */}
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#7c4dff" 
                    strokeWidth={2} 
                    dot={false}
                    isAnimationActive={false}
                  />
                  
                  {/* Prediction confidence area */}
                  <Area 
                    type="monotone" 
                    dataKey="upperBound" 
                    stroke="none" 
                    fill="url(#colorConfidence)" 
                    isAnimationActive={false}
                  />
                  
                  <Area 
                    type="monotone" 
                    dataKey="lowerBound" 
                    stroke="none" 
                    fill="none" 
                    isAnimationActive={false}
                  />
                  
                  {/* Predicted price line */}
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 3, fill: '#22c55e' }}
                    isAnimationActive={false}
                  />
                  
                  <Tooltip 
                    formatter={(value: any) => [value ? `$${value}` : '-', '']}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-2 bg-secondary/20 rounded-md">
                <div className="text-xs text-muted-foreground">Prediction (7d)</div>
                <div className="flex items-baseline space-x-1">
                  <span className="font-medium">${simulation.prediction}</span>
                  <span className="text-xs text-success">
                    {((simulation.prediction / parseFloat(simulation.simulationData.actual[simulation.simulationData.actual.length - 7]) - 1) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="p-2 bg-secondary/20 rounded-md">
                <div className="text-xs text-muted-foreground">Confidence</div>
                <div className="font-medium">{simulation.confidence}%</div>
              </div>
              
              <div className="p-2 bg-secondary/20 rounded-md">
                <div className="text-xs text-muted-foreground">Volatility</div>
                <div className="font-medium">{simulation.volatility}</div>
              </div>
            </div>
            
            <div className="p-3 bg-primary/10 border border-primary/30 rounded-md">
              <div className="flex space-x-2">
                <Info size={20} className="text-primary" />
                <div>
                  <h4 className="font-medium">Recommendation</h4>
                  <p className="text-sm text-foreground/80">{simulation.recommendation}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Play size={40} className="text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Simulation Data</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Run a simulation to generate price predictions and trading recommendations.
            </p>
            <Button>Run New Simulation</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
