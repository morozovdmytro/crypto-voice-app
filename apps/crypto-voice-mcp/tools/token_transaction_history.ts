import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { Transaction } from "../types";
import { EvmService, PolygonScanService, createLogger } from "../services";
import { polygon } from "viem/chains";
import { formatTransactionForDisplay } from "../utils";

const logger = createLogger('TokenTransactionHistoryTool');

const name = 'token_transaction_history';
const description = 'Get the transaction history of a user for a specific token';
const schema = {
    address: z.string(),
    contractAddress: z.string(),
    tokenName: z.string(),
}

const tool = async ({ address, contractAddress, tokenName }: { address: string, contractAddress: string, tokenName: string }): Promise<CallToolResult> => {
    logger.info({ address, contractAddress, tokenName }, 'Token Transaction history tool called');
    
    // TODO: implement dynamic chain selection
    const { service, scanner, nativeCurrency } = {
        service: new EvmService(polygon),
        scanner: new PolygonScanService(),
        nativeCurrency: 'MATIC'
    }

    try {
        // Validate the address format
        if (!address.startsWith('0x') || address.length !== 42) {
            logger.warn({ address }, 'Invalid address format');
            return {
                content: [
                    {
                        type: "text",
                        text: `Error: Invalid address format. Address should start with '0x' and be 42 characters long.`
                    }
                ]
            };
        }

        if(!tokenName) {
            logger.warn({ tokenName }, 'Invalid token name');
            return {
                content: [{ type: 'text', text: `Error: Token name is required.` }],
            };
        }

        if(!contractAddress.startsWith('0x') || contractAddress.length !== 42) {
            logger.warn({ contractAddress }, 'Invalid contract address format');
            return {
                content: [{ type: 'text', text: `Error: Invalid contract address format. Address should start with '0x' and be 42 characters long.` }],
            };
        }

        let transactions: Transaction[] = [];

        // TODO: implement circuit breaker
        // TODO: implement pagination
        try {
            logger.info({ address }, 'Attempting to fetch transactions via EVM service');
            transactions = await service.getTokenTransactions(address, contractAddress, 1, 10);
            logger.debug({ count: transactions.length }, 'Transactions fetched via EVM service');
        }
        catch (error) {
            logger.warn({ error }, 'EVM service failed, falling back to PolygonScan');
            transactions = await scanner.getTokenTransactions(address, contractAddress, 1, 10);
            logger.debug({ count: transactions.length }, 'Transactions fetched via PolygonScan service');
        }

        if (transactions.length === 0) {
            logger.info({ address }, 'No transactions found');
            return {
                content: [
                    {
                        type: "text",
                        text: `No transactions found for address ${address}.`
                    }
                ]
            };
        }

        logger.info({ transactions }, 'Transactions');
        // TODO: implement dynamic native currency selection
        const formattedTransactions = transactions.map(tx => formatTransactionForDisplay(tx, address, tokenName)).join('\n');
        logger.info({ address, count: transactions.length }, 'Successfully formatted transactions');

        return {
            content: [
                {
                    type: "text",
                    text: `Last ${transactions.length} transaction(s) for ${address}: \n${formattedTransactions}`
                }
            ]
        };
    } catch (error) {
        logger.error({ error, address, contractAddress }, 'Error in token_transaction_history tool');
        return {
            content: [
                {
                    type: "text",
                    text: `Error fetching transactions: ${error instanceof Error ? error.message : String(error)}`
                }
            ]
        };
    }
}

export const tokenTransactionHistoryTool = { name, description, schema, tool };