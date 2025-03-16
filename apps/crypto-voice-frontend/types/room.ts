export interface Room {
  accessToken: string;
  serverUrl: string;
  roomId: string;
}

export interface CreateRoomRequest {
  userId: string;
} 