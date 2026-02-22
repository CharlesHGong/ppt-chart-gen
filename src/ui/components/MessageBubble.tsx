import { ChatMessage } from "../../core/types";

export function MessageBubble({ message }: { message: ChatMessage }) {
  return <div className={`bubble ${message.role}`}>{message.content}</div>;
}
