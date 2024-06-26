export type alertType = {
  message: string;
  type: "success" | "error" | "info" | "warning";
};
export interface Profile {
  id: number;
  first_name: string;
  last_name: string;
  profile_pic: string;
  about: string;
  created_at: string;
  updated_at: string | null;
}

export interface User {
  id: number;
  phone_number: string;
  created_at: string;
  updated_at: string | null;
  profile: Profile | null;
}

export interface Participant {
  id: number;
  role: string;
  user: User;
}

export interface Message {
  id: number;
  text: string;
  sent_at: string;
  updated_at: string | null;
  sender: User;
}

export interface LastMessage {
  id: number;
  text: string;
  sent_at: string;
  updated_at: string | null;
}

export interface Chat {
  id: number;
  created_at: string;
  participants: Participant[];
  messages: Message[];
  lastMessage: LastMessage | null;
}

export interface Role {
  id: number;
  role: string;
  chat: Chat;
}

export type RoleList = Role[];
