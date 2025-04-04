import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { ApiIntegration } from '@shared/schema';

interface ApiIntegrationCardProps {
  apiIntegrations?: ApiIntegration[];
  isLoading?: boolean;
  onOpenApiModal?: () => void;
}

export default function ApiIntegrationCard({ 
  apiIntegrations, 
  isLoading = false,
  onOpenApiModal
}: ApiIntegrationCardProps) {
  const [showApiModal, setShowApiModal] = useState(false);
  const [selectedApi, setSelectedApi] = useState<ApiIntegration | null>(null);
  const [apiForm, setApiForm] = useState({
    name: '',
    apiKey: '',
    apiUrl: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const handleOpenModal = (api?: ApiIntegration) => {
    if (api) {
      setSelectedApi(api);
      setApiForm({
        name: api.name,
        apiKey: api.apiKey || '',
        apiUrl: api.apiUrl || '',
        description: api.description || ''
      });
    } else {
      setSelectedApi(null);
      setApiForm({
        name: '',
        apiKey: '',
        apiUrl: '',
        description: ''
      });
    }
    
    if (onOpenApiModal) {
      onOpenApiModal();
    } else {
      setShowApiModal(true);
    }
  };
  
  const handleDeleteApi = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/api-integrations/${id}`);
      
      toast({
        title: 'API Integration Removed',
        description: 'The API integration has been successfully deleted'
      });
      
      // Refresh API integrations
      queryClient.invalidateQueries({ queryKey: ['/api/api-integrations'] });
    } catch (error: any) {
      toast({
        title: 'Error Removing API',
        description: error.message || 'Failed to remove API integration',
        variant: 'destructive'
      });
    }
  };
  
  const handleSubmitApi = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (selectedApi) {
        // Update existing API
        await apiRequest('PATCH', `/api/api-integrations/${selectedApi.id}`, {
          name: apiForm.name,
          apiKey: apiForm.apiKey,
          apiUrl: apiForm.apiUrl,
          description: apiForm.description
        });
        
        toast({
          title: 'API Updated',
          description: `Successfully updated ${apiForm.name} API integration`
        });
      } else {
        // Create new API
        await apiRequest('POST', '/api/api-integrations', {
          userId: 1, // In a real app, this would be the actual user ID
          name: apiForm.name,
          apiKey: apiForm.apiKey,
          apiUrl: apiForm.apiUrl,
          description: apiForm.description || `API integration for ${apiForm.name}`,
          status: 'Connected'
        });
        
        toast({
          title: 'API Integration Added',
          description: `Successfully connected to ${apiForm.name} API`
        });
      }
      
      // Refresh API integrations
      queryClient.invalidateQueries({ queryKey: ['/api/api-integrations'] });
      
      // Close modal and reset form
      setShowApiModal(false);
      setApiForm({
        name: '',
        apiKey: '',
        apiUrl: '',
        description: ''
      });
    } catch (error: any) {
      toast({
        title: 'Error with API Integration',
        description: error.message || 'Failed to process API integration',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <Card className="bg-card border-secondary">
        <CardHeader className="bg-secondary-dark flex justify-between items-center">
          <CardTitle>API Integration</CardTitle>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => handleOpenModal()}
          >
            Configure
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {isLoading ? (
              <>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </>
            ) : apiIntegrations && apiIntegrations.length > 0 ? (
              // Display existing API integrations
              apiIntegrations.map(api => (
                <div key={api.id} className="p-3 border border-secondary rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-secondary rounded-md flex items-center justify-center">
                        {api.name.includes('Coin') || api.name.includes('Gecko') ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" x2="12" y1="2" y2="22" />
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="3" width="20" height="14" rx="2" />
                            <line x1="8" x2="16" y1="21" y2="21" />
                            <line x1="12" x2="12" y1="17" y2="21" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{api.name}</div>
                        <div className="text-xs text-muted-foreground">{api.description || 'API integration'}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Badge variant="outline" className="bg-success/10 text-success">
                        Connected
                      </Badge>
                      <div className="flex space-x-1">
                        <button 
                          className="p-1 hover:bg-secondary rounded-md"
                          onClick={() => handleOpenModal(api)}
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          className="p-1 hover:bg-secondary rounded-md"
                          onClick={() => handleDeleteApi(api.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Last synced: {api.lastSynced ? new Date(api.lastSynced).toLocaleString() : 'Never'}
                  </div>
                </div>
              ))
            ) : null}
            
            {/* Add New API */}
            <div className="p-3 border border-dashed border-secondary rounded-md">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-secondary/30 rounded-md flex items-center justify-center">
                  <Plus size={16} />
                </div>
                <div>
                  <div className="font-medium">Add Custom API</div>
                  <div className="text-xs text-muted-foreground">Connect additional data sources</div>
                </div>
              </div>
              
              <div className="mt-3 grid grid-cols-1 gap-2">
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOpenModal()}
                >
                  Connect API
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Integration Modal */}
      {!onOpenApiModal && (
        <Dialog open={showApiModal} onOpenChange={setShowApiModal}>
          <DialogContent className="bg-card border border-secondary">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                {selectedApi ? 'Edit API Integration' : 'Add API Integration'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmitApi} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-name">API Name</Label>
                <Input
                  id="api-name"
                  placeholder="CoinGecko, Etherscan, etc."
                  value={apiForm.name}
                  onChange={(e) => setApiForm({...apiForm, name: e.target.value})}
                  required
                  className="bg-secondary border-secondary-light"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  placeholder="Your API key"
                  value={apiForm.apiKey}
                  onChange={(e) => setApiForm({...apiForm, apiKey: e.target.value})}
                  required
                  className="bg-secondary border-secondary-light"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="api-url">API URL (Optional)</Label>
                <Input
                  id="api-url"
                  placeholder="https://api.example.com"
                  value={apiForm.apiUrl}
                  onChange={(e) => setApiForm({...apiForm, apiUrl: e.target.value})}
                  className="bg-secondary border-secondary-light"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="api-description">Description (Optional)</Label>
                <Input
                  id="api-description"
                  placeholder="Brief description of this API"
                  value={apiForm.description}
                  onChange={(e) => setApiForm({...apiForm, description: e.target.value})}
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
                  disabled={isSubmitting || !apiForm.name || !apiForm.apiKey}
                >
                  {isSubmitting ? 'Connecting...' : selectedApi ? 'Update API' : 'Connect API'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
