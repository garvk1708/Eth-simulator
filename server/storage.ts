import {
  users, type User, type InsertUser,
  positions, type Position, type InsertPosition,
  smartContracts, type SmartContract, type InsertSmartContract,
  apiIntegrations, type ApiIntegration, type InsertApiIntegration,
  simulations, type Simulation, type InsertSimulation,
  marketData, type MarketData, type InsertMarketData
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserWalletAddress(id: number, walletAddress: string): Promise<User | undefined>;
  
  // Position operations
  getPositions(userId: number): Promise<Position[]>;
  getPosition(id: number): Promise<Position | undefined>;
  createPosition(position: InsertPosition): Promise<Position>;
  updatePosition(id: number, position: Partial<InsertPosition>): Promise<Position | undefined>;
  deletePosition(id: number): Promise<boolean>;
  
  // Smart contract operations
  getSmartContracts(userId: number): Promise<SmartContract[]>;
  getSmartContract(id: number): Promise<SmartContract | undefined>;
  createSmartContract(contract: InsertSmartContract): Promise<SmartContract>;
  updateSmartContract(id: number, contract: Partial<InsertSmartContract>): Promise<SmartContract | undefined>;
  deleteSmartContract(id: number): Promise<boolean>;
  
  // API integration operations
  getApiIntegrations(userId: number): Promise<ApiIntegration[]>;
  getApiIntegration(id: number): Promise<ApiIntegration | undefined>;
  createApiIntegration(integration: InsertApiIntegration): Promise<ApiIntegration>;
  updateApiIntegration(id: number, integration: Partial<InsertApiIntegration>): Promise<ApiIntegration | undefined>;
  deleteApiIntegration(id: number): Promise<boolean>;
  
  // Simulation operations
  getSimulations(userId: number): Promise<Simulation[]>;
  getSimulation(id: number): Promise<Simulation | undefined>;
  createSimulation(simulation: InsertSimulation): Promise<Simulation>;
  deleteSimulation(id: number): Promise<boolean>;
  
  // Market data operations
  getAllMarketData(): Promise<MarketData[]>;
  getMarketDataByAsset(asset: string): Promise<MarketData | undefined>;
  updateMarketData(asset: string, data: Partial<InsertMarketData>): Promise<MarketData | undefined>;
  createMarketData(data: InsertMarketData): Promise<MarketData>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private positions: Map<number, Position>;
  private smartContracts: Map<number, SmartContract>;
  private apiIntegrations: Map<number, ApiIntegration>;
  private simulations: Map<number, Simulation>;
  private marketData: Map<number, MarketData>;
  
  private userId: number;
  private positionId: number;
  private contractId: number;
  private integrationId: number;
  private simulationId: number;
  private marketDataId: number;

  constructor() {
    this.users = new Map();
    this.positions = new Map();
    this.smartContracts = new Map();
    this.apiIntegrations = new Map();
    this.simulations = new Map();
    this.marketData = new Map();
    
    this.userId = 1;
    this.positionId = 1;
    this.contractId = 1;
    this.integrationId = 1;
    this.simulationId = 1;
    this.marketDataId = 1;
    
    // Add initial market data
    this.seedMarketData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.walletAddress === walletAddress
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUserWalletAddress(id: number, walletAddress: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, walletAddress };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Position operations
  async getPositions(userId: number): Promise<Position[]> {
    return Array.from(this.positions.values()).filter(
      (position) => position.userId === userId
    );
  }

  async getPosition(id: number): Promise<Position | undefined> {
    return this.positions.get(id);
  }

  async createPosition(position: InsertPosition): Promise<Position> {
    const id = this.positionId++;
    const now = new Date();
    const newPosition: Position = { 
      ...position, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.positions.set(id, newPosition);
    return newPosition;
  }

  async updatePosition(id: number, position: Partial<InsertPosition>): Promise<Position | undefined> {
    const existingPosition = this.positions.get(id);
    if (!existingPosition) return undefined;

    const updatedPosition = { 
      ...existingPosition, 
      ...position, 
      updatedAt: new Date() 
    };
    this.positions.set(id, updatedPosition);
    return updatedPosition;
  }

  async deletePosition(id: number): Promise<boolean> {
    return this.positions.delete(id);
  }

  // Smart contract operations
  async getSmartContracts(userId: number): Promise<SmartContract[]> {
    return Array.from(this.smartContracts.values()).filter(
      (contract) => contract.userId === userId
    );
  }

  async getSmartContract(id: number): Promise<SmartContract | undefined> {
    return this.smartContracts.get(id);
  }

  async createSmartContract(contract: InsertSmartContract): Promise<SmartContract> {
    const id = this.contractId++;
    const now = new Date();
    const newContract: SmartContract = { 
      ...contract, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.smartContracts.set(id, newContract);
    return newContract;
  }

  async updateSmartContract(id: number, contract: Partial<InsertSmartContract>): Promise<SmartContract | undefined> {
    const existingContract = this.smartContracts.get(id);
    if (!existingContract) return undefined;

    const updatedContract = { 
      ...existingContract, 
      ...contract, 
      updatedAt: new Date() 
    };
    this.smartContracts.set(id, updatedContract);
    return updatedContract;
  }

  async deleteSmartContract(id: number): Promise<boolean> {
    return this.smartContracts.delete(id);
  }

  // API integration operations
  async getApiIntegrations(userId: number): Promise<ApiIntegration[]> {
    return Array.from(this.apiIntegrations.values()).filter(
      (integration) => integration.userId === userId
    );
  }

  async getApiIntegration(id: number): Promise<ApiIntegration | undefined> {
    return this.apiIntegrations.get(id);
  }

  async createApiIntegration(integration: InsertApiIntegration): Promise<ApiIntegration> {
    const id = this.integrationId++;
    const now = new Date();
    const newIntegration: ApiIntegration = { 
      ...integration, 
      id, 
      lastSynced: now, 
      createdAt: now, 
      updatedAt: now 
    };
    this.apiIntegrations.set(id, newIntegration);
    return newIntegration;
  }

  async updateApiIntegration(id: number, integration: Partial<InsertApiIntegration>): Promise<ApiIntegration | undefined> {
    const existingIntegration = this.apiIntegrations.get(id);
    if (!existingIntegration) return undefined;

    const updatedIntegration = { 
      ...existingIntegration, 
      ...integration, 
      updatedAt: new Date() 
    };
    this.apiIntegrations.set(id, updatedIntegration);
    return updatedIntegration;
  }

  async deleteApiIntegration(id: number): Promise<boolean> {
    return this.apiIntegrations.delete(id);
  }

  // Simulation operations
  async getSimulations(userId: number): Promise<Simulation[]> {
    return Array.from(this.simulations.values()).filter(
      (simulation) => simulation.userId === userId
    );
  }

  async getSimulation(id: number): Promise<Simulation | undefined> {
    return this.simulations.get(id);
  }

  async createSimulation(simulation: InsertSimulation): Promise<Simulation> {
    const id = this.simulationId++;
    const now = new Date();
    const newSimulation: Simulation = { 
      ...simulation, 
      id, 
      createdAt: now 
    };
    this.simulations.set(id, newSimulation);
    return newSimulation;
  }

  async deleteSimulation(id: number): Promise<boolean> {
    return this.simulations.delete(id);
  }

  // Market data operations
  async getAllMarketData(): Promise<MarketData[]> {
    return Array.from(this.marketData.values());
  }

  async getMarketDataByAsset(asset: string): Promise<MarketData | undefined> {
    return Array.from(this.marketData.values()).find(
      (data) => data.asset === asset
    );
  }

  async updateMarketData(asset: string, data: Partial<InsertMarketData>): Promise<MarketData | undefined> {
    const marketData = Array.from(this.marketData.values()).find(
      (data) => data.asset === asset
    );
    
    if (!marketData) return undefined;

    const updatedData = { 
      ...marketData, 
      ...data, 
      updatedAt: new Date() 
    };
    this.marketData.set(marketData.id, updatedData);
    return updatedData;
  }

  async createMarketData(data: InsertMarketData): Promise<MarketData> {
    const id = this.marketDataId++;
    const now = new Date();
    const newMarketData: MarketData = { 
      ...data, 
      id, 
      updatedAt: now 
    };
    this.marketData.set(id, newMarketData);
    return newMarketData;
  }

  // Seed initial market data
  private seedMarketData() {
    const ethMarketData: InsertMarketData = {
      asset: "Ethereum",
      ticker: "ETH",
      price: "3245.67",
      change24h: "2.4",
      volume24h: "12345678",
      gasPrice: "34.2",
      gasData: {
        slow: 24,
        average: 34,
        fast: 48
      }
    };
    
    const linkMarketData: InsertMarketData = {
      asset: "Chainlink",
      ticker: "LINK",
      price: "13.00",
      change24h: "-1.2",
      volume24h: "98765432",
      gasPrice: null,
      gasData: null
    };
    
    this.createMarketData(ethMarketData);
    this.createMarketData(linkMarketData);
  }
}

export const storage = new MemStorage();
