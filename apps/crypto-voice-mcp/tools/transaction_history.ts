import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const name = 'transaction_history';
const description = 'Get the transaction history of a user';
const schema = {
    address: z.string(),
}

const tool = async ({ address }: { address: string }): Promise<CallToolResult> => {
    return {
        content: [
            {
                type: "text",
                text: `Transaction history for ${address}`
            }
        ]
    }
}

export const transactionHistoryTool = { name, description, schema, tool };