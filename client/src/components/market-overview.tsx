import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown } from "lucide-react";

interface MarketData {
  asset: string;
  ticker: string;
  price: string;
  change24h: string;
  volume24h?: string;
  gasPrice?: string;
  gasData?: {
    slow: number;
    average: number;
    fast: number;
  };
}

interface MarketOverviewProps {
  marketData?: MarketData[];
  isLoading?: boolean;
}

export default function MarketOverview({ marketData, isLoading = false }: MarketOverviewProps) {
  // Filter to get ETH data specifically
  const ethData = marketData?.find((data) => data.asset === "Ethereum");
  
  // Find a different asset for the second card (e.g., LINK)
  const otherAssetData = marketData?.find((data) => data.asset !== "Ethereum");
  
  // Calculate total portfolio value (in a real app, this would be the sum of all positions)
  const portfolioValue = 12385.42; // This would be calculated from actual position data
  const portfolioChange = 673.89;
  const portfolioChangePercent = 5.7;

  const formatPrice = (price: string | undefined) => {
    if (!price) return "$0.00";
    return `$${parseFloat(price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  };

  const formatChange = (change: string | undefined) => {
    if (!change) return "0%";
    return `${parseFloat(change).toFixed(1)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* ETH Price Card */}
      <div className="bg-card rounded-lg p-4 border border-secondary">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-sm text-muted-foreground">ETH PRICE</h3>
          {isLoading ? (
            <Skeleton className="h-4 w-12" />
          ) : (
            <div className={`flex items-center space-x-1 ${parseFloat(ethData?.change24h || "0") >= 0 ? "text-success" : "text-destructive"}`}>
              {parseFloat(ethData?.change24h || "0") >= 0 ? (
                <ArrowUp size={16} />
              ) : (
                <ArrowDown size={16} />
              )}
              <span className="text-xs">{formatChange(ethData?.change24h)}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-baseline space-x-2">
          {isLoading ? (
            <Skeleton className="h-8 w-28" />
          ) : (
            <>
              <h2 className="text-2xl font-bold">{formatPrice(ethData?.price)}</h2>
              <span className={parseFloat(ethData?.change24h || "0") >= 0 ? "text-success text-sm" : "text-destructive text-sm"}>
                {parseFloat(ethData?.change24h || "0") >= 0 ? "+" : ""}{parseFloat(ethData?.price || "0") * parseFloat(ethData?.change24h || "0") / 100}
              </span>
            </>
          )}
        </div>
        
        <div className="h-12 mt-2">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path 
                d="M0,15 L10,10 L20,20 L30,15 L40,18 L50,5 L60,10 L70,5 L80,12 L90,7 L100,2" 
                stroke={parseFloat(ethData?.change24h || "0") >= 0 ? "#22c55e" : "#ef4444"} 
                strokeWidth="2" 
                fill="none" 
              />
            </svg>
          )}
        </div>
      </div>
      
      {/* Gas Price Card */}
      <div className="bg-card rounded-lg p-4 border border-secondary">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-sm text-muted-foreground">GAS PRICE (GWEI)</h3>
          {isLoading ? (
            <Skeleton className="h-4 w-12" />
          ) : (
            <div className="flex items-center space-x-1 text-destructive">
              <ArrowDown size={16} />
              <span className="text-xs">12.8%</span>
            </div>
          )}
        </div>
        
        <div className="flex items-baseline space-x-2">
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <>
              <h2 className="text-2xl font-bold">{ethData?.gasPrice || "34.2"}</h2>
              <span className="text-destructive text-sm">+5.2</span>
            </>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-2 mt-2">
          {isLoading ? (
            <>
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </>
          ) : (
            <>
              <div className="bg-secondary-dark rounded p-1 text-center">
                <div className="text-xs text-muted-foreground">Slow</div>
                <div className="font-medium">{ethData?.gasData?.slow || 24}</div>
              </div>
              <div className="bg-secondary-dark rounded p-1 text-center">
                <div className="text-xs text-muted-foreground">Average</div>
                <div className="font-medium">{ethData?.gasData?.average || 34}</div>
              </div>
              <div className="bg-secondary-dark rounded p-1 text-center">
                <div className="text-xs text-muted-foreground">Fast</div>
                <div className="font-medium">{ethData?.gasData?.fast || 48}</div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Portfolio Summary Card */}
      <div className="bg-card rounded-lg p-4 border border-secondary">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-sm text-muted-foreground">PORTFOLIO VALUE</h3>
          {isLoading ? (
            <Skeleton className="h-4 w-12" />
          ) : (
            <div className="flex items-center space-x-1 text-success">
              <ArrowUp size={16} />
              <span className="text-xs">{portfolioChangePercent}%</span>
            </div>
          )}
        </div>
        
        <div className="flex items-baseline space-x-2">
          {isLoading ? (
            <Skeleton className="h-8 w-28" />
          ) : (
            <>
              <h2 className="text-2xl font-bold">${portfolioValue.toLocaleString()}</h2>
              <span className="text-success text-sm">+${portfolioChange.toLocaleString()}</span>
            </>
          )}
        </div>
        
        <div className="flex justify-between text-sm mt-2">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </>
          ) : (
            <>
              <div>
                <div className="text-muted-foreground">24h Change</div>
                <div className="text-success">+${portfolioChange.toLocaleString()} ({portfolioChangePercent}%)</div>
              </div>
              <div>
                <div className="text-muted-foreground">Total Positions</div>
                <div className="font-medium">8</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
