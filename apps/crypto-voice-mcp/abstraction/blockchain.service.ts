import { Transaction } from "../types";

export interface BlockchainService {
    getTokenTransactions(
        address: string,
        contractAddress: string,
        page: number,
        limit: number,
        daysBack: number
    ): Promise<Transaction[]>;
    getTransactions(
        address: string,
        page: number,
        limit: number,
        daysBack: number
    ): Promise<Transaction[]>;
    getBalance(
        address: string
    ): Promise<bigint>;
    getTokenBalance(
        address: string,
        contractAddress: string
    ): Promise<bigint>;
}