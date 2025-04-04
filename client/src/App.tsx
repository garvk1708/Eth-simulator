import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";

import Home from "@/pages/home";
import Positions from "@/pages/positions";
import Trading from "@/pages/trading";
import Analytics from "@/pages/analytics";
import SmartContracts from "@/pages/smart-contracts";
import Simulations from "@/pages/simulations";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout";
import { EthereumProvider } from "@/hooks/use-ethereum";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/positions" component={Positions} />
      <Route path="/trading" component={Trading} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/smart-contracts" component={SmartContracts} />
      <Route path="/simulations" component={Simulations} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Set up Web Socket for real-time market data
  const [marketSocket, setMarketSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Create WebSocket connection
    // In Replit, we should use the default host without specifying port
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}`);
    console.log(`Connecting to WebSocket at ${protocol}//${window.location.host}`);

    socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'MARKET_DATA') {
          // Update market data in the query cache
          queryClient.setQueryData(['market-data'], message.data);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    setMarketSocket(socket);

    // Clean up on unmount
    return () => {
      socket.close();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <EthereumProvider>
        <Layout>
          <Router />
        </Layout>
        <Toaster />
      </EthereumProvider>
    </QueryClientProvider>
  );
}

export default App;
