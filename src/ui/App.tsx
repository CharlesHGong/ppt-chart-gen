import { useEffect, useMemo, useState } from "react";
import { Chat } from "./Chat";
import { Settings } from "./Settings";
import { SystemTab } from "./System";
import { loadJson, saveJson } from "../core/storage";
import { allowsBestGuess, inferIntent } from "../core/inferIntent";
import { interpretWithOpenAI } from "../core/llm";
import { parseLocal } from "../core/parser";
import { findPlacementRect } from "../core/placement";
import { renderDiagram, deleteDiagram } from "../core/render";
import { getSelectedDiagram } from "../core/selection";
import { pushAction, redo, undo } from "../core/undoRedo";
import { ChatMessage, DiagramSpec, InterpretResult, UserSettings } from "../core/types";

const defaultSystem = "Prefer ownership/org charts with top-down layouts and no overlaps.";
const defaultSettings: UserSettings = {
  apiKey: "",
  model: "gpt-4o-mini",
  baseUrl: "",
  temperature: 0.1,
  useOpenAI: true,
  style: { nodeWidth: 120, nodeHeight: 52, padding: 20, spacingX: 36, spacingY: 58, fontSize: 12 },
  autoRender: true,
  showSpecPreview: false
};

export function App() {
  const [tab, setTab] = useState<"chat" | "settings" | "system">("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("Idle");
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [systemText, setSystemText] = useState(defaultSystem);
  const [lastSpec, setLastSpec] = useState<DiagramSpec | undefined>();

  useEffect(() => {
    void (async () => {
      setSettings(await loadJson("settings", defaultSettings));
      setSystemText(await loadJson("systemText", defaultSystem));
    })();
  }, []);

  const addAssistant = (content: string) => setMessages((m) => [...m, { role: "assistant", content }]);

  const handleInterpret = async (text: string): Promise<InterpretResult | null> => {
    try {
      setStatus("Thinking");
      if (settings.useOpenAI) return await interpretWithOpenAI(text, systemText, settings);
      const parsed = parseLocal(text, settings);
      if (!parsed) {
        addAssistant("I could not parse that locally. Enable OpenAI or rephrase in a simple 'A owns B and C for 100%' pattern.");
        return null;
      }
      return parsed;
    } catch (e) {
      addAssistant(`Interpretation error: ${(e as Error).message}`);
      setStatus("Error");
      return null;
    }
  };

  const normalizeSpec = (spec: DiagramSpec): DiagramSpec => ({
    ...spec,
    layout: { ...spec.layout, ...settings.style },
    style: { ...spec.style, theme: "bw", fontSize: settings.style.fontSize, nodeFill: "#FFFFFF", nodeLine: "#000000", textColor: "#000000", connectorColor: "#000000" }
  });

  const executeRender = async (spec: DiagramSpec, mode: "create" | "update") => {
    setStatus("Rendering");
    if (mode === "create") {
      const placement = await findPlacementRect();
      if (placement.warning) addAssistant(placement.warning);
      await renderDiagram(spec, placement.rect);
      pushAction({ kind: "create", diagramId: spec.id, nextSpec: spec, targetRect: placement.rect });
    } else {
      const selected = await getSelectedDiagram();
      if (!selected) throw new Error("No editable diagram selected (select a DIAGRAM::...::GROUP). ");
      await deleteDiagram(selected.diagramId);
      await renderDiagram(spec, selected.rect);
      pushAction({ kind: "update", diagramId: selected.diagramId, prevSpec: selected.spec, nextSpec: spec, targetRect: selected.rect });
    }
    setStatus("Idle");
  };

  const onSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    const interpreted = await handleInterpret(text);
    if (!interpreted) return;

    if ("need_clarification" in interpreted) {
      const questions = interpreted.questions.map((q, i) => `${i + 1}. ${q}`).join("\n");
      addAssistant(`Need clarification:\n${questions}`);
      if (interpreted.best_guess_spec && allowsBestGuess(text) && settings.autoRender) {
        const normalized = normalizeSpec(interpreted.best_guess_spec);
        setLastSpec(normalized);
        await executeRender(normalized, inferIntent(text) === "update" ? "update" : "create");
      }
      return;
    }

    const normalized = normalizeSpec(interpreted);
    setLastSpec(normalized);
    addAssistant(`Interpreted ${normalized.type} diagram with ${normalized.nodes.length} nodes and ${normalized.edges.length} edges.`);
    if (settings.autoRender && inferIntent(text) !== "question") {
      await executeRender(normalized, inferIntent(text) === "update" ? "update" : "create");
    }
  };

  const canRender = useMemo(() => !!lastSpec, [lastSpec]);

  return (
    <div className="app">
      <div className="tabs">
        <button className={tab === "chat" ? "active" : ""} onClick={() => setTab("chat")}>Chat</button>
        <button className={tab === "settings" ? "active" : ""} onClick={() => setTab("settings")}>Settings</button>
        <button className={tab === "system" ? "active" : ""} onClick={() => setTab("system")}>System</button>
      </div>
      <div className="panel">
        {tab === "chat" && (
          <Chat
            messages={messages}
            input={input}
            setInput={setInput}
            onSend={() => void onSend()}
            onClear={() => setMessages([])}
            onUndo={() => void undo()}
            onRedo={() => void redo()}
            onRender={() => canRender && lastSpec && void executeRender(lastSpec, "create")}
            onUpdateSelected={() => canRender && lastSpec && void executeRender(lastSpec, "update")}
            status={status}
            autoRender={settings.autoRender}
            setAutoRender={(v) => setSettings({ ...settings, autoRender: v })}
            showSpecPreview={settings.showSpecPreview}
            setShowSpecPreview={(v) => setSettings({ ...settings, showSpecPreview: v })}
            lastSpec={lastSpec}
          />
        )}
        {tab === "settings" && <Settings settings={settings} setSettings={setSettings} onSave={() => void saveJson("settings", settings)} />}
        {tab === "system" && <SystemTab text={systemText} setText={setSystemText} onSave={() => void saveJson("systemText", systemText)} onReset={() => setSystemText(defaultSystem)} />}
      </div>
    </div>
  );
}
