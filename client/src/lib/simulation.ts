import * as tf from '@tensorflow/tfjs';

// Function to generate dates for the time series
export function generateDateRange(startDate: Date, days: number): string[] {
  const dates = [];
  const currentDate = new Date(startDate);
  
  for (let i = 0; i < days; i++) {
    dates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

// Function to generate historical price simulation (for demo purposes)
export function generateHistoricalPrices(
  basePrice: number,
  days: number,
  volatility: number = 0.03
): number[] {
  const prices = [basePrice];
  
  for (let i = 1; i < days; i++) {
    // Use a combination of random walk, trend, and cyclical components
    const randomWalk = Math.random() * 2 - 1; // Between -1 and 1
    const trend = Math.sin(i / 10) * 0.5; // Cyclical trend component
    const changePercent = (randomWalk * volatility) + (trend * volatility / 2);
    
    // Calculate new price with the change
    const prevPrice = prices[i - 1];
    const newPrice = prevPrice * (1 + changePercent);
    prices.push(Math.max(newPrice, 0.01)); // Ensure price doesn't go below 0.01
  }
  
  return prices;
}

// Function to create and train a simple price prediction model
export async function trainPricePredictionModel(
  historicalPrices: number[],
  windowSize: number = 10,
  epochs: number = 50
): Promise<tf.LayersModel> {
  // Create a simple sequential model
  const model = tf.sequential();
  
  // Add layers to the model
  model.add(tf.layers.dense({ units: 10, inputShape: [windowSize], activation: 'relu' }));
  model.add(tf.layers.dense({ units: 1 }));
  
  // Compile the model
  model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });
  
  // Prepare training data
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
  await model.fit(xs, ys, { epochs, verbose: 0 });
  
  return model;
}

// Function to make price predictions
export async function predictPrices(
  model: tf.LayersModel,
  historicalPrices: number[],
  windowSize: number = 10,
  futureDays: number = 7
): Promise<number[]> {
  let lastWindow = historicalPrices.slice(-windowSize);
  const predictions = [];
  
  for (let i = 0; i < futureDays; i++) {
    const prediction = model.predict(tf.tensor2d([lastWindow])) as tf.Tensor;
    const predictedValue = prediction.dataSync()[0];
    predictions.push(predictedValue);
    
    // Update the window for the next prediction
    lastWindow = [...lastWindow.slice(1), predictedValue];
  }
  
  return predictions;
}

// Function to calculate volatility bounds
export function calculateVolatilityBounds(
  predictions: number[],
  volatilityRating: 'Low' | 'Medium' | 'High'
): { upperBounds: number[], lowerBounds: number[] } {
  // Set volatility multiplier based on rating
  let volatilityMultiplier;
  switch (volatilityRating) {
    case 'Low':
      volatilityMultiplier = 0.05; // 5% bounds
      break;
    case 'Medium':
      volatilityMultiplier = 0.15; // 15% bounds
      break;
    case 'High':
      volatilityMultiplier = 0.25; // 25% bounds
      break;
    default:
      volatilityMultiplier = 0.1;
  }
  
  const upperBounds = predictions.map(p => p * (1 + volatilityMultiplier));
  const lowerBounds = predictions.map(p => p * (1 - volatilityMultiplier));
  
  return { upperBounds, lowerBounds };
}

// Function to generate a price movement recommendation
export function generateRecommendation(
  asset: string,
  lastPrice: number,
  predictedPrice: number
): string {
  const priceDifference = ((predictedPrice - lastPrice) / lastPrice) * 100;
  
  if (priceDifference > 5) {
    return `Consider increasing your ${asset} position by ${Math.round(priceDifference / 2)}% based on current simulation data.`;
  } else if (priceDifference < -5) {
    return `Consider reducing your ${asset} position by ${Math.round(Math.abs(priceDifference) / 2)}% based on current simulation data.`;
  } else {
    return `Your current ${asset} position appears optimal based on simulation data. Consider maintaining current levels.`;
  }
}

// Run a complete simulation - this could be called from a UI component
export async function runCompleteSimulation(
  asset: string,
  currentPrice: number,
  historicalDays: number = 30,
  futureDays: number = 7,
  volatility: 'Low' | 'Medium' | 'High' = 'Medium'
) {
  // Generate historical dates and prices
  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - historicalDays);
  
  const allDates = generateDateRange(startDate, historicalDays + futureDays);
  const historicalDates = allDates.slice(0, historicalDays);
  const futureDates = allDates.slice(historicalDays);
  
  // Generate simulated historical prices
  const volatilityFactor = volatility === 'Low' ? 0.02 : volatility === 'Medium' ? 0.03 : 0.05;
  const historicalPrices = generateHistoricalPrices(currentPrice, historicalDays, volatilityFactor);
  
  // Train model and make predictions
  const windowSize = 10;
  const model = await trainPricePredictionModel(historicalPrices, windowSize);
  const predictions = await predictPrices(model, historicalPrices, windowSize, futureDays);
  
  // Calculate bounds
  const { upperBounds, lowerBounds } = calculateVolatilityBounds(predictions, volatility);
  
  // Generate recommendation
  const lastActualPrice = historicalPrices[historicalPrices.length - 1];
  const lastPrediction = predictions[predictions.length - 1];
  const recommendation = generateRecommendation(asset, lastActualPrice, lastPrediction);
  
  // Calculate confidence (simulated - would be more sophisticated in a real application)
  const confidence = Math.round((1 - (volatilityFactor * 5)) * 100);
  
  // Return complete simulation data
  return {
    asset,
    prediction: parseFloat(lastPrediction.toFixed(2)),
    confidence,
    volatility,
    upperBound: parseFloat(upperBounds[upperBounds.length - 1].toFixed(2)),
    lowerBound: parseFloat(lowerBounds[lowerBounds.length - 1].toFixed(2)),
    recommendation,
    simulationData: {
      dates: allDates,
      actual: [...historicalPrices, ...Array(futureDays).fill(null)],
      predicted: [...Array(historicalDays).fill(null), ...predictions.map(p => parseFloat(p.toFixed(2)))],
      upperBound: [...Array(historicalDays).fill(null), ...upperBounds.map(p => parseFloat(p.toFixed(2)))],
      lowerBound: [...Array(historicalDays).fill(null), ...lowerBounds.map(p => parseFloat(p.toFixed(2)))],
    }
  };
}
