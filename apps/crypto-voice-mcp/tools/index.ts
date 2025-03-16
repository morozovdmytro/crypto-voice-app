import { transactionHistoryTool } from './transaction_history';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

export const tools: { name: string, description: string, schema: any, tool: (args: any) => Promise<CallToolResult> }[] = [
    transactionHistoryTool,
]