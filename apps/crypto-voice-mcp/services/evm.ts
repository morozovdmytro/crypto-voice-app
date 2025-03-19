import { Chain, createPublicClient, erc20Abi, http, PublicClient } from 'viem';
import 'dotenv/config';
import { Transaction } from '../types';
import { createLogger } from './logger';
import { BlockchainService } from '../abstraction';
import { BLOCKS_PER_DAY_ESTIMATE } from '../constants';
import { DEFAULT_LOOKBACK_DAYS } from '../constants';

const logger = createLogger('EvmService');

export class EvmService implements BlockchainService {
  private readonly publicClient: PublicClient;
  private readonly blocksPerDay: number;

  constructor(chain: Chain, blocksPerDay: number = BLOCKS_PER_DAY_ESTIMATE) {
    logger.info({ chain: chain.name }, 'Initializing EVM service');
    this.publicClient = createPublicClient({
      chain,
      transport: http(process.env.RPC_URL),
    });
    this.blocksPerDay = blocksPerDay;
  }

  private formatTransaction = (tx: any): Transaction => {
    return {
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value.toString(),
      blockNumber: tx.blockNumber,
      timestamp: tx.timestamp || null,
      gasUsed: tx.gasUsed || null,
      status: tx.status || null,
      tokenName: tx.tokenName || null,
      tokenSymbol: tx.tokenSymbol || null,
      tokenDecimal: tx.tokenDecimal || null,
    };
  };

  private async calculateFromBlock(daysBack: number = DEFAULT_LOOKBACK_DAYS): Promise<bigint> {
    const blocksToGoBack = BigInt(Math.floor(daysBack * this.blocksPerDay));
    return await this.publicClient.getBlockNumber().then(currentBlock => {
      return currentBlock - blocksToGoBack;
    });
  }

  public async getTransactions(
    address: string, 
    page: number = 1, 
    limit: number = 10, 
    daysBack: number = DEFAULT_LOOKBACK_DAYS
  ): Promise<Transaction[]> {
    try {
      logger.info({ address, page, limit, daysBack }, 'Fetching transactions');
      const blockNumber = await this.publicClient.getBlockNumber();
      const fromBlock = await this.calculateFromBlock(daysBack);
  
      logger.debug({ 
        blockNumber: blockNumber.toString(), 
        fromBlock: fromBlock.toString(),
        daysBack,
        estimatedBlocks: (daysBack * this.blocksPerDay).toString()
      }, 'Block range');
      
      const filter = await this.publicClient.createEventFilter({
        fromBlock,
        address: [address as `0x${string}`],
      });
      
      const logs = await this.publicClient.getFilterLogs({ filter });
      logger.debug({ logsCount: logs.length }, 'Logs retrieved');
  
      const transactions: Transaction[] = [];
      
      for (const log of logs.slice((page - 1) * limit, page * limit)) {
        logger.debug({ transactionHash: log.transactionHash }, 'Processing transaction');
        
        const tx = await this.publicClient.getTransaction({
          hash: log.transactionHash,
        });
        
        const receipt = await this.publicClient.getTransactionReceipt({
          hash: log.transactionHash,
        });
        
        const block = await this.publicClient.getBlock({
          blockNumber: log.blockNumber,
        });
        
        transactions.push(this.formatTransaction({
          ...tx,
          timestamp: Number(block.timestamp),
          gasUsed: receipt.gasUsed,
          status: receipt.status === 'success'
        }));
      }
  
      logger.info({ count: transactions.length }, 'Transactions fetched successfully');
      return transactions;
    } catch (error) {
      logger.error({ error, address }, 'Error fetching transactions');
      throw error;
    }
  }

  public async getTokenTransactions(
    address: string, 
    contractAddress: string, 
    page: number = 1, 
    limit: number = 10,
    daysBack: number = DEFAULT_LOOKBACK_DAYS
  ): Promise<Transaction[]> {
    try {
      logger.info({ address, contractAddress, page, limit, daysBack }, 'Fetching token transactions');
      
      const blockNumber = await this.publicClient.getBlockNumber();
      const fromBlock = await this.calculateFromBlock(daysBack);
      
      logger.debug({ 
        blockNumber: blockNumber.toString(), 
        fromBlock: fromBlock.toString(),
        daysBack,
        estimatedBlocks: (daysBack * this.blocksPerDay).toString()
      }, 'Block range');

      const logs = await this.publicClient.getContractEvents({
        fromBlock,
        address: contractAddress as `0x${string}`,
        abi: erc20Abi,
        eventName: 'Transfer',
        args: {
          from: address as `0x${string}`,
          to: address as `0x${string}`,
        }
      });
      
      logger.debug({ logsCount: logs.length }, 'Token event logs retrieved');
      
      const transactions: Transaction[] = [];
      
      for (const log of logs.slice((page - 1) * limit, page * limit)) {
        logger.debug({ transactionHash: log.transactionHash }, 'Processing token transaction');
        
        const tx = await this.publicClient.getTransaction({
          hash: log.transactionHash,
        });
      
        const receipt = await this.publicClient.getTransactionReceipt({
          hash: log.transactionHash,
        });
      
        const block = await this.publicClient.getBlock({
          blockNumber: log.blockNumber,
        });

        transactions.push(this.formatTransaction({
          ...tx,
          timestamp: Number(block.timestamp),
          gasUsed: receipt.gasUsed,
          status: receipt.status === 'success'
        }));
      }

      logger.info({ count: transactions.length }, 'Token transactions fetched successfully');
      return transactions;
    } catch (error) {
      logger.error({ error, address, contractAddress }, 'Error fetching token transactions');
      throw error;
    }
  }

  public async getBalance(address: string): Promise<bigint> {
    return await this.publicClient.getBalance({
      address: address as `0x${string}`,
    });
  }

  public async getTokenBalance(address: string, contractAddress: string): Promise<bigint> {
    try {
      logger.info({ address, contractAddress }, 'Fetching token balance');
      
      const balance = await this.publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
      });
      
      logger.info({ address, contractAddress, balance: balance.toString() }, 'Token balance fetched successfully');
      return balance;
    } catch (error) {
      logger.error({ error, address, contractAddress }, 'Error fetching token balance');
      throw error;
    }
  }
}