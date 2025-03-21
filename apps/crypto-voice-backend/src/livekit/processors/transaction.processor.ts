import { JobContext } from '@livekit/agents';
import { Processor } from '../../abstractions/processor.js';
import { ToolCallResult } from '../../types.js';

export class TransactionProcessor implements Processor {
  constructor(private readonly context: JobContext) {}

  async process(result?: ToolCallResult | null) {
    if (!result?.transactionData) {
      console.warn('No transaction data provided');
      return;
    }

    console.log(
      'Transaction data detected, sending to client via data channel',
    );
    if (this.context.room.localParticipant) {
      await this.context.room.localParticipant.publishData(
        Buffer.from(result.transactionData),
        { topic: 'transaction', reliable: true },
      );
      console.log('Transaction data sent to client');
    } else {
      console.warn(
        'Cannot send transaction data: localParticipant is undefined',
      );
    }
  }
}
