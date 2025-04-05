import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useEthereum } from '@/hooks/use-ethereum';
import NetworkSelector from '@/components/network-selector';
import TabNavigation from '@/components/tab-navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartBarStacked, ChartPie, Calendar, TrendingUp, Download } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart as RechartsePieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export default function Analytics() {
  const { address } = useEthereum();
  const [showApiModal, setShowApiModal] = useState(false);
  const [timeRange, setTimeRange] = useState('1M');

  // Fetch positions for analytics
  const { data: positions, isLoading: isLoadingPositions } = useQuery({
    queryKey: ['/api/positions', address],
    queryFn: async () => {
      const response = await fetch(`/api/positions?userId=1`);
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

  // Generate performance data for demonstration
  const generatePerformanceData = () => {
    const data = [];
    const today = new Date();
    let totalValue = 50000; // Starting value
    
    // Generate data points depending on the time range
    let days;
    switch (timeRange) {
      case '1W': days = 7; break;
      case '1M': days = 30; break;
      case '3M': days = 90; break;
      case '1Y': days = 365; break;
      case 'ALL': days = 730; break;
      default: days = 30;
    }
    
    // Market cycles and trends
    const trendCycle = Math.PI * 2 / days; // Complete cycle over the period
    const volatility = timeRange === '1W' ? 0.015 : 0.008; // Higher volatility for shorter timeframes
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      // Combine multiple factors for realistic price movement
      const trend = Math.sin(i * trendCycle) * 0.3; // Long term trend
      const seasonality = Math.sin(i * 0.1) * 0.2; // Seasonal pattern
      const randomWalk = (Math.random() - 0.5) * 2 * volatility; // Random walk
      const marketSentiment = Math.sin(i * 0.05) * 0.1; // Market sentiment
      
      // Calculate daily change
      const change = (trend + seasonality + randomWalk + marketSentiment) * 100;
      
      // Add occasional market events
      if (i % 45 === 0) { // Major event every 45 days
        totalValue *= (1 + (Math.random() > 0.5 ? 0.05 : -0.05)); // ±5% shock
      }
      
      totalValue *= (1 + change / 100);
      totalValue = Math.max(totalValue, totalValue * 0.2); // Prevent total crash
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: totalValue.toFixed(2)
      });
    }
    
    return data;
  };

  // Generate asset allocation data
  const generateAssetAllocation = () => {
    if (!positions || positions.length === 0) return [];
    
    return positions.map((position: any) => ({
      name: position.asset,
      value: parseFloat(position.value)
    }));
  };

  // Generate monthly returns data
  const generateMonthlyReturns = () => {
    const data = [];
    const currentMonth = new Date().getMonth();
    
    for (let i = 0; i < 12; i++) {
      const month = new Date(0, i).toLocaleString('default', { month: 'short' });
      const returnValue = (Math.random() * 20) - 5; // Random between -5% and 15%
      
      data.push({
        month,
        return: returnValue,
        fill: returnValue >= 0 ? '#22c55e' : '#ef4444'
      });
    }
    
    return data;
  };

  // Performance data based on selected time range
  const performanceData = generatePerformanceData();
  
  // Asset allocation data
  const assetAllocationData = generateAssetAllocation();
  
  // Monthly returns data
  const monthlyReturnsData = generateMonthlyReturns();
  
  // COLORS for pie chart
  const COLORS = ['#7c4dff', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

  const isLoading = isLoadingPositions || isLoadingMarket;

  return (
    <div>
      <NetworkSelector onOpenApiModal={() => setShowApiModal(true)} />
      
      <div className="mb-6">
        <TabNavigation activeTab="analytics" setActiveTab={() => {}} />
      </div>
      
      {/* Performance Overview */}
      <Card className="bg-card border-secondary mb-6">
        <CardHeader className="bg-secondary-dark flex flex-row justify-between items-center">
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2" size={20} />
            Portfolio Performance
          </CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant={timeRange === '1W' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimeRange('1W')}
            >
              1W
            </Button>
            <Button 
              variant={timeRange === '1M' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimeRange('1M')}
            >
              1M
            </Button>
            <Button 
              variant={timeRange === '3M' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimeRange('3M')}
            >
              3M
            </Button>
            <Button 
              variant={timeRange === '1Y' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimeRange('1Y')}
            >
              1Y
            </Button>
            <Button 
              variant={timeRange === 'ALL' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimeRange('ALL')}
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
                  data={performanceData}
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
                    tickFormatter={(value) => {
                      if (timeRange === '1W') return value.slice(-5);
                      if (timeRange === '1M') return value.slice(-5);
                      if (timeRange === '3M' && performanceData.indexOf(performanceData.find(item => item.date === value)!) % 5 === 0) return value.slice(-5);
                      if (timeRange === '1Y' && performanceData.indexOf(performanceData.find(item => item.date === value)!) % 30 === 0) return value.slice(-5);
                      if (timeRange === 'ALL' && performanceData.indexOf(performanceData.find(item => item.date === value)!) % 60 === 0) return value.slice(-5);
                      return '';
                    }}
                  />
                  <YAxis 
                    tick={{ fill: '#94a3b8' }}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`$${parseFloat(value).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 'Value']}
                    labelFormatter={(label) => `Date: ${label}`}
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
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="p-3 bg-secondary/20 rounded-md">
              <div className="text-sm text-muted-foreground">Starting Value</div>
              <div className="text-xl font-medium">$10,000.00</div>
            </div>
            
            <div className="p-3 bg-secondary/20 rounded-md">
              <div className="text-sm text-muted-foreground">Current Value</div>
              <div className="text-xl font-medium">
                ${parseFloat(performanceData[performanceData.length - 1]?.value || '0').toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </div>
            </div>
            
            <div className="p-3 bg-secondary/20 rounded-md">
              <div className="text-sm text-muted-foreground">Total Return</div>
              <div className="text-xl font-medium text-success">
                +${(parseFloat(performanceData[performanceData.length - 1]?.value || '0') - 10000).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </div>
            </div>
            
            <div className="p-3 bg-secondary/20 rounded-md">
              <div className="text-sm text-muted-foreground">Return %</div>
              <div className="text-xl font-medium text-success">
                +{((parseFloat(performanceData[performanceData.length - 1]?.value || '0') / 10000 - 1) * 100).toFixed(2)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="overview" className="flex-1">
            <ChartBarStacked className="mr-2" size={16} />
            Overview
          </TabsTrigger>
          <TabsTrigger value="allocation" className="flex-1">
            <ChartPie className="mr-2" size={16} />
            Asset Allocation
          </TabsTrigger>
          <TabsTrigger value="returns" className="flex-1">
            <Calendar className="mr-2" size={16} />
            Monthly Returns
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card border-secondary">
              <CardHeader className="bg-secondary-dark">
                <CardTitle>Position Growth</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={performanceData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fill: '#94a3b8' }}
                          tickFormatter={(value) => value.slice(-5)}
                          interval={Math.max(1, Math.floor(performanceData.length / 6))}
                        />
                        <YAxis 
                          tick={{ fill: '#94a3b8' }}
                          tickFormatter={(value) => `$${value.toLocaleString()}`}
                        />
                        <Tooltip 
                          formatter={(value: any) => [`$${parseFloat(value).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 'Value']}
                          labelFormatter={(label) => `Date: ${label}`}
                          contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#7c4dff" 
                          strokeWidth={2} 
                          dot={{ r: 2 }} 
                          activeDot={{ r: 6 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-card border-secondary">
              <CardHeader className="bg-secondary-dark">
                <CardTitle>Portfolio Metrics</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="p-3 bg-secondary/20 rounded-md">
                    <div className="flex justify-between">
                      <div className="text-sm text-muted-foreground">Total Positions</div>
                      <div className="font-medium">{positions?.length || 0}</div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-secondary/20 rounded-md">
                    <div className="flex justify-between">
                      <div className="text-sm text-muted-foreground">Best Performing Asset</div>
                      <div className="font-medium text-success">Ethereum (+28.4%)</div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-secondary/20 rounded-md">
                    <div className="flex justify-between">
                      <div className="text-sm text-muted-foreground">Worst Performing Asset</div>
                      <div className="font-medium text-destructive">Chainlink (-12.3%)</div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-secondary/20 rounded-md">
                    <div className="flex justify-between">
                      <div className="text-sm text-muted-foreground">30-Day Volatility</div>
                      <div className="font-medium">Medium (14.2%)</div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-secondary/20 rounded-md">
                    <div className="flex justify-between">
                      <div className="text-sm text-muted-foreground">Risk Score</div>
                      <div className="font-medium">7.5/10</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="allocation">
          <Card className="bg-card border-secondary">
            <CardHeader className="bg-secondary-dark">
              <CardTitle>Asset Allocation</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-80 flex items-center justify-center">
                  {isLoading ? (
                    <Skeleton className="h-64 w-64 rounded-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsePieChart>
                        <Pie
                          data={assetAllocationData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {assetAllocationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any) => [`$${parseFloat(value).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 'Value']}
                          contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                        />
                        <Legend />
                      </RechartsePieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Allocation Details</h3>
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {assetAllocationData.map((asset, index) => (
                        <div key={index} className="p-3 bg-secondary/20 rounded-md">
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <span className="font-medium">{asset.name}</span>
                                <span className="font-mono">${parseFloat(asset.value.toString()).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                              </div>
                              <div className="w-full bg-secondary-dark h-2 rounded-full mt-1">
                                <div
                                  className="h-2 rounded-full"
                                  style={{
                                    width: `${(asset.value / assetAllocationData.reduce((sum, curr) => sum + curr.value, 0)) * 100}%`,
                                    backgroundColor: COLORS[index % COLORS.length]
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="p-3 bg-primary/10 border border-primary/30 rounded-md">
                        <div className="flex items-center space-x-2">
                          <Download size={18} className="text-primary" />
                          <div>
                            <span className="font-medium">Export Allocation Report</span>
                          </div>
                          <Button size="sm" variant="outline" className="ml-auto">
                            Export
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="returns">
          <Card className="bg-card border-secondary">
            <CardHeader className="bg-secondary-dark">
              <CardTitle>Monthly Returns</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {isLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyReturnsData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" tick={{ fill: '#94a3b8' }} />
                      <YAxis 
                        tick={{ fill: '#94a3b8' }}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip 
                        formatter={(value: any) => [`${value}%`, 'Return']}
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                      />
                      <Bar 
                        dataKey="return" 
                        fill="#8884d8" 
                        label={{ 
                          position: 'top', 
                          formatter: (value: number) => `${value.toFixed(1)}%`,
                          fill: '#94a3b8',
                          fontSize: 12
                        }}
                      >
                        {monthlyReturnsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div className="p-3 bg-secondary/20 rounded-md">
                  <div className="text-sm text-muted-foreground">Best Month</div>
                  <div className="text-xl font-medium text-success">
                    +{Math.max(...monthlyReturnsData.map(item => item.return)).toFixed(1)}%
                  </div>
                </div>
                
                <div className="p-3 bg-secondary/20 rounded-md">
                  <div className="text-sm text-muted-foreground">Worst Month</div>
                  <div className="text-xl font-medium text-destructive">
                    {Math.min(...monthlyReturnsData.map(item => item.return)).toFixed(1)}%
                  </div>
                </div>
                
                <div className="p-3 bg-secondary/20 rounded-md">
                  <div className="text-sm text-muted-foreground">Average Monthly Return</div>
                  <div className="text-xl font-medium">
                    {(monthlyReturnsData.reduce((sum, item) => sum + item.return, 0) / monthlyReturnsData.length).toFixed(1)}%
                  </div>
                </div>
                
                <div className="p-3 bg-secondary/20 rounded-md">
                  <div className="text-sm text-muted-foreground">Positive Months</div>
                  <div className="text-xl font-medium">
                    {monthlyReturnsData.filter(item => item.return > 0).length}/{monthlyReturnsData.length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
