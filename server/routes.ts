import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer } from "ws";
import { 
  insertUserSchema, 
  insertPositionSchema, 
  insertSmartContractSchema, 
  insertApiIntegrationSchema,
  insertSimulationSchema,
  insertMarketDataSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup WebSocket server on a separate path to avoid conflicts with Vite's WebSocket
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: "/api/ws", // Specific path for our WebSocket to avoid conflicts with Vite
    perMessageDeflate: false,
    clientTracking: true,
  });
  
  console.log("WebSocket server initialized on path /api/ws");
  
  wss.on("connection", (ws) => {
    console.log("Market data WebSocket client connected");
    
    ws.on("message", (message) => {
      console.log("Received WebSocket message:", message.toString());
    });
    
    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
    
    // Send initial market data on connection
    storage.getAllMarketData().then(marketData => {
      try {
        console.log("Sending initial market data to WebSocket client");
        ws.send(JSON.stringify({ 
          type: "MARKET_DATA", 
          data: marketData 
        }));
      } catch (error) {
        console.error("Error sending market data over WebSocket:", error);
      }
    });
  });
  
  // Prevent broadcasting too frequently with this variable
  let lastBroadcast = 0;
  const BROADCAST_THROTTLE = 5000; // 5 seconds minimum between broadcasts
  
  // Broadcast market data updates to all connected clients
  const broadcastMarketData = () => {
    const now = Date.now();
    
    // Only broadcast if enough time has passed since the last broadcast
    if (now - lastBroadcast > BROADCAST_THROTTLE) {
      storage.getAllMarketData().then(marketData => {
        const message = JSON.stringify({ 
          type: "MARKET_DATA", 
          data: marketData 
        });
        
        let clientCount = 0;
        wss.clients.forEach(client => {
          if (client.readyState === client.OPEN) {
            client.send(message);
            clientCount++;
          }
        });
        
        console.log(`Broadcasting market data to ${clientCount} connected clients`);
        lastBroadcast = now;
      });
    } else {
      console.log(`Skipping broadcast, too soon since last update (${now - lastBroadcast}ms < ${BROADCAST_THROTTLE}ms)`);
    }
  };
  
  // API Routes
  
  // User routes
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.status(201).json({ id: user.id, username: user.username });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  app.patch("/api/users/:id/wallet", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const { walletAddress } = req.body;
      
      if (!walletAddress) {
        return res.status(400).json({ message: "Wallet address is required" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUserWalletAddress(userId, walletAddress);
      res.json({ id: updatedUser!.id, walletAddress: updatedUser!.walletAddress });
    } catch (error) {
      res.status(500).json({ message: "Failed to update wallet address" });
    }
  });
  
  // Position routes
  app.get("/api/positions", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const positions = await storage.getPositions(userId);
      res.json(positions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch positions" });
    }
  });
  
  app.post("/api/positions", async (req: Request, res: Response) => {
    try {
      const positionData = insertPositionSchema.parse(req.body);
      const position = await storage.createPosition(positionData);
      res.status(201).json(position);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid position data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create position" });
    }
  });
  
  app.patch("/api/positions/:id", async (req: Request, res: Response) => {
    try {
      const positionId = parseInt(req.params.id);
      const positionData = req.body;
      
      const position = await storage.getPosition(positionId);
      if (!position) {
        return res.status(404).json({ message: "Position not found" });
      }
      
      const updatedPosition = await storage.updatePosition(positionId, positionData);
      res.json(updatedPosition);
    } catch (error) {
      res.status(500).json({ message: "Failed to update position" });
    }
  });
  
  app.delete("/api/positions/:id", async (req: Request, res: Response) => {
    try {
      const positionId = parseInt(req.params.id);
      
      const position = await storage.getPosition(positionId);
      if (!position) {
        return res.status(404).json({ message: "Position not found" });
      }
      
      await storage.deletePosition(positionId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete position" });
    }
  });
  
  // Smart contract routes
  app.get("/api/smart-contracts", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const contracts = await storage.getSmartContracts(userId);
      res.json(contracts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch smart contracts" });
    }
  });
  
  app.post("/api/smart-contracts", async (req: Request, res: Response) => {
    try {
      const contractData = insertSmartContractSchema.parse(req.body);
      const contract = await storage.createSmartContract(contractData);
      res.status(201).json(contract);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contract data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create smart contract" });
    }
  });
  
  app.patch("/api/smart-contracts/:id", async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.id);
      const contractData = req.body;
      
      const contract = await storage.getSmartContract(contractId);
      if (!contract) {
        return res.status(404).json({ message: "Smart contract not found" });
      }
      
      const updatedContract = await storage.updateSmartContract(contractId, contractData);
      res.json(updatedContract);
    } catch (error) {
      res.status(500).json({ message: "Failed to update smart contract" });
    }
  });
  
  app.delete("/api/smart-contracts/:id", async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.id);
      
      const contract = await storage.getSmartContract(contractId);
      if (!contract) {
        return res.status(404).json({ message: "Smart contract not found" });
      }
      
      await storage.deleteSmartContract(contractId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete smart contract" });
    }
  });
  
  // API integration routes
  app.get("/api/api-integrations", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const integrations = await storage.getApiIntegrations(userId);
      res.json(integrations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch API integrations" });
    }
  });
  
  app.post("/api/api-integrations", async (req: Request, res: Response) => {
    try {
      const integrationData = insertApiIntegrationSchema.parse(req.body);
      const integration = await storage.createApiIntegration(integrationData);
      res.status(201).json(integration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid integration data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create API integration" });
    }
  });
  
  app.patch("/api/api-integrations/:id", async (req: Request, res: Response) => {
    try {
      const integrationId = parseInt(req.params.id);
      const integrationData = req.body;
      
      const integration = await storage.getApiIntegration(integrationId);
      if (!integration) {
        return res.status(404).json({ message: "API integration not found" });
      }
      
      const updatedIntegration = await storage.updateApiIntegration(integrationId, integrationData);
      res.json(updatedIntegration);
    } catch (error) {
      res.status(500).json({ message: "Failed to update API integration" });
    }
  });
  
  app.delete("/api/api-integrations/:id", async (req: Request, res: Response) => {
    try {
      const integrationId = parseInt(req.params.id);
      
      const integration = await storage.getApiIntegration(integrationId);
      if (!integration) {
        return res.status(404).json({ message: "API integration not found" });
      }
      
      await storage.deleteApiIntegration(integrationId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete API integration" });
    }
  });
  
  // Simulation routes
  app.get("/api/simulations", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const simulations = await storage.getSimulations(userId);
      res.json(simulations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch simulations" });
    }
  });
  
  app.post("/api/simulations", async (req: Request, res: Response) => {
    try {
      const simulationData = insertSimulationSchema.parse(req.body);
      const simulation = await storage.createSimulation(simulationData);
      res.status(201).json(simulation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid simulation data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create simulation" });
    }
  });
  
  app.delete("/api/simulations/:id", async (req: Request, res: Response) => {
    try {
      const simulationId = parseInt(req.params.id);
      
      const simulation = await storage.getSimulation(simulationId);
      if (!simulation) {
        return res.status(404).json({ message: "Simulation not found" });
      }
      
      await storage.deleteSimulation(simulationId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete simulation" });
    }
  });
  
  // Market data routes
  app.get("/api/market-data", async (req: Request, res: Response) => {
    try {
      const asset = req.query.asset as string;
      
      if (asset) {
        const marketData = await storage.getMarketDataByAsset(asset);
        if (!marketData) {
          return res.status(404).json({ message: "Market data not found for the asset" });
        }
        return res.json(marketData);
      }
      
      const allMarketData = await storage.getAllMarketData();
      res.json(allMarketData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch market data" });
    }
  });
  
  app.patch("/api/market-data/:asset", async (req: Request, res: Response) => {
    try {
      const asset = req.params.asset;
      const marketDataUpdate = req.body;
      
      const marketData = await storage.getMarketDataByAsset(asset);
      if (!marketData) {
        return res.status(404).json({ message: "Market data not found for the asset" });
      }
      
      const updatedMarketData = await storage.updateMarketData(asset, marketDataUpdate);
      
      // Broadcast the updated market data
      broadcastMarketData();
      
      res.json(updatedMarketData);
    } catch (error) {
      res.status(500).json({ message: "Failed to update market data" });
    }
  });
  
  // Simulated market data update (for demo purposes)
  setInterval(async () => {
    try {
      // Update ETH price with small random fluctuations
      const eth = await storage.getMarketDataByAsset("Ethereum");
      if (eth && eth.price !== null && eth.change24h !== null) {
        const currentPrice = parseFloat(String(eth.price));
        const newPrice = currentPrice * (1 + (Math.random() * 0.01 - 0.005)); // ±0.5% change
        const currentChange = parseFloat(String(eth.change24h));
        const newChange = currentChange + (Math.random() * 0.2 - 0.1); // ±0.1% change
        
        await storage.updateMarketData("Ethereum", {
          price: newPrice.toFixed(2),
          change24h: newChange.toFixed(1)
        });
      }
      
      // Update LINK price with small random fluctuations
      const link = await storage.getMarketDataByAsset("Chainlink");
      if (link && link.price !== null && link.change24h !== null) {
        const currentPrice = parseFloat(String(link.price));
        const newPrice = currentPrice * (1 + (Math.random() * 0.01 - 0.005)); // ±0.5% change
        const currentChange = parseFloat(String(link.change24h));
        const newChange = currentChange + (Math.random() * 0.2 - 0.1); // ±0.1% change
        
        await storage.updateMarketData("Chainlink", {
          price: newPrice.toFixed(2),
          change24h: newChange.toFixed(1)
        });
      }
      
      // Broadcast the updated market data
      broadcastMarketData();
    } catch (error) {
      console.error("Error updating market data:", error);
    }
  }, 10000); // Update every 10 seconds
  
  return httpServer;
}
