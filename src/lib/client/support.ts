/* eslint-disable prettier/prettier */
import { clientApi } from "@/lib/api/client";

export type ChatMessage = {
  id: string;
  sender: "client" | "agent";
  text: string;
  timestamp: string;
};

export async function listSupportMessages(): Promise<ChatMessage[]> {
  return clientApi.get<ChatMessage[]>("/support/messages");
}

export async function sendSupportMessage(text: string): Promise<ChatMessage[]> {
  return clientApi.post<ChatMessage[]>("/support/messages", { text });
}

export async function resetSupportMessages(): Promise<ChatMessage[]> {
  return clientApi.del<ChatMessage[]>("/support/messages");
}
