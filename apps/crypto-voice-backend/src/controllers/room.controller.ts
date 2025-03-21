import { Controller, Inject, Post, Body, Logger } from '@nestjs/common';
import { RoomManager } from '../abstractions/room-manager.js';
import { v4 as uuidv4 } from 'uuid';
import { ROOM_MANAGER_TOKEN } from '../constants.js';

@Controller({
  version: '1',
  path: 'room',
})
export class RoomController {
  private readonly logger = new Logger(RoomController.name, {
    timestamp: true,
  });

  constructor(
    @Inject(ROOM_MANAGER_TOKEN) private readonly roomManager: RoomManager,
  ) {}

  @Post()
  async createRoom(
    @Body() body: { userId: string; userInfo?: Record<string, any> },
  ) {
    this.logger.log(
      `Creating room for user ${body.userId} with info: ${JSON.stringify(body.userInfo || {})}`,
    );
    return this.roomManager.createRoom(uuidv4(), body.userId, body.userInfo);
  }
}
