export function SystemTab({ text, setText, onSave, onReset }: { text: string; setText: (v: string) => void; onSave: () => void; onReset: () => void }) {
  return (
    <div>
      <label>Persistent System Instructions</label>
      <textarea rows={18} value={text} onChange={(e) => setText(e.target.value)} />
      <div className="row">
        <button onClick={onSave}>Save</button>
        <button onClick={onReset}>Reset Default</button>
      </div>
    </div>
  );
}
