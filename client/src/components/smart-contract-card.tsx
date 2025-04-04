import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, FileCheck, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatAddress, isValidAddress } from '@/lib/ethereum';
import { SmartContract } from '@shared/schema';

interface SmartContractCardProps {
  smartContracts?: SmartContract[];
  isLoading?: boolean;
}

export default function SmartContractCard({ smartContracts, isLoading = false }: SmartContractCardProps) {
  const [showAddContractModal, setShowAddContractModal] = useState(false);
  const [contractForm, setContractForm] = useState({
    name: '',
    contractAddress: ''
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{status: 'success' | 'error', message: string} | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleVerifyContract = async () => {
    if (!contractForm.contractAddress || !isValidAddress(contractForm.contractAddress)) {
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
      // In a real app, this would call the blockchain to verify the contract
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setVerificationResult({
        status: 'success',
        message: 'Contract verified successfully. Detected ERC-20 Token.'
      });
    } catch (error: any) {
      setVerificationResult({
        status: 'error',
        message: error.message || 'Failed to verify contract'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAddContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractForm.name || !contractForm.contractAddress || !isValidAddress(contractForm.contractAddress)) {
      toast({
        title: 'Invalid Contract',
        description: 'Please enter a valid contract name and address',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest('POST', '/api/smart-contracts', {
        userId: 1, // In a real app, this would be the actual user ID
        name: contractForm.name,
        contractAddress: contractForm.contractAddress,
        status: 'Active',
        details: {
          type: 'erc20' // In a real app, this would be determined by verification
        }
      });

      toast({
        title: 'Contract Added',
        description: `Successfully added ${contractForm.name} contract`
      });

      // Reset form and close modal
      setContractForm({ name: '', contractAddress: '' });
      setShowAddContractModal(false);
      
      // Refresh smart contracts
      queryClient.invalidateQueries({ queryKey: ['/api/smart-contracts'] });
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

  const handleDeleteContract = async (contractId: number) => {
    try {
      await apiRequest('DELETE', `/api/smart-contracts/${contractId}`);
      
      toast({
        title: 'Contract Deleted',
        description: 'Smart contract has been removed'
      });
      
      // Refresh smart contracts
      queryClient.invalidateQueries({ queryKey: ['/api/smart-contracts'] });
    } catch (error: any) {
      toast({
        title: 'Error Deleting Contract',
        description: error.message || 'Failed to delete smart contract',
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <Card className="bg-card border-secondary overflow-hidden">
        <CardHeader className="bg-secondary-dark">
          <CardTitle>Smart Contract Integration</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {isLoading ? (
              <>
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </>
            ) : smartContracts && smartContracts.length > 0 ? (
              // Display the first contract
              <div className="p-3 border border-secondary rounded-md bg-secondary/10">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-md bg-success/20 flex items-center justify-center">
                      <CheckCircle className="text-success" size={16} />
                    </div>
                    <div>
                      <div className="font-medium">{smartContracts[0].name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{formatAddress(smartContracts[0].contractAddress)}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className={`${smartContracts[0].status === 'Active' ? 'text-success bg-success/10' : 'text-muted-foreground'}`}>
                    {smartContracts[0].status}
                  </Badge>
                </div>
                
                <div className="mt-3 text-sm">
                  <div className="flex justify-between py-1 border-b border-gray-700">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-mono">{smartContracts[0].details?.type || 'Custom'}</span>
                  </div>
                  {smartContracts[0].details?.stakedAmount && (
                    <div className="flex justify-between py-1 border-b border-gray-700">
                      <span className="text-muted-foreground">Staked ETH</span>
                      <span className="font-mono">{smartContracts[0].details.stakedAmount} ETH</span>
                    </div>
                  )}
                  {smartContracts[0].details?.rewards && (
                    <div className="flex justify-between py-1 border-b border-gray-700">
                      <span className="text-muted-foreground">Rewards</span>
                      <span className="font-mono text-success">+{smartContracts[0].details.rewards} ETH</span>
                    </div>
                  )}
                  {smartContracts[0].details?.apy && (
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">APY</span>
                      <span className="font-mono">{smartContracts[0].details.apy}%</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-3">
                  <Button 
                    variant="default" 
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: 'Manage Position',
                        description: 'Opening contract management interface'
                      });
                    }}
                  >
                    Manage Position
                  </Button>
                </div>
              </div>
            ) : null}
            
            {/* Add New Contract Card - Always show this */}
            <div className="p-3 border border-dashed border-secondary rounded-md bg-secondary/5 flex flex-col items-center justify-center text-center py-6">
              <div className="w-10 h-10 rounded-full bg-secondary/30 flex items-center justify-center mb-2">
                <Plus size={20} />
              </div>
              <h3 className="font-medium">Add Smart Contract</h3>
              <p className="text-xs text-muted-foreground mt-1">Connect your DeFi positions or deploy new contracts</p>
              <Button
                variant="outline"
                className="mt-3 px-4 py-1.5"
                onClick={() => setShowAddContractModal(true)}
              >
                Connect Contract
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Contract Modal */}
      <Dialog open={showAddContractModal} onOpenChange={setShowAddContractModal}>
        <DialogContent className="bg-card border border-secondary">
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
                <div className={`p-2 text-sm rounded-md flex items-center space-x-2 ${
                  verificationResult.status === 'success' 
                    ? 'bg-success/10 text-success' 
                    : 'bg-destructive/10 text-destructive'
                }`}>
                  {verificationResult.status === 'success' ? (
                    <CheckCircle size={16} />
                  ) : (
                    <XCircle size={16} />
                  )}
                  <span>{verificationResult.message}</span>
                </div>
              )}
            </div>
            
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
                  !isValidAddress(contractForm.contractAddress)
                }
              >
                {isSubmitting ? 'Adding...' : 'Add Contract'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
