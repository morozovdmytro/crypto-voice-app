import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { ClaimDropService, createLogger } from "../services";
import { polygon } from "viem/chains";
import { formatUnits, parseUnits } from "viem";

const logger = createLogger('BuyTokensTool');

const name = 'buy_tokens';
const description = 'User can request to buy tokens. This tool will generate necessary transaction data and send it to the client via data channel.';

const schema = {
    address: z.string(),
    tokenAmount: z.number(),
    tokenName: z.string(),
    saleTokenAddress: z.string(),
};

const tool = async ({ address, tokenAmount, tokenName, saleTokenAddress }: {
    address: string,
    tokenAmount: number,
    tokenName: string,
    saleTokenAddress: string
}): Promise<CallToolResult> => {
    logger.info({ address, tokenAmount, tokenName, saleTokenAddress }, 'Buy tokens tool called');

    const { claimService } = {
        claimService: new ClaimDropService(polygon)
    }

    try {
        // Validate the address format
        if (!address.startsWith('0x') || address.length !== 42) {
            logger.warn({ address }, 'Invalid address format');
            return {
                content: [{ type: 'text', text: `Error: Invalid address format. Address should start with '0x' and be 42 characters long.` }],
            };
        }

        if (tokenAmount <= 0) {
            logger.warn({ tokenAmount }, 'Invalid token amount');
            return {
                content: [{ type: 'text', text: `Error: Token amount must be greater than 0.` }],
            };
        }

        if (!tokenName) {
            logger.warn({ tokenName }, 'Invalid token name');
            return {
                content: [{ type: 'text', text: `Error: Token name is required.` }],
            };
        }

        const claimCondition = await claimService.getClaimCondition(saleTokenAddress);
        
        const transactionData = {
            tokenAddress: saleTokenAddress,
            pricePerToken: claimCondition.pricePerToken.toString(),
            quantity: parseUnits(tokenAmount.toString(), 18).toString(),
            quantityLimitPerWallet: claimCondition.quantityLimitPerWallet.toString(),
            currency: claimCondition.currency.toString(),
        };

        return {
            type: 'transaction',
            transactionData: JSON.stringify(transactionData),
            content: [
                {
                    type: 'text',
                    text: 'Transaction data generated successfully. Please confirm the transaction and send it to the blockchain.',
                }
            ],
        };
    } catch (error) {
        logger.error({ error }, 'Error buying tokens');
        return {
            content: [{ type: 'text', text: `Error buying tokens: ${error}` }],
        };
    }
};

export const buyTokensTool = { name, description, schema, tool }; 