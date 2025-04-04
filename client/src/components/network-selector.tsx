import { useEthereum } from '@/hooks/use-ethereum';
import { Link2, Clock, RotateCw } from 'lucide-react';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface NetworkSelectorProps {
  onOpenApiModal: () => void;
}

export default function NetworkSelector({ onOpenApiModal }: NetworkSelectorProps) {
  const { network, switchNetwork } = useEthereum();
  const [autoRefresh, setAutoRefresh] = useState(true);

  const handleNetworkChange = (value: string) => {
    switchNetwork(value as any);
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center space-x-2">
        <div className="bg-secondary p-2 rounded-md">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
            <line x1="6" x2="14" y1="12" y2="12" />
          </svg>
        </div>
        <Select defaultValue={network} onValueChange={handleNetworkChange}>
          <SelectTrigger className="bg-secondary border-secondary-light w-[180px]">
            <SelectValue placeholder="Select Network" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ethereum">Ethereum Mainnet</SelectItem>
            <SelectItem value="polygon">Polygon</SelectItem>
            <SelectItem value="arbitrum">Arbitrum</SelectItem>
            <SelectItem value="optimism">Optimism</SelectItem>
            <SelectItem value="avalanche">Avalanche</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex space-x-3">
        {/* API Integration Button */}
        <Button
          variant="outline"
          className="btn-secondary"
          onClick={onOpenApiModal}
        >
          <Link2 size={18} className="mr-2" />
          <span>API Integration</span>
        </Button>
        
        {/* Refresh Data Button */}
        <Button
          variant="outline"
          className="btn-secondary"
          onClick={toggleAutoRefresh}
        >
          <Clock size={18} className="mr-2" />
          <span>Auto-refresh</span>
          <span className="ml-1 text-xs bg-primary px-1.5 py-0.5 rounded">
            {autoRefresh ? 'ON' : 'OFF'}
          </span>
        </Button>
      </div>
    </div>
  );
}
