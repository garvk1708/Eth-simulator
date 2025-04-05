import { pgTable, text, serial, integer, boolean, numeric, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address"),
  email: text("email"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  walletAddress: true,
  email: true,
});

// Define positions table
export const positions = pgTable("positions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  asset: text("asset").notNull(),
  ticker: text("ticker").notNull(), 
  amount: numeric("amount").notNull(),
  value: numeric("value").notNull(),
  price: numeric("price").notNull(),
  change24h: numeric("change_24h").notNull(),
  contractAddress: text("contract_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPositionSchema = createInsertSchema(positions).pick({
  userId: true,
  asset: true,
  ticker: true,
  amount: true,
  value: true,
  price: true,
  change24h: true,
  contractAddress: true,
});

// Smart contracts table
export const smartContracts = pgTable("smart_contracts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  contractAddress: text("contract_address").notNull(),
  status: text("status").notNull(),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSmartContractSchema = createInsertSchema(smartContracts).pick({
  userId: true,
  name: true,
  contractAddress: true,
  status: true,
  details: true,
});

// API integrations table
export const apiIntegrations = pgTable("api_integrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  apiKey: text("api_key"),
  apiUrl: text("api_url"),
  description: text("description"),
  status: text("status").notNull(),
  lastSynced: timestamp("last_synced"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertApiIntegrationSchema = createInsertSchema(apiIntegrations).pick({
  userId: true,
  name: true,
  apiKey: true,
  apiUrl: true,
  description: true,
  status: true,
});

// Simulation data table
export const simulations = pgTable("simulations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  asset: text("asset").notNull(),
  prediction: numeric("prediction"),
  confidence: numeric("confidence"),
  volatility: text("volatility"),
  upperBound: numeric("upper_bound"),
  lowerBound: numeric("lower_bound"),
  recommendation: text("recommendation"),
  yieldValue: numeric("yield_value"),         // Annual yield percentage
  gasFees: numeric("gas_fees"),               // Estimated gas fees for transactions
  impermanentLoss: numeric("impermanent_loss"), // Estimated impermanent loss percentage
  liquidityImpact: text("liquidity_impact"),  // Market liquidity assessment
  breakEvenPoint: numeric("break_even_point"), // Price at which position breaks even
  simulationData: jsonb("simulation_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSimulationSchema = createInsertSchema(simulations).pick({
  userId: true,
  name: true,
  asset: true,
  prediction: true,
  confidence: true,
  volatility: true,
  upperBound: true,
  lowerBound: true,
  recommendation: true,
  yieldValue: true,
  gasFees: true,
  impermanentLoss: true,
  liquidityImpact: true,
  breakEvenPoint: true,
  simulationData: true,
});

// Market data table
export const marketData = pgTable("market_data", {
  id: serial("id").primaryKey(),
  asset: text("asset").notNull(),
  ticker: text("ticker").notNull(),
  price: numeric("price").notNull(),
  change24h: numeric("change_24h"),
  volume24h: numeric("volume_24h"),
  gasPrice: numeric("gas_price"),
  gasData: jsonb("gas_data"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMarketDataSchema = createInsertSchema(marketData).pick({
  asset: true,
  ticker: true,
  price: true,
  change24h: true,
  volume24h: true,
  gasPrice: true,
  gasData: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Position = typeof positions.$inferSelect;
export type InsertPosition = z.infer<typeof insertPositionSchema>;

export type SmartContract = typeof smartContracts.$inferSelect;
export type InsertSmartContract = z.infer<typeof insertSmartContractSchema>;

export type ApiIntegration = typeof apiIntegrations.$inferSelect;
export type InsertApiIntegration = z.infer<typeof insertApiIntegrationSchema>;

export type Simulation = typeof simulations.$inferSelect;
export type InsertSimulation = z.infer<typeof insertSimulationSchema>;

export type MarketData = typeof marketData.$inferSelect;
export type InsertMarketData = z.infer<typeof insertMarketDataSchema>;
