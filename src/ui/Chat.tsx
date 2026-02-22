import { ChatMessage, DiagramSpec } from "../core/types";
import { MessageList } from "./components/MessageList";

interface ChatProps {
  messages: ChatMessage[];
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onRender: () => void;
  onUpdateSelected: () => void;
  status: string;
  autoRender: boolean;
  setAutoRender: (v: boolean) => void;
  showSpecPreview: boolean;
  setShowSpecPreview: (v: boolean) => void;
  lastSpec?: DiagramSpec;
}

export function Chat(props: ChatProps) {
  return (
    <div className="chat-wrap">
      <div className="status">Status: {props.status}</div>
      <MessageList messages={props.messages} />
      {props.showSpecPreview && props.lastSpec && <textarea rows={7} readOnly value={JSON.stringify(props.lastSpec, null, 2)} />}
      <textarea
        rows={3}
        value={props.input}
        onChange={(e) => props.setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            props.onSend();
          }
        }}
      />
      <div className="row">
        <button onClick={props.onSend}>Send</button>
        <button onClick={props.onRender}>Render</button>
        <button onClick={props.onUpdateSelected}>Update selected diagram</button>
      </div>
      <div className="row">
        <button onClick={props.onClear}>Clear chat</button>
        <button onClick={props.onUndo}>Undo</button>
        <button onClick={props.onRedo}>Redo</button>
      </div>
      <label><input type="checkbox" checked={props.autoRender} onChange={(e) => props.setAutoRender(e.target.checked)} /> Auto-render</label>
      <label><input type="checkbox" checked={props.showSpecPreview} onChange={(e) => props.setShowSpecPreview(e.target.checked)} /> Show spec preview</label>
    </div>
  );
}
