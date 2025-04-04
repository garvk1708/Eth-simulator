import { useState } from 'react';
import { useEthereum } from '@/hooks/use-ethereum';
import NetworkSelector from '@/components/network-selector';
import TabNavigation from '@/components/tab-navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Settings as SettingsIcon, 
  Save, 
  Key,
  UserCircle,
  ShieldAlert,
  Bell,
  Database
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { address } = useEthereum();
  const [showApiModal, setShowApiModal] = useState(false);
  const { toast } = useToast();
  
  // Form states
  const [apiKeys, setApiKeys] = useState({
    etherscan: '',
    coinGecko: '',
    infura: ''
  });
  
  const [accountSettings, setAccountSettings] = useState({
    displayName: 'Ethereum User',
    email: 'user@example.com'
  });
  
  const [notifications, setNotifications] = useState({
    priceAlerts: true,
    balanceChanges: true,
    securityAlerts: true,
    weeklyReports: false,
    marketNews: false
  });
  
  const [dataSettings, setDataSettings] = useState({
    autoRefresh: true,
    refreshInterval: '30',
    historicalData: '30',
    storeLocalData: true
  });
  
  const handleSaveSettings = (section: string) => {
    toast({
      title: 'Settings Saved',
      description: `Your ${section} settings have been updated successfully.`
    });
  };

  return (
    <div>
      <NetworkSelector onOpenApiModal={() => setShowApiModal(true)} />
      
      <div className="mb-6">
        <TabNavigation activeTab="settings" setActiveTab={() => {}} />
      </div>
      
      <div className="mb-6 flex items-center space-x-2">
        <SettingsIcon size={24} className="text-primary" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {/* API Keys Section */}
        <Card className="bg-card border-secondary">
          <CardHeader className="bg-secondary-dark">
            <CardTitle className="flex items-center">
              <Key className="mr-2" size={20} />
              API Keys
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <form 
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveSettings('API Keys');
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="etherscan-key">Etherscan API Key</Label>
                <Input
                  id="etherscan-key"
                  placeholder="Your Etherscan API key"
                  value={apiKeys.etherscan}
                  onChange={(e) => setApiKeys({...apiKeys, etherscan: e.target.value})}
                  className="bg-secondary border-secondary-light"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="coingecko-key">CoinGecko API Key</Label>
                <Input
                  id="coingecko-key"
                  placeholder="Your CoinGecko API key"
                  value={apiKeys.coinGecko}
                  onChange={(e) => setApiKeys({...apiKeys, coinGecko: e.target.value})}
                  className="bg-secondary border-secondary-light"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="infura-key">Infura Project ID</Label>
                <Input
                  id="infura-key"
                  placeholder="Your Infura Project ID"
                  value={apiKeys.infura}
                  onChange={(e) => setApiKeys({...apiKeys, infura: e.target.value})}
                  className="bg-secondary border-secondary-light"
                />
              </div>
              
              <div className="flex justify-end">
                <Button type="submit">
                  <Save size={16} className="mr-2" />
                  Save API Keys
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Account Settings */}
        <Card className="bg-card border-secondary">
          <CardHeader className="bg-secondary-dark">
            <CardTitle className="flex items-center">
              <UserCircle className="mr-2" size={20} />
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <form 
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveSettings('Account');
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="display-name">Display Name</Label>
                <Input
                  id="display-name"
                  value={accountSettings.displayName}
                  onChange={(e) => setAccountSettings({...accountSettings, displayName: e.target.value})}
                  className="bg-secondary border-secondary-light"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={accountSettings.email}
                  onChange={(e) => setAccountSettings({...accountSettings, email: e.target.value})}
                  className="bg-secondary border-secondary-light"
                />
              </div>
              
              <div className="p-3 bg-secondary/20 rounded-md">
                <div className="flex items-start space-x-2">
                  <div className="flex-1">
                    <h4 className="font-medium">Connected Wallet</h4>
                    <p className="text-sm text-muted-foreground">{address || 'No wallet connected'}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={!address}
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button type="submit">
                  <Save size={16} className="mr-2" />
                  Save Account Settings
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Notification Settings */}
        <Card className="bg-card border-secondary">
          <CardHeader className="bg-secondary-dark">
            <CardTitle className="flex items-center">
              <Bell className="mr-2" size={20} />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <form 
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveSettings('Notification');
              }}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="price-alerts">Price Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications for significant price changes</p>
                  </div>
                  <Switch
                    id="price-alerts"
                    checked={notifications.priceAlerts}
                    onCheckedChange={(checked) => setNotifications({...notifications, priceAlerts: checked})}
                  />
                </div>
                
                <Separator className="bg-secondary" />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="balance-changes">Balance Changes</Label>
                    <p className="text-sm text-muted-foreground">Get notified when your wallet balance changes</p>
                  </div>
                  <Switch
                    id="balance-changes"
                    checked={notifications.balanceChanges}
                    onCheckedChange={(checked) => setNotifications({...notifications, balanceChanges: checked})}
                  />
                </div>
                
                <Separator className="bg-secondary" />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="security-alerts">Security Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications about security events</p>
                  </div>
                  <Switch
                    id="security-alerts"
                    checked={notifications.securityAlerts}
                    onCheckedChange={(checked) => setNotifications({...notifications, securityAlerts: checked})}
                  />
                </div>
                
                <Separator className="bg-secondary" />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="weekly-reports">Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">Receive weekly performance reports</p>
                  </div>
                  <Switch
                    id="weekly-reports"
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) => setNotifications({...notifications, weeklyReports: checked})}
                  />
                </div>
                
                <Separator className="bg-secondary" />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="market-news">Market News</Label>
                    <p className="text-sm text-muted-foreground">Get updates on important market news</p>
                  </div>
                  <Switch
                    id="market-news"
                    checked={notifications.marketNews}
                    onCheckedChange={(checked) => setNotifications({...notifications, marketNews: checked})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button type="submit">
                  <Save size={16} className="mr-2" />
                  Save Notification Settings
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Data Settings */}
        <Card className="bg-card border-secondary">
          <CardHeader className="bg-secondary-dark">
            <CardTitle className="flex items-center">
              <Database className="mr-2" size={20} />
              Data & Display Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <form 
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveSettings('Data');
              }}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-refresh">Auto-Refresh Data</Label>
                  <p className="text-sm text-muted-foreground">Automatically refresh market data</p>
                </div>
                <Switch
                  id="auto-refresh"
                  checked={dataSettings.autoRefresh}
                  onCheckedChange={(checked) => setDataSettings({...dataSettings, autoRefresh: checked})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="refresh-interval">Refresh Interval (seconds)</Label>
                <Input
                  id="refresh-interval"
                  type="number"
                  value={dataSettings.refreshInterval}
                  onChange={(e) => setDataSettings({...dataSettings, refreshInterval: e.target.value})}
                  className="bg-secondary border-secondary-light"
                  disabled={!dataSettings.autoRefresh}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="historical-data">Historical Data Display (days)</Label>
                <Input
                  id="historical-data"
                  type="number"
                  value={dataSettings.historicalData}
                  onChange={(e) => setDataSettings({...dataSettings, historicalData: e.target.value})}
                  className="bg-secondary border-secondary-light"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="store-local-data">Store Data Locally</Label>
                  <p className="text-sm text-muted-foreground">Cache data for faster loading</p>
                </div>
                <Switch
                  id="store-local-data"
                  checked={dataSettings.storeLocalData}
                  onCheckedChange={(checked) => setDataSettings({...dataSettings, storeLocalData: checked})}
                />
              </div>
              
              <div className="flex justify-end">
                <Button type="submit">
                  <Save size={16} className="mr-2" />
                  Save Data Settings
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Security Settings */}
        <Card className="bg-card border-secondary">
          <CardHeader className="bg-secondary-dark">
            <CardTitle className="flex items-center">
              <ShieldAlert className="mr-2" size={20} />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="p-3 bg-secondary/20 rounded-md">
                <h4 className="font-medium mb-2">Session Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">IP Address:</div>
                  <div>192.168.1.1 (Masked)</div>
                  <div className="text-muted-foreground">Last Login:</div>
                  <div>{new Date().toLocaleString()}</div>
                  <div className="text-muted-foreground">Device:</div>
                  <div>Chrome on Windows</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    toast({
                      title: 'Feature Coming Soon',
                      description: 'Two-factor authentication will be available in a future update.'
                    });
                  }}
                >
                  Enable
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="font-medium">Account Recovery Options</h4>
                  <p className="text-sm text-muted-foreground">Set up recovery methods</p>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: 'Feature Coming Soon',
                      description: 'Account recovery options will be available in a future update.'
                    });
                  }}
                >
                  Configure
                </Button>
              </div>
              
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md">
                <h4 className="font-medium text-destructive mb-2">Danger Zone</h4>
                <p className="text-sm mb-4">These actions cannot be undone. Be careful!</p>
                <div className="flex space-x-2">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      toast({
                        title: 'Reset Applied',
                        description: 'Application settings have been reset to defaults.',
                        variant: 'destructive'
                      });
                    }}
                  >
                    Reset App Settings
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      toast({
                        title: 'Data Cleared',
                        description: 'Local application data has been cleared.',
                        variant: 'destructive'
                      });
                    }}
                  >
                    Clear All Data
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
