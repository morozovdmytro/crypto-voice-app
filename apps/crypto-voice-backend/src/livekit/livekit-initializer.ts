import { initializeLogger, Worker, WorkerOptions } from "@livekit/agents";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Initializer } from "../abstractions/initializer.js";

@Injectable()
export class LivekitInitializer implements Initializer {
    private readonly logger = new Logger(LivekitInitializer.name, { timestamp: true });
    private worker: Worker | undefined;

    constructor(private readonly configService: ConfigService) { }

    public async initialize() {
        this.logger.log('Initializing Livekit');
        initializeLogger({ pretty: true, level: 'debug' });

        const livekitUrl = this.configService.get('LIVEKIT_URL');
        if (!livekitUrl) {
            throw new Error('LIVEKIT_URL is not set');
        }

        // Use import.meta.url to get the current file's path in ES modules
        const currentFilePath = fileURLToPath(import.meta.url);
        const currentDirPath = dirname(currentFilePath);
        const agentPath = path.resolve(currentDirPath, './livekit-agent.js');

        this.worker = new Worker(new WorkerOptions({
            agent: agentPath,
            apiKey: this.configService.get('LIVEKIT_API_KEY')!,
            apiSecret: this.configService.get('LIVEKIT_API_SECRET')!,
            wsURL: livekitUrl,
            production: process.env.NODE_ENV === 'production'
        }));

        this.worker.event.once('worker_msg', (msg) => {
            this.logger.debug(`worker_msg: ${msg}`);
        });

        await this.worker.run();

        this.logger.log('Livekit initialized');
    }
}