import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { Transaction } from "../types";
import { EvmService, PolygonScanService, createLogger } from "../services";
import { polygon } from "viem/chains";
import { formatTransactionForDisplay } from "../utils";

const logger = createLogger('TransactionHistoryTool');

const name = 'transaction_history';
const description = 'Get the transaction history of a user';
const schema = {
    address: z.string(),
}

const tool = async ({ address }: { address: string }): Promise<CallToolResult> => {
    logger.info({ address }, 'Transaction history tool called');
    
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

        let transactions: Transaction[] = [];

        // TODO: implement circuit breaker
        // TODO: implement pagination
        try {
            logger.info({ address }, 'Attempting to fetch transactions via EVM service');
            transactions = await service.getTransactions(address, 1, 10);
            logger.debug({ count: transactions.length }, 'Transactions fetched via EVM service');
        }
        catch (error) {
            logger.warn({ error }, 'EVM service failed, falling back to PolygonScan');
            transactions = await scanner.getTransactions(address, 1, 10);
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

        // TODO: implement dynamic native currency selection
        const formattedTransactions = transactions.map(tx => formatTransactionForDisplay(tx, address, nativeCurrency)).join('\n');
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
        logger.error({ error, address }, 'Error in transaction_history tool');
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

export const transactionHistoryTool = { name, description, schema, tool };