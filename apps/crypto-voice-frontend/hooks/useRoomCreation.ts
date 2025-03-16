import { useMutation } from '@tanstack/react-query';
import { roomApi } from '../services/api';
import { CreateRoomRequest, Room } from '../types/room';

interface UseRoomCreationOptions {
    onSuccess?: (data: Room) => void;
    onError?: (error: Error) => void;
}

export function useRoomCreation(options?: UseRoomCreationOptions) {
    const { onSuccess, onError } = options || {};

    return useMutation({
        mutationFn: (data: CreateRoomRequest) => roomApi.createRoom(data),
        onSuccess,
        onError,
    });
} 