
export interface Room {
    accessToken: string;
    serverUrl: string;
    roomId: string;
}

export interface RoomManager {
    createRoom(roomId: string, userId: string): Promise<Room>;
    deleteRoom(roomId: string): Promise<void>;
}
