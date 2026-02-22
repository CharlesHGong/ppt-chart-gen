import { UserSettings } from "../core/types";

export function Settings({ settings, setSettings, onSave }: { settings: UserSettings; setSettings: (s: UserSettings) => void; onSave: () => void }) {
  return (
    <div>
      <label>OpenAI API Key</label>
      <input type="password" value={settings.apiKey} onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })} />
      <label>Model</label>
      <input value={settings.model} onChange={(e) => setSettings({ ...settings, model: e.target.value })} />
      <label>Base URL (optional)</label>
      <input value={settings.baseUrl} onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })} />
      <label>Temperature: {settings.temperature.toFixed(2)}</label>
      <input type="range" min="0" max="1" step="0.1" value={settings.temperature} onChange={(e) => setSettings({ ...settings, temperature: Number(e.target.value) })} />
      <label><input type="checkbox" checked={settings.useOpenAI} onChange={(e) => setSettings({ ...settings, useOpenAI: e.target.checked })} /> Use OpenAI for interpretation</label>
      <label>Node Width</label>
      <input type="number" value={settings.style.nodeWidth} onChange={(e) => setSettings({ ...settings, style: { ...settings.style, nodeWidth: Number(e.target.value) } })} />
      <label>Node Height</label>
      <input type="number" value={settings.style.nodeHeight} onChange={(e) => setSettings({ ...settings, style: { ...settings.style, nodeHeight: Number(e.target.value) } })} />
      <label>Padding</label>
      <input type="number" value={settings.style.padding} onChange={(e) => setSettings({ ...settings, style: { ...settings.style, padding: Number(e.target.value) } })} />
      <label>Horizontal Spacing</label>
      <input type="number" value={settings.style.spacingX} onChange={(e) => setSettings({ ...settings, style: { ...settings.style, spacingX: Number(e.target.value) } })} />
      <label>Vertical Spacing</label>
      <input type="number" value={settings.style.spacingY} onChange={(e) => setSettings({ ...settings, style: { ...settings.style, spacingY: Number(e.target.value) } })} />
      <label>Font Size</label>
      <input type="number" value={settings.style.fontSize} onChange={(e) => setSettings({ ...settings, style: { ...settings.style, fontSize: Number(e.target.value) } })} />
      <button onClick={onSave}>Save Settings</button>
    </div>
  );
}
