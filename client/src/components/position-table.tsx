import { useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowUp, 
  ArrowDown, 
  Copy, 
  Search, 
  RefreshCw, 
  ArrowLeftRight, 
  Eye, 
  ChartBarStacked 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatAddress } from "@/lib/ethereum";
import { Position } from "@shared/schema";

interface PositionTableProps {
  positions?: Position[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export default function PositionTable({ 
  positions, 
  isLoading = false,
  onRefresh 
}: PositionTableProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [assetTypeFilter, setAssetTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('value');

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: 'Address Copied',
      description: 'Contract address copied to clipboard'
    });
  };

  // Filter positions based on search query and asset type
  const filteredPositions = positions?.filter(position => {
    const matchesSearch = searchQuery === '' || 
      position.asset.toLowerCase().includes(searchQuery.toLowerCase()) ||
      position.ticker.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = assetTypeFilter === 'all' || 
      (assetTypeFilter === 'tokens' && !position.contractAddress) || 
      (assetTypeFilter === 'contracts' && position.contractAddress);
    
    return matchesSearch && matchesType;
  });

  // Sort positions
  const sortedPositions = [...(filteredPositions || [])].sort((a, b) => {
    switch (sortBy) {
      case 'value':
        return parseFloat(b.value.toString()) - parseFloat(a.value.toString());
      case 'name':
        return a.asset.localeCompare(b.asset);
      case 'performance':
        return parseFloat(b.change24h.toString()) - parseFloat(a.change24h.toString());
      default:
        return 0;
    }
  });

  return (
    <div className="bg-card rounded-lg border border-secondary overflow-hidden">
      <div className="px-4 py-3 bg-secondary-dark flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-lg font-semibold">Active Positions</h2>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search positions..."
              className="bg-secondary pl-8 pr-4 py-1.5 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-2.5 top-2 text-muted-foreground" size={16} />
          </div>
          
          <Select value={assetTypeFilter} onValueChange={setAssetTypeFilter}>
            <SelectTrigger className="bg-secondary px-3 py-1.5 rounded-md text-sm h-9 min-w-[130px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="tokens">Tokens</SelectItem>
              <SelectItem value="contracts">Contracts</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-secondary px-3 py-1.5 rounded-md text-sm h-9 min-w-[150px]">
              <SelectValue placeholder="Sort by: Value" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="value">Sort by: Value</SelectItem>
              <SelectItem value="name">Sort by: Name</SelectItem>
              <SelectItem value="performance">Sort by: Performance</SelectItem>
            </SelectContent>
          </Select>

          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh} 
              className="bg-secondary hover:bg-secondary-light h-9"
            >
              <RefreshCw size={16} />
            </Button>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-secondary">
          <thead className="bg-secondary-dark">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Asset</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Value (USD)</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">24h Change</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Contract</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary bg-card">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="hover:bg-secondary-dark transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-12 mt-1" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex space-x-1">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </td>
                </tr>
              ))
            ) : sortedPositions && sortedPositions.length > 0 ? (
              sortedPositions.map((position) => (
                <tr key={position.id} className="hover:bg-secondary-dark transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full ${position.asset === 'Ethereum' ? 'bg-primary/20' : 'bg-blue-500/20'} flex items-center justify-center`}>
                        {position.asset === 'Ethereum' ? (
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
                        <div className="font-medium">{position.asset}</div>
                        <div className="text-xs text-muted-foreground">{position.ticker}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono">{parseFloat(position.amount.toString()).toFixed(4)} {position.ticker}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium">${parseFloat(position.value.toString()).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                  <td className="px-4 py-3 whitespace-nowrap">${parseFloat(position.price.toString()).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className={`flex items-center space-x-1 ${parseFloat(position.change24h.toString()) >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {parseFloat(position.change24h.toString()) >= 0 ? (
                        <ArrowUp size={16} />
                      ) : (
                        <ArrowDown size={16} />
                      )}
                      <span>{parseFloat(position.change24h.toString()).toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {position.contractAddress ? (
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-muted-foreground font-mono">{formatAddress(position.contractAddress)}</span>
                        <button className="text-muted-foreground hover:text-white" onClick={() => handleCopyAddress(position.contractAddress || '')}>
                          <Copy size={14} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground font-mono">Native</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex space-x-1">
                      <button 
                        className="p-1.5 bg-primary/10 hover:bg-primary/20 rounded-md" 
                        title="Trade"
                        onClick={() => {
                          toast({
                            title: 'Trade',
                            description: `Opening trade interface for ${position.asset}`
                          });
                        }}
                      >
                        <ArrowLeftRight size={14} />
                      </button>
                      <button 
                        className="p-1.5 bg-primary/10 hover:bg-primary/20 rounded-md" 
                        title="View details"
                        onClick={() => {
                          toast({
                            title: 'View Details',
                            description: `Viewing details for ${position.asset}`
                          });
                        }}
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        className="p-1.5 bg-primary/10 hover:bg-primary/20 rounded-md" 
                        title="Analyze"
                        onClick={() => {
                          toast({
                            title: 'Analyze',
                            description: `Analyzing ${position.asset} position`
                          });
                        }}
                      >
                        <ChartBarStacked size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                  No positions found. {searchQuery && 'Try adjusting your search.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
