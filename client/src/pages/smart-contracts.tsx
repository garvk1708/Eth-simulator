import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEthereum } from '@/hooks/use-ethereum';
import { useSmartContractStorage } from '@/hooks/use-contracts';
import NetworkSelector from '@/components/network-selector';
import TabNavigation from '@/components/tab-navigation';
import SmartContractCard from '@/components/smart-contract-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Plus, AlertCircle, Code, FileCheck, Trash2 } from 'lucide-react';
import { detectContractType, verifyContract, CONTRACT_TYPES } from '@/lib/contracts';
import { isValidAddress, formatAddress } from '@/lib/ethereum';
import { ethers } from 'ethers';

export default function SmartContracts() {
  const { address, provider } = useEthereum();
  const [showAddContractModal, setShowAddContractModal] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [contractForm, setContractForm] = useState({
    name: '',
    contractAddress: '',
    type: '',
    customAbi: '',
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{status: 'success' | 'error', message: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { saveSmartContract } = useSmartContractStorage();

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

  // Mutation for deleting contracts
  const deleteContractMutation = useMutation({
    mutationFn: async (contractId: number) => {
      const response = await apiRequest('DELETE', `/api/smart-contracts/${contractId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/smart-contracts'] });
      toast({
        title: 'Contract Deleted',
        description: 'The smart contract has been successfully removed'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Delete Contract',
        description: error.message || 'An error occurred while deleting the contract',
        variant: 'destructive'
      });
    }
  });

  const handleDeleteContract = (contractId: number) => {
    deleteContractMutation.mutate(contractId);
  };

  const handleVerifyContract = async () => {
    if (!contractForm.contractAddress || !isValidAddress(contractForm.contractAddress) || !provider) {
      toast({
        title: 'Invalid Address',
        description: 'Please enter a valid Ethereum contract address',
        variant: 'destructive'
      });
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      // Verify the contract exists on the blockchain
      const isContract = await verifyContract(contractForm.contractAddress, provider);
      
      if (!isContract) {
        setVerificationResult({
          status: 'error',
          message: 'No contract found at this address.'
        });
        return;
      }
      
      // Try to detect contract type
      const contractType = await detectContractType(contractForm.contractAddress, provider);
      
      setContractForm({
        ...contractForm,
        type: contractType
      });
      
      setVerificationResult({
        status: 'success',
        message: `Contract verified. Detected type: ${
          CONTRACT_TYPES.find(type => type.id === contractType)?.name || 'Custom Contract'
        }`
      });
      
    } catch (error: any) {
      console.error('Verification error:', error);
      setVerificationResult({
        status: 'error',
        message: error.message || 'Failed to verify contract. Please check the address and try again.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAddContract = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save the contract to our backend
      const contractDetails = {
        name: contractForm.name,
        type: contractForm.type,
        customAbi: contractForm.customAbi,
      };
      
      const savedContract = await saveSmartContract(
        contractForm.name,
        contractForm.contractAddress,
        'Active',
        contractDetails
      );

      if (savedContract) {
        toast({
          title: 'Contract Added',
          description: `Successfully added ${contractForm.name} contract`
        });

        // Reset form and close modal
        setContractForm({
          name: '',
          contractAddress: '',
          type: '',
          customAbi: '',
        });
        setShowAddContractModal(false);
        
        // Refresh contracts
        queryClient.invalidateQueries({ queryKey: ['/api/smart-contracts'] });
      }
    } catch (error: any) {
      toast({
        title: 'Error Adding Contract',
        description: error.message || 'Failed to add smart contract',
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
        <TabNavigation activeTab="smart-contracts" setActiveTab={() => {}} />
      </div>
      
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Smart Contracts</h1>
        <Button 
          onClick={() => setShowAddContractModal(true)}
          className="btn-primary"
        >
          <Plus size={18} className="mr-2" />
          Add Contract
        </Button>
      </div>
      
      {/* Smart Contracts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {isLoadingContracts ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="bg-card border-secondary">
              <CardHeader className="bg-secondary-dark">
                <CardTitle className="flex justify-between items-center">
                  <div className="h-6 w-40 bg-secondary rounded animate-pulse"></div>
                  <div className="h-4 w-16 bg-secondary rounded animate-pulse"></div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="h-4 w-full bg-secondary rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-secondary rounded animate-pulse"></div>
                <div className="h-8 w-full bg-secondary rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))
        ) : smartContracts?.length > 0 ? (
          smartContracts.map((contract: any) => (
            <Card key={contract.id} className="bg-card border-secondary">
              <CardHeader className="bg-secondary-dark">
                <CardTitle className="flex justify-between items-center">
                  <div className="font-medium truncate">{contract.name}</div>
                  <Badge variant={contract.status === 'Active' ? 'success' : 'secondary'}>
                    {contract.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-2">Contract Address</div>
                <div className="flex items-center space-x-1 mb-4">
                  <code className="text-sm font-mono bg-secondary-dark p-1 rounded">
                    {formatAddress(contract.contractAddress, 8)}
                  </code>
                  <button 
                    className="p-1 hover:bg-secondary rounded-md"
                    onClick={() => {
                      navigator.clipboard.writeText(contract.contractAddress);
                      toast({
                        title: 'Address Copied',
                        description: 'Contract address copied to clipboard'
                      });
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                  </button>
                </div>
                
                {contract.details?.type && (
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="text-xs text-muted-foreground">Type:</div>
                    <Badge variant="outline">
                      {CONTRACT_TYPES.find(type => type.id === contract.details.type)?.name || 'Custom Contract'}
                    </Badge>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      window.open(`https://etherscan.io/address/${contract.contractAddress}`, '_blank');
                    }}
                  >
                    <FileCheck size={16} className="mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleDeleteContract(contract.id)}
                  >
                    <Trash2 size={16} className="mr-1" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card className="bg-card border-secondary">
              <CardContent className="p-6 text-center">
                <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Smart Contracts Found</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't added any smart contracts yet. Add a contract to integrate with your positions.
                </p>
                <Button 
                  onClick={() => setShowAddContractModal(true)}
                  className="btn-primary"
                >
                  <Plus size={18} className="mr-2" />
                  Add Contract
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      {/* Smart Contract Metrics */}
      <Card className="bg-card border-secondary mb-6">
        <CardHeader className="bg-secondary-dark">
          <CardTitle>Contract Usage Metrics</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-3 bg-secondary/20 rounded-md">
              <div className="text-sm text-muted-foreground">Total Contracts</div>
              <div className="text-xl font-medium">{smartContracts?.length || 0}</div>
            </div>
            
            <div className="p-3 bg-secondary/20 rounded-md">
              <div className="text-sm text-muted-foreground">Active Contracts</div>
              <div className="text-xl font-medium">{smartContracts?.filter((c: any) => c.status === 'Active').length || 0}</div>
            </div>
            
            <div className="p-3 bg-secondary/20 rounded-md">
              <div className="text-sm text-muted-foreground">Contract Types</div>
              <div className="text-xl font-medium">
                {smartContracts ? 
                  new Set(smartContracts.map((c: any) => c.details?.type || 'custom')).size : 
                  0
                }
              </div>
            </div>
            
            <div className="p-3 bg-secondary/20 rounded-md">
              <div className="text-sm text-muted-foreground">Last Interaction</div>
              <div className="text-xl font-medium">
                {smartContracts && smartContracts.length > 0 ? 
                  new Date(Math.max(...smartContracts.map((c: any) => 
                    new Date(c.updatedAt).getTime()
                  ))).toLocaleDateString() : 
                  'N/A'
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Add Contract Modal */}
      <Dialog open={showAddContractModal} onOpenChange={setShowAddContractModal}>
        <DialogContent className="bg-card border-secondary max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Add Smart Contract</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleAddContract} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contract-name">Contract Name</Label>
              <Input
                id="contract-name"
                placeholder="My ERC-20 Token, Staking Contract, etc."
                value={contractForm.name}
                onChange={(e) => setContractForm({...contractForm, name: e.target.value})}
                required
                className="bg-secondary border-secondary-light"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contract-address">Contract Address</Label>
              <div className="flex space-x-2">
                <Input
                  id="contract-address"
                  placeholder="0x..."
                  value={contractForm.contractAddress}
                  onChange={(e) => setContractForm({...contractForm, contractAddress: e.target.value})}
                  required
                  className="bg-secondary border-secondary-light"
                />
                <Button 
                  type="button" 
                  onClick={handleVerifyContract}
                  disabled={isVerifying || !contractForm.contractAddress || !isValidAddress(contractForm.contractAddress)}
                >
                  {isVerifying ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
              
              {verificationResult && (
                <Alert variant={verificationResult.status === 'success' ? 'default' : 'destructive'}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{verificationResult.message}</AlertDescription>
                </Alert>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contract-type">Contract Type</Label>
              <Select 
                value={contractForm.type} 
                onValueChange={(value) => setContractForm({...contractForm, type: value})}
              >
                <SelectTrigger className="bg-secondary border-secondary-light">
                  <SelectValue placeholder="Select contract type" />
                </SelectTrigger>
                <SelectContent>
                  {CONTRACT_TYPES.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name} - {type.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Tabs defaultValue="auto" className="w-full">
              <TabsList className="mb-4 w-full">
                <TabsTrigger value="auto" className="flex-1">Auto-Detect ABI</TabsTrigger>
                <TabsTrigger value="custom" className="flex-1">Custom ABI</TabsTrigger>
              </TabsList>
              
              <TabsContent value="auto">
                <div className="p-4 bg-secondary/20 rounded-md text-sm">
                  <p className="flex items-start">
                    <Info size={16} className="mr-2 mt-0.5 text-primary" />
                    ABI will be auto-detected based on the contract type. For verified contracts, 
                    information will be fetched from Etherscan when the contract is used.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="custom">
                <div className="space-y-2">
                  <Label htmlFor="contract-abi">Custom ABI (JSON format)</Label>
                  <Textarea
                    id="contract-abi"
                    placeholder='[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"}]'
                    value={contractForm.customAbi}
                    onChange={(e) => setContractForm({...contractForm, customAbi: e.target.value})}
                    className="bg-secondary border-secondary-light h-32 font-mono text-xs"
                  />
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowAddContractModal(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={
                  isSubmitting || 
                  !contractForm.name || 
                  !contractForm.contractAddress || 
                  !isValidAddress(contractForm.contractAddress) ||
                  !contractForm.type
                }
              >
                {isSubmitting ? 'Adding...' : 'Add Contract'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
