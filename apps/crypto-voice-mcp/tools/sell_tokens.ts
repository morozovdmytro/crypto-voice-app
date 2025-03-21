import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { ClaimDropService, createLogger, EvmService } from "../services";
import { polygon } from "viem/chains";
import { parseUnits } from "viem";

const logger = createLogger("BuyTokensTool");

const name = "sell_tokens";
const description = "Generates transaction data for token sale";

const schema = {
  address: z.string(),
  contractAddress: z.string(),
  tokenAmount: z.number(),
  tokenName: z.string(),
  recipientAddress: z.string(),
  decimals: z.number(),
};

const tool = async ({
  address,
  contractAddress,
  tokenAmount,
  tokenName,
  recipientAddress,
  decimals,
}: {
  address: string;
  contractAddress: string;
  tokenAmount: number;
  tokenName: string;
  recipientAddress: string;
  decimals: number;
}): Promise<CallToolResult> => {
  logger.info(
    { address, tokenAmount, tokenName, recipientAddress },
    "Sell tokens tool called"
  );

  const { service } = {
    service: new EvmService(polygon),
  };

  if (!address.startsWith("0x") || address.length !== 42) {
    logger.warn({ address }, "Invalid address format");
    return {
      content: [
        {
          type: "text",
          text: `Error: Invalid address format. Address should start with '0x' and be 42 characters long.`,
        },
      ],
    };
  }

  if (!contractAddress.startsWith("0x") || contractAddress.length !== 42) {
    logger.warn({ contractAddress }, "Invalid contract address format");
    return {
      content: [
        { type: "text", text: `Error: Invalid contract address format.` },
      ],
    };
  }

  if (!tokenName) {
    logger.warn({ tokenName }, "Invalid token name");
    return {
      content: [{ type: "text", text: `Error: Token name is required.` }],
    };
  }

  if (!recipientAddress.startsWith("0x") || recipientAddress.length !== 42) {
    logger.warn({ recipientAddress }, "Invalid recipient address format");
    return {
      content: [
        {
          type: "text",
          text: `Error: Invalid recipient address format. Address should start with '0x' and be 42 characters long.`,
        },
      ],
    };
  }

  if (!decimals) {
    logger.warn({ decimals }, "Invalid decimals");
    return {
      content: [{ type: "text", text: `Error: Invalid decimals.` }],
    };
  }

  try {
    const balance = await service.getTokenBalance(address, contractAddress);

    if (balance < parseUnits(tokenAmount.toString(), decimals)) {
      logger.warn({ balance, tokenAmount }, "Insufficient balance");
      return {
        content: [{ type: "text", text: `Error: Insufficient balance.` }],
      };
    }

    return {
      type: "transfer",
      transferData: JSON.stringify({
        from: address,
        to: recipientAddress,
        amount: parseUnits(tokenAmount.toString(), decimals).toString(),
        contractAddress,
      }),
      content: [
        {
          type: "text",
          text: `Ready to sell ${tokenAmount} ${tokenName}. Please confirm the transaction.`,
        },
      ],
    };
  } catch (error) {
    logger.error({ error }, "Error selling tokens");
    return {
      content: [{ type: "text", text: `Error selling tokens: ${error}` }],
    };
  }
};

export const sellTokensTool = {
  name,
  description,
  schema,
  tool,
};
