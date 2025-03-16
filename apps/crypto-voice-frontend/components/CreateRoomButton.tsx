import { useState } from 'react';
import { useRoomCreation } from '../hooks/useRoomCreation';
import { Room } from '../types/room';

interface CreateRoomButtonProps {
  userId: string;
  userInfo?: Record<string, any>;
  onRoomCreated?: (room: Room) => void;
}

export function CreateRoomButton({ userId, userInfo, onRoomCreated }: CreateRoomButtonProps) {
  const [createdRoom, setCreatedRoom] = useState<Room | null>(null);

  const { mutate: createRoom, isPending, isError, error } = useRoomCreation({
    onSuccess: (data) => {
      setCreatedRoom(data);
      if (onRoomCreated) {
        onRoomCreated(data);
      }
    },
  });

  const handleCreateRoom = () => {
    createRoom({ userId, userInfo });
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={handleCreateRoom}
        disabled={isPending}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
      >
        {isPending ? 'Creating Room...' : 'Create Room'}
      </button>

      {isError && (
        <div className="text-red-500">
          Error creating room: {error?.message || 'Unknown error'}
        </div>
      )}

      {createdRoom && (
        <div className="p-4 bg-green-100 rounded-md">
          <h3 className="font-bold">Room Created!</h3>
          <p>Room ID: {createdRoom.roomId}</p>
          <p>Server URL: {createdRoom.serverUrl}</p>
        </div>
      )}
    </div>
  );
} 