import z from "zod";
import { createLogger, PolygonScanService, EvmService } from "../services";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { polygon } from "viem/chains";
import { formatUnits } from "viem";

const logger = createLogger('BalanceTool');

const name = 'balance';
const description = 'Get the balance of a user in the native currency of the chain (like ETH, MATIC, etc.)';
const schema = {
    address: z.string(),
}

const tool = async ({ address }: { address: string }): Promise<CallToolResult> => {
    logger.info({ address }, 'Balance tool called');
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
        let balance = 0n;

        try {
            balance = await service.getBalance(address);
        } catch (error) {
            logger.warn({ error }, 'EVM service failed, falling back to scanner');
            balance = await scanner.getBalance(address);
        }

        const formattedBalance = formatUnits(balance, 18);

        return {
            content: [{ type: 'text', text: `The balance of ${address} is ${formattedBalance} ${nativeCurrency}.` }],
        };
    } catch (error) {
        logger.error({ error }, 'Error fetching balance');
        return {
            content: [{ type: 'text', text: `Error fetching balance: ${error}` }],
        };
    }
}

export const balanceTool = { name, description, schema, tool };