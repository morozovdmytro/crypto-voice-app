import { Module } from '@nestjs/common';
import { CryptoAgentModule } from './agents/crypto/crypto-agent.module.js';
import { ConfigModule } from '@nestjs/config';
import { LivekitModule } from './livekit/livekit.module.js';
import { HealthController, RoomController } from './controllers/index.js';

@Module({
  imports: [CryptoAgentModule, ConfigModule.forRoot({ isGlobal: true}), LivekitModule],
  controllers: [HealthController, RoomController],
  providers: [],
})
export class AppModule {}