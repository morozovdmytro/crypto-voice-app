import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { ClaimDropService, createLogger } from "../services";
import { polygon } from "viem/chains";
import { parseUnits } from "viem";

const logger = createLogger('BuyTokensTool');

const name = 'buy_tokens';
const description = 'Generates transaction data for token purchase';

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
                content: [{ type: 'text', text: `Invalid wallet address. Please provide a valid address.` }],
            };
        }

        if (!saleTokenAddress || !saleTokenAddress.startsWith('0x') || saleTokenAddress.length !== 42) {
            logger.warn({ saleTokenAddress }, 'Invalid saleTokenAddress format');
            return {
                content: [{ type: 'text', text: `Invalid token contract address. Please provide a valid address.` }],
            };
        }

        if (tokenAmount <= 0) {
            logger.warn({ tokenAmount }, 'Invalid token amount');
            return {
                content: [{ type: 'text', text: `Token amount must be greater than 0.` }],
            };
        }

        if (!tokenName) {
            logger.warn({ tokenName }, 'Invalid token name');
            return {
                content: [{ type: 'text', text: `Please specify a token name.` }],
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
                    text: `Ready to purchase ${tokenAmount} ${tokenName}. Please confirm the transaction.`,
                }
            ],
        };
    } catch (error) {
        logger.error({ error }, 'Error buying tokens');
        return {
            content: [{ type: 'text', text: `Unable to process purchase. Please try again.` }],
        };
    }
};

export const buyTokensTool = { name, description, schema, tool }; 