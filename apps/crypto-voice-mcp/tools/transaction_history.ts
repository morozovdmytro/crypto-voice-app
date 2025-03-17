import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const name = 'transaction_history';
const description = 'Get the transaction history of a user';
const schema = {
    address: z.string(),
}

const tool = async ({ address }: { address: string }): Promise<CallToolResult> => {
    const transactionHistory = [
        {
            amount: 154,
            currency: 'SHEF',
            date: '2021-01-01',
            type: 'deposit',
            status: 'completed'
        },
    ]
    return {
        content: [
            {
                type: "text",
                text: `Transaction history for ${address} is: ${JSON.stringify(transactionHistory)}`
            }
        ]
    }
}

export const transactionHistoryTool = { name, description, schema, tool };