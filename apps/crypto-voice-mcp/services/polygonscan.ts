import { BlockchainService } from "../abstraction";
import { DEFAULT_LOOKBACK_DAYS } from "../constants";
import { Transaction } from "../types";
import { createLogger } from "./logger";

const logger = createLogger('PolygonScanService');

export class PolygonScanService implements BlockchainService {
    private readonly apiKey: string;

    constructor() {
        this.apiKey = process.env.POLYGONSCAN_API_KEY || '';
        logger.info('Initializing PolygonScan service');
        if (!this.apiKey) {
            logger.warn('No Polygonscan API key provided');
        }
    }

    private async fetch(params: Record<string, string>): Promise<any> {
        logger.debug({ params: { ...params, apikey: '***' } }, 'Making API request to Polygonscan');
        
        try {
            const url = `https://api.polygonscan.com/api?${new URLSearchParams({
                ...params,
                apikey: this.apiKey,
            })}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.status === '0') {
                logger.warn({ message: data.message, result: data.result }, 'Polygonscan API returned an error');
                throw new Error(`Polygonscan API error: ${data.message || data.result}`);
            }
            
            logger.debug({ status: data.status, resultCount: Array.isArray(data.result) ? data.result.length : 'N/A' }, 'API response received');
            return data;
        } catch (error) {
            logger.error({ error, params: { ...params, apikey: '***' } }, 'Error making Polygonscan API request');
            throw error;
        }
    }

    public async getTransactions(address: string, page: number = 1, limit: number = 10, daysBack: number = DEFAULT_LOOKBACK_DAYS): Promise<Transaction[]> {
        logger.info({ address, page, limit, daysBack }, 'Fetching transactions from Polygonscan');
        
        try {
            const response = await this.fetch({
                module: 'account',
                action: 'txlist',
                address,
                sort: 'desc',
                page: page.toString(),
                offset: limit.toString()
            });
            
            const transactions = response.result.map((tx: any) => ({
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: tx.value,
                blockNumber: BigInt(tx.blockNumber),
                timestamp: Number(tx.timeStamp),
                status: tx.isError === '0' ? true : false,
                gasUsed: BigInt(tx.gasUsed),
                tokenName: null,
                tokenSymbol: null,
                tokenDecimal: null,
            }));
            
            logger.info({ count: transactions.length }, 'Transactions fetched successfully from Polygonscan');
            return transactions;
        } catch (error) {
            logger.error({ error, address }, 'Error fetching transactions from Polygonscan');
            throw error;
        }
    }

    public async getTokenTransactions(address: string, contractAddress: string, page: number = 1, limit: number = 10, daysBack: number = DEFAULT_LOOKBACK_DAYS): Promise<Transaction[]> {
        logger.info({ address, contractAddress, page, limit, daysBack }, 'Fetching token transactions from Polygonscan');
        
        try {
            const response = await this.fetch({
                module: 'account',
                action: 'tokentx',
                address,
                contractaddress: contractAddress,
                sort: 'desc',
                page: page.toString(),
                offset: limit.toString()
            });
            
            const transactions = response.result.map((tx: any) => ({
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: tx.value,
                tokenName: tx.tokenName,
                tokenSymbol: tx.tokenSymbol,
                tokenDecimal: tx.tokenDecimal,
                blockNumber: BigInt(tx.blockNumber),
                timestamp: Number(tx.timeStamp),
                status: true,
                gasUsed: BigInt(tx.gasUsed),
            }));
            
            logger.info({ count: transactions.length }, 'Token transactions fetched successfully from Polygonscan');
            return transactions;
        } catch (error) {
            logger.error({ error, address, contractAddress }, 'Error fetching token transactions from Polygonscan');
            throw error;
        }
    }

    public async getBalance(address: string): Promise<bigint> {
        logger.info({ address }, 'Fetching native balance from Polygonscan');
        
        try {
            const response = await this.fetch({
                module: 'account',
                action: 'balance',
                address,
                tag: 'latest'
            });
            
            const balance = BigInt(response.result);
            logger.info({ address, balance: balance.toString() }, 'Native balance fetched successfully');
            return balance;
        } catch (error) {
            logger.error({ error, address }, 'Error fetching native balance from Polygonscan');
            throw error;
        }
    }

    public async getTokenBalance(address: string, contractAddress: string): Promise<bigint> {
        logger.info({ address, contractAddress }, 'Fetching token balance from Polygonscan');
        
        try {
            const response = await this.fetch({
                module: 'account',
                action: 'tokenbalance',
                address,
                contractaddress: contractAddress,
                tag: 'latest'
            });
            
            const balance = BigInt(response.result);
            logger.info({ address, contractAddress, balance: balance.toString() }, 'Token balance fetched successfully');
            return balance;
        } catch (error) {
            logger.error({ error, address, contractAddress }, 'Error fetching token balance from Polygonscan');
            throw error;
        }
    }
}