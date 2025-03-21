import { JobContext } from '@livekit/agents';
import { Processor } from '../../abstractions/processor.js';
import { ToolCallResult } from '../../types.js';

export class TransferProcessor implements Processor {
  constructor(private readonly context: JobContext) {}

  async process(result?: ToolCallResult | null) {
    if (!result?.transferData) {
      console.warn('No transfer data provided');
      return;
    }

    console.log('Transfer data detected, sending to client via data channel');
    if (this.context.room.localParticipant) {
      await this.context.room.localParticipant.publishData(
        Buffer.from(result.transferData),
        { topic: 'transfer', reliable: true },
      );
      console.log('Transfer data sent to client');
    } else {
      console.warn('Cannot send transfer data: localParticipant is undefined');
    }
  }
}
