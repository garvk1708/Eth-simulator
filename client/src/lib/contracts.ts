import { ethers } from 'ethers';

// Common ABIs
export const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 amount)',
  'event Approval(address indexed owner, address indexed spender, uint256 amount)'
];

export const STAKING_ABI = [
  'function stake(uint256 amount) returns (bool)',
  'function withdraw(uint256 amount) returns (bool)',
  'function getReward() returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function earned(address account) view returns (uint256)',
  'function rewardRate() view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'event Staked(address indexed user, uint256 amount)',
  'event Withdrawn(address indexed user, uint256 amount)',
  'event RewardPaid(address indexed user, uint256 reward)'
];

// Contract types for the UI
export const CONTRACT_TYPES = [
  { id: 'erc20', name: 'ERC-20 Token', description: 'Standard token interface' },
  { id: 'staking', name: 'Staking Contract', description: 'Stake tokens to earn rewards' },
  { id: 'lending', name: 'Lending Protocol', description: 'Lend and borrow assets' },
  { id: 'dex', name: 'Decentralized Exchange', description: 'Trade tokens directly' },
  { id: 'nft', name: 'NFT Collection', description: 'Non-fungible token collection' },
  { id: 'dao', name: 'DAO', description: 'Decentralized governance' },
  { id: 'custom', name: 'Custom Contract', description: 'Other smart contract' }
];

// Example contract templates with sample ABIs for UI
export const CONTRACT_TEMPLATES = [
  {
    id: 'erc20_standard',
    name: 'Standard ERC-20 Token',
    type: 'erc20',
    description: 'A standard ERC-20 token with basic functionality',
    abi: ERC20_ABI
  },
  {
    id: 'staking_basic',
    name: 'Basic Staking Contract',
    type: 'staking',
    description: 'A simple staking contract for earning rewards',
    abi: STAKING_ABI
  }
];

// Function to detect contract type from ABI
export async function detectContractType(
  contractAddress: string,
  provider: ethers.Provider
): Promise<string> {
  try {
    // Try to create an ERC20 contract
    const erc20Contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
    
    // Check if contract has typical ERC20 methods
    try {
      const [name, symbol, decimals] = await Promise.all([
        erc20Contract.name(),
        erc20Contract.symbol(),
        erc20Contract.decimals()
      ]);
      
      if (name && symbol && typeof decimals === 'number') {
        return 'erc20';
      }
    } catch (error) {
      // Not an ERC20 token
    }
    
    // Try to check if it's a staking contract
    const stakingContract = new ethers.Contract(contractAddress, STAKING_ABI, provider);
    try {
      const totalSupply = await stakingContract.totalSupply();
      const rewardRate = await stakingContract.rewardRate();
      
      if (totalSupply !== undefined && rewardRate !== undefined) {
        return 'staking';
      }
    } catch (error) {
      // Not a staking contract
    }
    
    // Default to custom if we can't determine the type
    return 'custom';
  } catch (error) {
    console.error('Error detecting contract type:', error);
    return 'custom';
  }
}

// Function to verify contract on the blockchain
export async function verifyContract(
  contractAddress: string,
  provider: ethers.Provider
): Promise<boolean> {
  try {
    const code = await provider.getCode(contractAddress);
    // If address has code, it's a contract
    return code !== '0x';
  } catch (error) {
    console.error('Error verifying contract:', error);
    return false;
  }
}

// Function to get contract details
export async function getContractDetails(
  contractAddress: string,
  provider: ethers.Provider
): Promise<any> {
  try {
    // Verify if it's a valid contract
    const isContract = await verifyContract(contractAddress, provider);
    if (!isContract) {
      throw new Error('Not a valid contract address');
    }
    
    // Try to detect contract type
    const contractType = await detectContractType(contractAddress, provider);
    
    // Get basic details based on type
    let details: any = {
      address: contractAddress,
      type: contractType
    };
    
    if (contractType === 'erc20') {
      const erc20Contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        erc20Contract.name(),
        erc20Contract.symbol(),
        erc20Contract.decimals(),
        erc20Contract.totalSupply()
      ]);
      
      details = {
        ...details,
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: ethers.formatUnits(totalSupply, decimals)
      };
    } else if (contractType === 'staking') {
      const stakingContract = new ethers.Contract(contractAddress, STAKING_ABI, provider);
      const totalSupply = await stakingContract.totalSupply();
      const rewardRate = await stakingContract.rewardRate();
      
      details = {
        ...details,
        totalStaked: ethers.formatEther(totalSupply),
        rewardRate: ethers.formatEther(rewardRate)
      };
    }
    
    return details;
  } catch (error) {
    console.error('Error getting contract details:', error);
    throw error;
  }
}
