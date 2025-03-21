import { Injectable, Logger } from '@nestjs/common';
import { Worker } from '@livekit/agents';
import { LivekitInitializer } from './livekit-initializer.js';

@Injectable()
export class LivekitService {
  private readonly logger = new Logger(LivekitService.name, {
    timestamp: true,
  });

  constructor(private readonly livekitInitializer: LivekitInitializer) {}

  getWorker(): Worker {
    try {
      const worker = this.livekitInitializer.getNextWorker();
      this.logger.debug('Retrieved worker for conversation');
      return worker;
    } catch (error) {
      this.logger.error('Failed to get worker:', error);
      throw new Error('No available LiveKit workers');
    }
  }

  isHealthy(): boolean {
    try {
      this.livekitInitializer.getNextWorker();
      return true;
    } catch (error) {
      this.logger.error('Worker pool health check failed:', error);
      return false;
    }
  }
}
