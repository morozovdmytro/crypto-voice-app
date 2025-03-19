import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { createLogger, EvmService, PolygonScanService } from "../services";
import z from "zod";
import { polygon } from "viem/chains";
import { formatUnits } from "viem";

const logger = createLogger('TokenBalanceTool');

const name = 'token_balance';
const description = 'Get the balance of a user for a specific token';
const schema = {
    address: z.string(),
    contractAddress: z.string(),
    tokenName: z.string(),
    decimals: z.number(),
}

const tool = async ({ address, contractAddress, tokenName, decimals }: { address: string, contractAddress: string, tokenName: string, decimals: number }): Promise<CallToolResult> => {
    logger.info({ address, contractAddress, tokenName, decimals }, 'Token balance tool called');

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
                content: [{ type: 'text', text: `Error: Invalid address format. Address should start with '0x' and be 42 characters long.` }],
            };
        }

        if(!tokenName) {
            logger.warn({ tokenName }, 'Invalid token name');
            return {
                content: [{ type: 'text', text: `Error: Token name is required.` }],
            };
        }

        if(decimals <= 0) {
            logger.warn({ decimals }, 'Invalid decimals');
            return {
                content: [{ type: 'text', text: `Error: Decimals must be greater than 0.` }],
            };
        }
        
        

        let balance = 0n;

        try {
            balance = await service.getTokenBalance(address, contractAddress);
        } catch (error) {
            logger.warn({ error }, 'EVM service failed, falling back to PolygonScan');
            balance = await scanner.getTokenBalance(address, contractAddress);
        }

        const formattedBalance = formatUnits(balance, decimals);

        return {
            content: [{ type: 'text', text: `The balance of ${address} for ${tokenName} is ${formattedBalance} ${tokenName}.` }],
        };
    } catch (error) {
        logger.error({ error }, 'Error fetching token balance');
        return {
            content: [{ type: 'text', text: `Error fetching token balance: ${error}` }],
        };
    }
}

export const tokenBalanceTool = { name, description, schema, tool };