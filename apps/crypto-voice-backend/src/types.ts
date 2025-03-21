import { JobContext } from '@livekit/agents';
import { Processor } from './abstractions/processor.js';
import { TransactionProcessor } from './livekit/processors/transaction.processor.js';
import { TransferProcessor } from './livekit/processors/transfer.processor.js';

export interface ToolCallResult {
  type?: ResultDataType;
  transactionData?: string;
  transferData?: string;
  content?: Array<{
    type: string;
    text: string;
  }>;
}

export type ResultDataType = 'transaction' | 'transfer';

export type ProcessorConstructor = new (context: JobContext) => Processor;

export const ResultDataProcessorMap: Record<
  ResultDataType,
  ProcessorConstructor
> = {
  transaction: TransactionProcessor,
  transfer: TransferProcessor,
};

export interface Tool {
  name: string;
  description?: string;
  inputSchema: any;
}
