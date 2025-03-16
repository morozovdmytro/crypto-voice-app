import axios from 'axios';
import { CreateRoomRequest, Room } from '../types/room';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const roomApi = {
  createRoom: async (data: CreateRoomRequest): Promise<Room> => {
    const response = await api.post<Room>('/api/v1/room', data);
    return response.data;
  },
};

export default api; 