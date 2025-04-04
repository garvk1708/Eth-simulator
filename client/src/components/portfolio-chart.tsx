import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Position } from '@shared/schema';

interface PortfolioChartProps {
  positions?: Position[];
  isLoading?: boolean;
}

export default function PortfolioChart({ positions, isLoading = false }: PortfolioChartProps) {
  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'>('1M');
  
  // Generate mock historical data for demonstration
  // In a real app, this would come from an API
  const generateChartData = () => {
    // Calculate total portfolio value from positions
    const totalValue = positions?.reduce((sum, position) => 
      sum + parseFloat(position.value.toString()), 0) || 0;
      
    const data = [];
    const today = new Date();
    let currentValue = totalValue;
    
    // Number of data points based on timeRange
    let days;
    switch (timeRange) {
      case '1D': days = 24; break; // 24 hours
      case '1W': days = 7; break;
      case '1M': days = 30; break;
      case '3M': days = 90; break;
      case '1Y': days = 365; break;
      case 'ALL': days = 730; break; // ~2 years
      default: days = 30;
    }
    
    // Generate data points going backward from today
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      
      if (timeRange === '1D') {
        // For 1D, use hours instead of days
        date.setHours(today.getHours() - i);
        // Format as HH:mm
        const label = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Generate realistic price fluctuations
        // More volatility for shorter timeframes
        const volatilityFactor = 0.003; // 0.3% per hour
        const randomChange = (Math.random() - 0.5) * 2 * volatilityFactor;
        currentValue = currentValue * (1 + randomChange);
        
        data.push({
          date: label,
          value: currentValue.toFixed(2)
        });
      } else {
        // For other ranges, use days
        date.setDate(today.getDate() - i);
        // Format as MM/DD
        const label = date.toLocaleDateString([], { month: 'numeric', day: 'numeric' });
        
        // Adjust volatility based on timeRange
        let volatilityFactor;
        switch (timeRange) {
          case '1W': volatilityFactor = 0.01; break; // 1% per day
          case '1M': volatilityFactor = 0.008; break; // 0.8% per day
          case '3M': volatilityFactor = 0.007; break; // 0.7% per day
          case '1Y': volatilityFactor = 0.006; break; // 0.6% per day
          case 'ALL': volatilityFactor = 0.005; break; // 0.5% per day
          default: volatilityFactor = 0.01;
        }
        
        // Add some trend
        const trend = Math.sin(i / 30) * 0.002; // Cyclical trend
        const randomChange = (Math.random() - 0.48) * 2 * volatilityFactor + trend;
        currentValue = currentValue * (1 + randomChange);
        
        data.push({
          date: label,
          value: currentValue.toFixed(2)
        });
      }
    }
    
    return data;
  };

  const chartData = generateChartData();

  return (
    <Card className="bg-card border-secondary overflow-hidden lg:col-span-2">
      <CardHeader className="px-4 py-3 bg-secondary-dark flex justify-between items-center">
        <CardTitle className="font-semibold">Portfolio Performance</CardTitle>
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant={timeRange === '1D' ? 'default' : 'outline'} 
            onClick={() => setTimeRange('1D')}
            className="px-2 py-1 text-xs h-auto"
          >
            1D
          </Button>
          <Button 
            size="sm" 
            variant={timeRange === '1W' ? 'default' : 'outline'} 
            onClick={() => setTimeRange('1W')}
            className="px-2 py-1 text-xs h-auto"
          >
            1W
          </Button>
          <Button 
            size="sm" 
            variant={timeRange === '1M' ? 'default' : 'outline'} 
            onClick={() => setTimeRange('1M')}
            className="px-2 py-1 text-xs h-auto"
          >
            1M
          </Button>
          <Button 
            size="sm" 
            variant={timeRange === '3M' ? 'default' : 'outline'} 
            onClick={() => setTimeRange('3M')}
            className="px-2 py-1 text-xs h-auto"
          >
            3M
          </Button>
          <Button 
            size="sm" 
            variant={timeRange === '1Y' ? 'default' : 'outline'} 
            onClick={() => setTimeRange('1Y')}
            className="px-2 py-1 text-xs h-auto"
          >
            1Y
          </Button>
          <Button 
            size="sm" 
            variant={timeRange === 'ALL' ? 'default' : 'outline'} 
            onClick={() => setTimeRange('ALL')}
            className="px-2 py-1 text-xs h-auto"
          >
            ALL
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c4dff" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#7c4dff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#94a3b8' }}
                  tickFormatter={(value) => value}
                  interval={timeRange === '1D' ? 2 : 'preserveStartEnd'}
                />
                <YAxis 
                  tick={{ fill: '#94a3b8' }}
                  tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
                  domain={['dataMin - 100', 'dataMax + 100']}
                />
                <Tooltip 
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Value']}
                  labelFormatter={(label) => timeRange === '1D' ? `Time: ${label}` : `Date: ${label}`}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#7c4dff" 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
        
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          {chartData
            .filter((_, i) => timeRange === '1D' 
              ? i % 4 === 0 // Show every 4th hour for 1D
              : i % Math.ceil(chartData.length / 8) === 0 // Show ~8 labels for other ranges
            )
            .map((data, index) => (
              <div key={index}>{data.date}</div>
            ))
          }
        </div>
      </CardContent>
    </Card>
  );
}
