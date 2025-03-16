import { Injectable, Logger } from "@nestjs/common";
import { Room, RoomManager } from "../abstractions/room-manager.js";
import { ConfigService } from "@nestjs/config";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";

@Injectable()
export class LivekitRoomManager implements RoomManager {
    private readonly logger = new Logger(LivekitRoomManager.name, { timestamp: true });

    constructor(private readonly configService: ConfigService) { }

    async createRoom(roomId: string, userId: string): Promise<Room> {
        this.logger.log(`Creating room ${roomId} for user ${userId}`);
        try {
            const roomClient = this.getRoomClient();
            const { roomTtl, livekitApiKey, livekitApiSecret, livekitHost } = this.getConfig();
            this.logger.log(`Created Room client`);

            const room = await roomClient.createRoom({ name: roomId });
            this.logger.log(`Created room ${roomId}`);
            const token = new AccessToken(livekitApiKey, livekitApiSecret, {
                identity: userId,
                ttl: roomTtl ?? '1h',
            });
            token.addGrant({ roomJoin: true, room: roomId });
            this.logger.log(`Created token`);
            
            const accessToken = await token.toJwt();
            return {
                accessToken,
                serverUrl: livekitHost!,
                roomId: roomId,
            };
        } catch (error) {
            this.logger.error(`Error creating room ${roomId} for user ${userId}`, error);
            throw error;
        }
    }

    async deleteRoom(roomId: string): Promise<void> {
        const roomClient = this.getRoomClient();
        await roomClient.deleteRoom(roomId);
    }

    private getRoomClient(): RoomServiceClient {
        const config = this.getConfig();
        if (!config.livekitHost || !config.livekitApiKey || !config.livekitApiSecret) {
            this.logger.error('Livekit configuration is missing');
            throw new Error('Livekit configuration is missing');
        }
        return new RoomServiceClient(config.livekitHost, config.livekitApiKey, config.livekitApiSecret);
    }

    private getConfig(): {
        livekitHost: string | undefined;
        livekitApiKey: string | undefined;
        livekitApiSecret: string | undefined;
        roomTtl: string | undefined;
    } {
        return {
            livekitHost: this.configService.get('LIVEKIT_URL'),
            livekitApiKey: this.configService.get('LIVEKIT_API_KEY'),
            livekitApiSecret: this.configService.get('LIVEKIT_API_SECRET'),
            roomTtl: this.configService.get('LIVEKIT_ROOM_TTL'),
        };
    }
}