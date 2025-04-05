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
    // Create WebSocket connection on the specific path to match the server
    // Use location hostname and don't specify a port - let Replit handle it
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const socketUrl = `${protocol}//${host}/api/ws`; // Match the path we set on the server
    
    console.log(`Attempting to connect WebSocket at ${socketUrl}`);
    
    // Create socket with connection retry logic
    let socket: WebSocket | null = null;
    let retryCount = 0;
    const maxRetries = 5;
    const retryDelay = 2000; // 2 seconds
    
    const connectWebSocket = () => {
      if (retryCount >= maxRetries) {
        console.log(`Maximum retry attempts (${maxRetries}) reached, giving up`);
        return;
      }
      
      try {
        console.log(`Attempt ${retryCount + 1} to connect to WebSocket at ${socketUrl}`);
        socket = new WebSocket(socketUrl);
        
        socket.onopen = () => {
          console.log('WebSocket connection established successfully');
          retryCount = 0; // Reset retry counter on successful connection
        };
        
        socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log('Received WebSocket message:', message.type);
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
        
        socket.onclose = (event) => {
          console.log(`WebSocket connection closed: ${event.reason} (${event.code})`);
          
          // If connection closed abnormally, try to reconnect
          if (event.code !== 1000) {
            retryCount++;
            console.log(`Attempting to reconnect WebSocket (${retryCount}/${maxRetries})...`);
            setTimeout(connectWebSocket, retryDelay);
          }
        };
        
        setMarketSocket(socket);
      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        retryCount++;
        setTimeout(connectWebSocket, retryDelay);
      }
    };
    
    connectWebSocket();
    
    // Clean up on unmount
    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close(1000, "Component unmounting");
      }
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
