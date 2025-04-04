import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useEthereum } from '@/hooks/use-ethereum';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Common ERC-20 Token ABI (for token interactions)
const ERC20_ABI = [
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

// Basic staking contract ABI (example)
const STAKING_ABI = [
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

interface TokenData {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  balance: string;
}

interface StakingData {
  stakedBalance: string;
  rewards: string;
  rewardRate: string;
  totalStaked: string;
}

export function useTokenContract(tokenAddress?: string) {
  const { provider, signer, address } = useEthereum();
  const [isLoading, setIsLoading] = useState(false);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const { toast } = useToast();

  const fetchTokenData = useCallback(async () => {
    if (!tokenAddress || !provider || !signer || !address) return;

    setIsLoading(true);
    try {
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

      const [name, symbol, decimals, totalSupply, balance] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.decimals(),
        tokenContract.totalSupply(),
        tokenContract.balanceOf(address)
      ]);

      setTokenData({
        name,
        symbol,
        decimals,
        totalSupply: ethers.formatUnits(totalSupply, decimals),
        balance: ethers.formatUnits(balance, decimals)
      });
    } catch (error: any) {
      console.error('Error fetching token data:', error);
      toast({
        title: 'Failed to load token data',
        description: error.message || 'Check that the address is a valid ERC-20 token',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [tokenAddress, provider, signer, address, toast]);

  const transfer = useCallback(async (to: string, amount: string) => {
    if (!tokenAddress || !provider || !signer) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      const decimals = await tokenContract.decimals();
      const parsedAmount = ethers.parseUnits(amount, decimals);

      const tx = await tokenContract.transfer(to, parsedAmount);
      await tx.wait();

      toast({
        title: 'Transfer successful',
        description: `${amount} tokens transferred to ${to.substring(0, 6)}...${to.substring(38)}`
      });

      // Refresh token data
      fetchTokenData();
    } catch (error: any) {
      console.error('Error transferring tokens:', error);
      toast({
        title: 'Transfer failed',
        description: error.message || 'An error occurred during the transfer',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [tokenAddress, provider, signer, fetchTokenData, toast]);

  const approve = useCallback(async (spender: string, amount: string) => {
    if (!tokenAddress || !provider || !signer) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      const decimals = await tokenContract.decimals();
      const parsedAmount = ethers.parseUnits(amount, decimals);

      const tx = await tokenContract.approve(spender, parsedAmount);
      await tx.wait();

      toast({
        title: 'Approval successful',
        description: `${amount} tokens approved for ${spender.substring(0, 6)}...${spender.substring(38)}`
      });
    } catch (error: any) {
      console.error('Error approving tokens:', error);
      toast({
        title: 'Approval failed',
        description: error.message || 'An error occurred during the approval',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [tokenAddress, provider, signer, toast]);

  return {
    tokenData,
    isLoading,
    fetchTokenData,
    transfer,
    approve
  };
}

export function useStakingContract(stakingContractAddress?: string, tokenAddress?: string) {
  const { provider, signer, address } = useEthereum();
  const [isLoading, setIsLoading] = useState(false);
  const [stakingData, setStakingData] = useState<StakingData | null>(null);
  const { toast } = useToast();
  const { tokenData, fetchTokenData } = useTokenContract(tokenAddress);

  const fetchStakingData = useCallback(async () => {
    if (!stakingContractAddress || !provider || !address) return;

    setIsLoading(true);
    try {
      const stakingContract = new ethers.Contract(stakingContractAddress, STAKING_ABI, provider);

      const [stakedBalance, rewards, rewardRate, totalStaked] = await Promise.all([
        stakingContract.balanceOf(address),
        stakingContract.earned(address),
        stakingContract.rewardRate(),
        stakingContract.totalSupply()
      ]);

      setStakingData({
        stakedBalance: ethers.formatEther(stakedBalance),
        rewards: ethers.formatEther(rewards),
        rewardRate: ethers.formatEther(rewardRate),
        totalStaked: ethers.formatEther(totalStaked)
      });
    } catch (error: any) {
      console.error('Error fetching staking data:', error);
      toast({
        title: 'Failed to load staking data',
        description: error.message || 'An error occurred while fetching staking information',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [stakingContractAddress, provider, address, toast]);

  const stake = useCallback(async (amount: string) => {
    if (!stakingContractAddress || !tokenAddress || !provider || !signer) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      // First, approve the staking contract to spend tokens
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      const decimals = await tokenContract.decimals();
      const parsedAmount = ethers.parseUnits(amount, decimals);

      const allowance = await tokenContract.allowance(address, stakingContractAddress);
      if (allowance < parsedAmount) {
        const approveTx = await tokenContract.approve(stakingContractAddress, parsedAmount);
        await approveTx.wait();
      }

      // Now, stake the tokens
      const stakingContract = new ethers.Contract(stakingContractAddress, STAKING_ABI, signer);
      const stakeTx = await stakingContract.stake(parsedAmount);
      await stakeTx.wait();

      toast({
        title: 'Stake successful',
        description: `${amount} tokens staked`
      });

      // Refresh staking data
      fetchStakingData();
      if (fetchTokenData) fetchTokenData();
    } catch (error: any) {
      console.error('Error staking tokens:', error);
      toast({
        title: 'Staking failed',
        description: error.message || 'An error occurred during the staking process',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [stakingContractAddress, tokenAddress, provider, signer, address, fetchStakingData, fetchTokenData, toast]);

  const withdraw = useCallback(async (amount: string) => {
    if (!stakingContractAddress || !provider || !signer) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const stakingContract = new ethers.Contract(stakingContractAddress, STAKING_ABI, signer);
      const parsedAmount = ethers.parseEther(amount);

      const tx = await stakingContract.withdraw(parsedAmount);
      await tx.wait();

      toast({
        title: 'Withdraw successful',
        description: `${amount} tokens withdrawn`
      });

      // Refresh staking data
      fetchStakingData();
      if (fetchTokenData) fetchTokenData();
    } catch (error: any) {
      console.error('Error withdrawing tokens:', error);
      toast({
        title: 'Withdrawal failed',
        description: error.message || 'An error occurred during the withdrawal process',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [stakingContractAddress, provider, signer, fetchStakingData, fetchTokenData, toast]);

  const getReward = useCallback(async () => {
    if (!stakingContractAddress || !provider || !signer) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const stakingContract = new ethers.Contract(stakingContractAddress, STAKING_ABI, signer);

      const tx = await stakingContract.getReward();
      await tx.wait();

      toast({
        title: 'Rewards claimed',
        description: 'Successfully claimed staking rewards'
      });

      // Refresh staking data
      fetchStakingData();
    } catch (error: any) {
      console.error('Error claiming rewards:', error);
      toast({
        title: 'Failed to claim rewards',
        description: error.message || 'An error occurred while claiming rewards',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [stakingContractAddress, provider, signer, fetchStakingData, toast]);

  return {
    tokenData,
    stakingData,
    isLoading,
    fetchStakingData,
    stake,
    withdraw,
    getReward
  };
}

export function useSmartContractStorage() {
  const { toast } = useToast();
  const { address } = useEthereum();

  const saveSmartContract = useCallback(async (name: string, contractAddress: string, status: string, details: any) => {
    if (!address) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first',
        variant: 'destructive'
      });
      return null;
    }

    try {
      const response = await apiRequest('POST', '/api/smart-contracts', {
        userId: 1, // In a real app, this would be the actual user ID
        name,
        contractAddress,
        status,
        details
      });

      const data = await response.json();
      
      toast({
        title: 'Contract saved',
        description: `Smart contract "${name}" has been saved`
      });
      
      return data;
    } catch (error: any) {
      console.error('Error saving smart contract:', error);
      toast({
        title: 'Failed to save contract',
        description: error.message || 'An error occurred while saving the contract',
        variant: 'destructive'
      });
      return null;
    }
  }, [address, toast]);

  return { saveSmartContract };
}
