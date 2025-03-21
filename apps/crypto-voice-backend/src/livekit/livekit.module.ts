import { Module } from '@nestjs/common';
import { LivekitRoomManager } from './livekit-room-manager.js';
import { LivekitInitializer } from './livekit-initializer.js';
import { LivekitService } from './livekit.service.js';
import { ROOM_MANAGER_TOKEN } from '../constants.js';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [
    LivekitRoomManager,
    {
      provide: ROOM_MANAGER_TOKEN,
      useClass: LivekitRoomManager,
    },
    LivekitInitializer,
    LivekitService,
  ],
  exports: [
    {
      provide: ROOM_MANAGER_TOKEN,
      useClass: LivekitRoomManager,
    },
    LivekitInitializer,
    LivekitService,
  ],
})
export class LivekitModule {}
