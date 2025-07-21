export interface Room {
  _id: string;
  name: string;
  description: string;
  creator: {
    _id: string;
    username: string;
    avatar?: string;
  };
  members: Array<{
    user: {
      _id: string;
      username: string;
      avatar?: string;
      isOnline: boolean;
    };
    joinedAt: Date;
  }>;
  isPrivate: boolean;
  maxMembers: number;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    username: string;
    avatar?: string;
  };
  room: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  edited: boolean;
  editedAt?: Date;
  readBy: Array<{
    user: string;
    readAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TypingUser {
  userId: string;
  username: string;
  roomId: string;
}

export interface OnlineUser {
  userId: string;
  username: string;
  avatar?: string;
  socketId: string;
}