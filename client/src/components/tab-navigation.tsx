import { Link, useLocation } from 'wouter';

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  const [location, navigate] = useLocation();

  const tabs = [
    { id: 'positions', label: 'Positions', path: '/positions' },
    { id: 'trading', label: 'Trading', path: '/trading' },
    { id: 'analytics', label: 'Analytics', path: '/analytics' },
    { id: 'smart-contracts', label: 'Smart Contracts', path: '/smart-contracts' },
    { id: 'simulations', label: 'Simulations', path: '/simulations' },
    { id: 'settings', label: 'Settings', path: '/settings' }
  ];

  const handleTabClick = (tabId: string, path: string) => {
    setActiveTab(tabId);
    navigate(path);
  };

  return (
    <div className="border-b border-secondary">
      <nav className="flex overflow-x-auto" aria-label="Tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === tab.id 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-white'
            }`}
            onClick={() => handleTabClick(tab.id, tab.path)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
