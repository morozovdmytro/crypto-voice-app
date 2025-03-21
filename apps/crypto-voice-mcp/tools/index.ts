import { transactionHistoryTool } from './transaction_history';
import { tokenTransactionHistoryTool } from './token_transaction_history';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { balanceTool } from './balance';
import { tokenBalanceTool } from './token_balance';
import { buyTokensTool } from './buy_tokens';
import { sellTokensTool } from './sell_tokens';

export const tools: { name: string, description: string, schema: any, tool: (args: any) => Promise<CallToolResult> }[] = [
    transactionHistoryTool,
    tokenTransactionHistoryTool,
    balanceTool,
    tokenBalanceTool,
    buyTokensTool,
    sellTokensTool,
]