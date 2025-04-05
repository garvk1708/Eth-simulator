import { useState, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useEthereum } from '@/hooks/use-ethereum';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as tf from '@tensorflow/tfjs';

interface SimulationResult {
  asset: string;
  prediction: number;
  confidence: number;
  volatility: 'Low' | 'Medium' | 'High';
  upperBound: number;
  lowerBound: number;
  recommendation: string;
  yieldValue: number;       // Annual yield percentage
  gasFees: number;          // Estimated gas fees for transactions
  impermanentLoss: number;  // Estimated impermanent loss percentage
  liquidityImpact: 'Low' | 'Medium' | 'High'; // Market liquidity assessment
  breakEvenPoint: number;   // Price at which position breaks even
  simulationData: {
    dates: string[];
    actual: number[];
    predicted: number[];
    upperBound: number[];
    lowerBound: number[];
  };
}

export function useSimulation() {
  const { address } = useEthereum();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRunning, setIsRunning] = useState(false);

  // Fetch existing simulations
  const { data: simulations, isLoading: isLoadingSimulations } = useQuery({
    queryKey: ['/api/simulations', address],
    queryFn: async () => {
      if (!address) return [];
      const response = await fetch(`/api/simulations?userId=1`); // In a real app, use actual userId
      if (!response.ok) throw new Error('Failed to fetch simulations');
      return response.json();
    },
    enabled: !!address
  });

  // Function to run a new price prediction simulation
  const runSimulation = useCallback(async (asset: string): Promise<SimulationResult | null> => {
    if (!address) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first',
        variant: 'destructive'
      });
      return null;
    }

    setIsRunning(true);
    try {
      // Get historical price data (in a real app, this would come from an external API)
      const marketDataResponse = await fetch(`/api/market-data?asset=${asset}`);
      if (!marketDataResponse.ok) throw new Error('Failed to fetch market data');
      const marketData = await marketDataResponse.json();
      
      // Generate dates (for the last 30 days)
      const dates = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (30 - i));
        return date.toISOString().split('T')[0];
      });
      
      // Generate simulated historical prices based on current price
      const currentPrice = parseFloat(marketData.price);
      const volatilityFactor = Math.random() * 0.5 + 0.5; // Random factor between 0.5 and 1.0
      
      const historicalPrices = dates.map((_, i) => {
        // Create a price that fluctuates around the current price
        const daysSinceStart = i;
        const randomWalk = Math.cos(daysSinceStart * 0.4) * currentPrice * 0.15 * volatilityFactor;
        const trend = daysSinceStart * currentPrice * 0.001 * (Math.random() > 0.5 ? 1 : -1);
        return Math.max(currentPrice + randomWalk + trend, 0.01);
      });
      
      // Using TensorFlow.js to create a simple prediction model
      // In a real app, this would be a more sophisticated model trained on actual historical data
      const model = tf.sequential();
      model.add(tf.layers.dense({ units: 10, inputShape: [10], activation: 'relu' }));
      model.add(tf.layers.dense({ units: 1 }));
      model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });
      
      // Prepare data for the model
      const windowSize = 10;
      const inputs = [];
      const targets = [];
      
      for (let i = 0; i <= historicalPrices.length - windowSize - 1; i++) {
        const windowData = historicalPrices.slice(i, i + windowSize);
        const target = historicalPrices[i + windowSize];
        inputs.push(windowData);
        targets.push(target);
      }
      
      const xs = tf.tensor2d(inputs);
      const ys = tf.tensor2d(targets.map(t => [t]));
      
      // Train the model
      await model.fit(xs, ys, { epochs: 50, verbose: 0 });
      
      // Make predictions for the next 7 days
      const futureDays = 7;
      let lastWindow = historicalPrices.slice(-windowSize);
      const predictions = [];
      
      for (let i = 0; i < futureDays; i++) {
        const prediction = model.predict(tf.tensor2d([lastWindow])) as tf.Tensor;
        const predictedValue = prediction.dataSync()[0];
        predictions.push(predictedValue);
        
        // Update the window for the next prediction
        lastWindow = [...lastWindow.slice(1), predictedValue];
      }
      
      // Generate confidence and bounds
      const confidence = Math.round((1 - Math.random() * 0.3) * 100); // Random confidence between 70-100%
      const volatilityValue = Math.random();
      const volatilityRating = volatilityValue < 0.3 ? 'Low' : volatilityValue < 0.7 ? 'Medium' : 'High';
      
      // Calculate prediction bounds
      const volatilityMultiplier = volatilityValue * 0.2 + 0.05; // Between 5-25% based on volatility
      const upperBounds = predictions.map(p => p * (1 + volatilityMultiplier));
      const lowerBounds = predictions.map(p => p * (1 - volatilityMultiplier));
      
      // Generate future dates
      const futureDates = Array.from({ length: futureDays }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i + 1);
        return date.toISOString().split('T')[0];
      });
      
      // Build recommendation based on predictions
      const lastActualPrice = historicalPrices[historicalPrices.length - 1];
      const lastPrediction = predictions[predictions.length - 1];
      const priceDifference = ((lastPrediction - lastActualPrice) / lastActualPrice) * 100;
      
      let recommendation;
      if (priceDifference > 5) {
        recommendation = `Consider increasing your ${asset} position by ${Math.round(priceDifference / 2)}% based on current simulation data.`;
      } else if (priceDifference < -5) {
        recommendation = `Consider reducing your ${asset} position by ${Math.round(Math.abs(priceDifference) / 2)}% based on current simulation data.`;
      } else {
        recommendation = `Your current ${asset} position appears optimal based on simulation data. Consider maintaining current levels.`;
      }
      
      // Calculate additional simulation factors
      const currentNetworkGasPrice = asset === "Ethereum" ? 50 : 25; // Gwei
      const yieldValue = 5 + (Math.random() * 10); // Annual yield between 5-15%
      const gasFees = currentNetworkGasPrice * (3 + Math.random() * 2); // Base gas cost in USD
      
      // Calculate impermanent loss based on price volatility and deviation
      const priceDeviation = Math.abs(priceDifference) / 100;
      const impermanentLoss = (2 * Math.sqrt(priceDeviation + 1) / (priceDeviation + 1)) - 1;
      const impermanentLossPercentage = Math.abs(impermanentLoss * 100);
      
      // Assess market liquidity based on trading volume and volatility
      const volumeScore = Math.random(); // Simulated volume score between 0-1
      const liquidityImpact = volumeScore < 0.3 ? 'High' : volumeScore < 0.7 ? 'Medium' : 'Low';
      
      // Calculate break-even point based on entry price and transaction costs
      const entryPrice = lastActualPrice;
      const transactionCostPercentage = 0.3; // 0.3% total transaction costs
      const breakEvenPoint = entryPrice * (1 + transactionCostPercentage / 100);

      // Construct simulation result
      const simulationResult: SimulationResult = {
        asset,
        prediction: parseFloat(lastPrediction.toFixed(2)),
        confidence,
        volatility: volatilityRating as 'Low' | 'Medium' | 'High',
        upperBound: parseFloat(upperBounds[upperBounds.length - 1].toFixed(2)),
        lowerBound: parseFloat(lowerBounds[lowerBounds.length - 1].toFixed(2)),
        recommendation,
        yieldValue: parseFloat(yieldValue.toFixed(2)),
        gasFees: parseFloat(gasFees.toFixed(2)),
        impermanentLoss: parseFloat(impermanentLossPercentage.toFixed(2)),
        liquidityImpact: liquidityImpact as 'Low' | 'Medium' | 'High',
        breakEvenPoint: parseFloat(breakEvenPoint.toFixed(2)),
        simulationData: {
          dates: [...dates, ...futureDates],
          actual: [...historicalPrices, ...Array(futureDays).fill(null)],
          predicted: [...Array(dates.length).fill(null), ...predictions.map(p => parseFloat(p.toFixed(2)))],
          upperBound: [...Array(dates.length).fill(null), ...upperBounds.map(p => parseFloat(p.toFixed(2)))],
          lowerBound: [...Array(dates.length).fill(null), ...lowerBounds.map(p => parseFloat(p.toFixed(2)))],
        }
      };
      
      // Save the simulation to the backend
      await apiRequest('POST', '/api/simulations', {
        userId: 1, // In a real app, use actual userId
        name: `${asset} Price Prediction`,
        asset,
        prediction: simulationResult.prediction,
        confidence,
        volatility: volatilityRating,
        upperBound: simulationResult.upperBound,
        lowerBound: simulationResult.lowerBound,
        recommendation,
        yieldValue: simulationResult.yieldValue,
        gasFees: simulationResult.gasFees,
        impermanentLoss: simulationResult.impermanentLoss,
        liquidityImpact: simulationResult.liquidityImpact,
        breakEvenPoint: simulationResult.breakEvenPoint,
        simulationData: simulationResult.simulationData
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/simulations'] });
      
      toast({
        title: 'Simulation complete',
        description: `${asset} price prediction simulation has been successfully generated`
      });
      
      return simulationResult;
    } catch (error: any) {
      console.error('Error running simulation:', error);
      toast({
        title: 'Simulation failed',
        description: error.message || 'An error occurred during the simulation',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsRunning(false);
    }
  }, [address, queryClient, toast]);

  // Mutation for deleting simulations
  const { mutate: deleteSimulation } = useMutation({
    mutationFn: async (simulationId: number) => {
      const response = await apiRequest('DELETE', `/api/simulations/${simulationId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/simulations'] });
      toast({
        title: 'Simulation deleted',
        description: 'The simulation has been successfully deleted'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete simulation',
        description: error.message || 'An error occurred while deleting the simulation',
        variant: 'destructive'
      });
    }
  });

  return {
    simulations,
    isLoadingSimulations,
    runSimulation,
    deleteSimulation,
    isRunning
  };
}
