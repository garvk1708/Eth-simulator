# Ethereum Simulator

A full-stack application for simulating Ethereum blockchain interactions, trading, and smart contract deployment in a controlled environment.

## 🚀 Features

- 🔗 Connect to simulated Ethereum wallets
- 📊 Real-time market data via WebSockets
- 💰 Manage positions and trading strategies
- 📝 Create and deploy simulated smart contracts
- 📈 Visualize analytics and performance metrics
- 🧪 Run blockchain simulations
- 🔄 **Batch operations across different Ethereum protocols generating digital tokens via smart contracts to reduce gas fees**

## 🛠 Tech Stack

### Frontend
- React with TypeScript
- TanStack Query for data fetching
- Custom hooks for state management
- WebSocket for real-time updates
- Responsive UI components (TailwindCSS / ShadCN)

### Backend
- Node.js with Express
- WebSocket server for real-time data
- In-memory data storage with optional persistence
- RESTful API endpoints
- **Smart contract batching engine for gas optimization**

## ⚙️ Getting Started

### Prerequisites
- Node.js v16+ (v18 LTS recommended)
- npm or yarn

### Installation

# Clone the repository
git clone https://github.com/Atul-Koundal/Eth-simulator.git
cd ethereum-simulator

# Install dependencies
npm install
# or
yarn install

# Start the development server
npm run dev
# or
yarn dev

Then open your browser and navigate to: http://localhost:4000

## 🔌 WebSocket

Real-time market data via WebSocket:

ws://localhost:4000

## 🧠 Operation Batching System

Our innovative batching system aggregates operations across multiple Ethereum protocols into unified transactions:

- **Gas Fee Reduction**: Significantly lower transaction costs by batching multiple operations
- **Token Generation**: Smart contracts automatically mint digital tokens representing batched operations
- **Cross-Protocol Compatibility**: Works with major DeFi protocols, DEXs, and NFT marketplaces
- **Simulation Environment**: Test gas savings before deploying to mainnet

## 🧪 Development

### Available Scripts

npm run dev        # Start development server  
npm run build      # Build for production  
npm run start      # Run production server  
npm run lint       # Lint code  
npm run test       # Run tests  

## 🛠 Troubleshooting

### WebSocket Connection Issues
- Check if port 4000 is free
- Ensure WebSockets are supported by your browser
- Look at backend logs for clues

### Port Conflicts
- Modify `.env` or server config if needed

### Batching Issues
- Ensure compatible protocol versions
- Check smart contract gas requirements
- Verify token generation parameters

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for more info.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.