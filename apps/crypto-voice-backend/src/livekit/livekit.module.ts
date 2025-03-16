import { Module, OnModuleInit } from '@nestjs/common';
import { LivekitRoomManager } from './livekit-room-manager.js';
import { LivekitInitializer } from './livekit-initializer.js';
import { ROOM_MANAGER_TOKEN } from '../constants.js';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [
    LivekitRoomManager,
    {
      provide: ROOM_MANAGER_TOKEN,
      useClass: LivekitRoomManager
    },
    LivekitInitializer
  ],
  exports: [
    {
      provide: ROOM_MANAGER_TOKEN,
      useClass: LivekitRoomManager
    },
    LivekitInitializer
  ],
})
export class LivekitModule implements OnModuleInit {
  constructor(private readonly initializer: LivekitInitializer) {
  }

  async onModuleInit() {
    try {
      await this.initializer.initialize();
    } catch (error) {
      console.error('Error initializing Livekit:', error);
      throw error;
    }
  }
}
