import { initializeLogger, Worker, WorkerOptions } from '@livekit/agents';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Initializer } from '../abstractions/initializer.js';
import { DEFAULT_WORKER_COUNT } from '../constants.js';

@Injectable()
export class LivekitInitializer
  implements Initializer, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(LivekitInitializer.name, {
    timestamp: true,
  });
  private workers: Worker[] = [];
  private workerIndex = 0;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    try {
      await this.initialize();
    } catch (error) {
      this.logger.error('Error initializing Livekit:', error);
      throw error;
    }
  }

  public async initialize() {
    this.logger.log('Initializing Livekit');
    initializeLogger({ pretty: true, level: 'debug' });

    const livekitUrl = this.configService.get('LIVEKIT_URL') as string;
    if (!livekitUrl) {
      throw new Error('LIVEKIT_URL is not set');
    }

    const currentFilePath = fileURLToPath(import.meta.url);
    const currentDirPath = dirname(currentFilePath);
    const agentPath = path.resolve(currentDirPath, './livekit-agent.js');

    const workerCount = this.configService.get('LIVEKIT_WORKER_COUNT')
      ? parseInt(this.configService.get('LIVEKIT_WORKER_COUNT') as string, 10)
      : DEFAULT_WORKER_COUNT;

    this.logger.log(`Creating ${workerCount} Livekit workers`);

    for (let i = 0; i < workerCount; i++) {
      const worker = new Worker(
        new WorkerOptions({
          agent: agentPath,
          apiKey: this.configService.get('LIVEKIT_API_KEY'),
          apiSecret: this.configService.get('LIVEKIT_API_SECRET'),
          wsURL: livekitUrl,
          production: process.env.NODE_ENV === 'production',
        }),
      );

      worker.event.once('worker_msg', (msg) => {
        this.logger.debug(`Worker ${i} message: ${msg}`);
      });

      worker.event.on('worker_error', (error) => {
        this.logger.error(`Worker ${i} error:`, error);
        this.restartWorker(i);
      });

      await worker.run();
      this.workers.push(worker);
      this.logger.log(`Worker ${i} initialized`);
    }

    this.logger.log(`${workerCount} Livekit workers initialized`);
  }

  public getNextWorker(): Worker {
    if (this.workers.length === 0) {
      throw new Error('No Livekit workers available');
    }

    const worker = this.workers[this.workerIndex];
    this.workerIndex = (this.workerIndex + 1) % this.workers.length;
    return worker;
  }

  private async restartWorker(index: number) {
    this.logger.log(`Attempting to restart worker ${index}`);

    try {
      const failedWorker = this.workers[index];

      const livekitUrl = this.configService.get('LIVEKIT_URL') as string;
      const currentFilePath = fileURLToPath(import.meta.url);
      const currentDirPath = dirname(currentFilePath);
      const agentPath = path.resolve(currentDirPath, './livekit-agent.js');

      const newWorker = new Worker(
        new WorkerOptions({
          agent: agentPath,
          apiKey: this.configService.get('LIVEKIT_API_KEY'),
          apiSecret: this.configService.get('LIVEKIT_API_SECRET'),
          wsURL: livekitUrl,
          production: process.env.NODE_ENV === 'production',
        }),
      );

      newWorker.event.once('worker_msg', (msg) => {
        this.logger.debug(`Restarted worker ${index} message: ${msg}`);
      });

      newWorker.event.on('worker_error', (error) => {
        this.logger.error(`Restarted worker ${index} error:`, error);
        this.restartWorker(index);
      });

      await newWorker.run();

      this.workers[index] = newWorker;

      try {
        await failedWorker.close();
      } catch (closeError) {
        this.logger.error(`Error closing failed worker ${index}:`, closeError);
      }

      this.logger.log(`Worker ${index} successfully restarted`);
    } catch (error) {
      this.logger.error(`Failed to restart worker ${index}:`, error);
    }
  }

  async onModuleDestroy() {
    this.logger.log('Shutting down Livekit workers');
    const shutdownPromises = this.workers.map(async (worker, index) => {
      try {
        await worker.close();
        this.logger.log(`Worker ${index} successfully closed`);
      } catch (error) {
        this.logger.error(`Error closing worker ${index}:`, error);
      }
    });

    try {
      await Promise.allSettled(shutdownPromises);
      this.logger.log('All Livekit workers shutdown complete');
    } catch (error) {
      this.logger.error('Error during Livekit workers shutdown:', error);
    }
  }
}
