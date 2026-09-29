"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Plus, Trash2, Save, ArrowLeft, Wrench, FormInput, Loader2 } from "lucide-react";
import { AVAILABLE_ACTIONS } from "@/lib/agent-action-defs";
import type { AgentToolDef, AgentInputField, AgentToolParam, AgentConfig } from "@/lib/types";

const inputCls = "w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-primary outline-none placeholder:text-muted focus:ring-2 focus:ring-accent/40";
const selectCls = inputCls;
const textareaCls = `${inputCls} min-h-[80px] resize-y`;

const ICON_OPTIONS = ["Bot", "FileText", "Target", "Scale", "UserCheck", "Package", "Zap", "Car"];
const CATEGORY_OPTIONS = ["Revenue", "Content", "Strategy", "Assets", "Operations", "Custom"];

const emptyTool: AgentToolDef = { name: "", description: "", parameters: {}, action: "respond_text" };
const emptyInput: AgentInputField = { key: "", label: "", type: "text", placeholder: "", required: false };

export function AgentCreatorClient({ editAgent }: { editAgent?: AgentConfig | null }) {
  const router = useRouter();
  const isEditing = !!editAgent;

  const [name, setName] = useState(editAgent?.name ?? "");
  const [description, setDescription] = useState(editAgent?.description ?? "");
  const [icon, setIcon] = useState(editAgent?.icon ?? "Bot");
  const [category, setCategory] = useState(editAgent?.category ?? "Custom");
  const [systemPrompt, setSystemPrompt] = useState(editAgent?.systemPrompt ?? "");
  const [userMessageTemplate, setUserMessageTemplate] = useState(editAgent?.userMessageTemplate ?? "");
  const [tools, setTools] = useState<AgentToolDef[]>(editAgent?.tools ?? [{ ...emptyTool }]);
  const [inputFields, setInputFields] = useState<AgentInputField[]>(editAgent?.inputFields ?? [{ ...emptyInput }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addTool() { setTools(prev => [...prev, { ...emptyTool }]); }
  function removeTool(i: number) { setTools(prev => prev.filter((_, idx) => idx !== i)); }
  function updateTool(i: number, patch: Partial<AgentToolDef>) {
    setTools(prev => prev.map((t, idx) => idx === i ? { ...t, ...patch } : t));
  }
  function addParam(toolIdx: number) {
    setTools(prev => prev.map((t, idx) => {
      if (idx !== toolIdx) return t;
      const key = `param_${Object.keys(t.parameters).length + 1}`;
      return { ...t, parameters: { ...t.parameters, [key]: { type: "string", description: "", required: false } } };
    }));
  }
  function updateParam(toolIdx: number, oldKey: string, newKey: string, param: AgentToolParam) {
    setTools(prev => prev.map((t, idx) => {
      if (idx !== toolIdx) return t;
      const params = { ...t.parameters };
      if (oldKey !== newKey) delete params[oldKey];
      params[newKey] = param;
      return { ...t, parameters: params };
    }));
  }
  function removeParam(toolIdx: number, key: string) {
    setTools(prev => prev.map((t, idx) => {
      if (idx !== toolIdx) return t;
      const params = { ...t.parameters };
      delete params[key];
      return { ...t, parameters: params };
    }));
  }

  function addInputField() { setInputFields(prev => [...prev, { ...emptyInput }]); }
  function removeInputField(i: number) { setInputFields(prev => prev.filter((_, idx) => idx !== i)); }
  function updateInputField(i: number, patch: Partial<AgentInputField>) {
    setInputFields(prev => prev.map((f, idx) => idx === i ? { ...f, ...patch } : f));
  }

  async function handleSave() {
    if (!name.trim()) { setError("Agent name is required"); return; }
    if (!systemPrompt.trim()) { setError("System prompt is required"); return; }
    if (!userMessageTemplate.trim()) { setError("User message template is required"); return; }
    setSaving(true); setError(null);
    try {
      const payload = { name, description, icon, category, systemPrompt, userMessageTemplate, tools: tools.filter(t => t.name.trim()), inputFields: inputFields.filter(f => f.key.trim() && f.label.trim()) };
      if (isEditing) {
        await fetch(`/api/agents/${editAgent.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      } else {
        await fetch("/api/agents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      }
      router.push("/agents");
      router.refresh();
    } catch {
      setError("Failed to save agent");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button onClick={() => router.push("/agents")} className="flex items-center gap-2 text-sm text-secondary hover:text-primary transition">
          <ArrowLeft className="h-4 w-4" /> Back to Agents
        </button>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-2xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition hover:opacity-90 disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : isEditing ? "Update Agent" : "Create Agent"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      {/* Basic Info */}
      <div className="card p-6">
        <div className="mb-5 flex items-center gap-2">
          <Bot className="h-5 w-5 text-accent" />
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Agent Identity</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium text-secondary">Agent Name</label>
            <input className={inputCls} placeholder="e.g. Market Research Analyst" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium text-secondary">Description</label>
            <textarea className={textareaCls} placeholder="What does this agent do?" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">Icon</label>
            <select className={selectCls} value={icon} onChange={e => setIcon(e.target.value)}>
              {ICON_OPTIONS.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">Category</label>
            <select className={selectCls} value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* System Prompt */}
      <div className="card p-6">
        <div className="mb-5 flex items-center gap-2">
          <Bot className="h-5 w-5 text-accent" />
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">AI Instructions</span>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">System Prompt</label>
            <textarea className={`${textareaCls} min-h-[140px]`} placeholder="You are a... (describe the agent's role, expertise, and behavior)" value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} />
            <p className="mt-1 text-xs text-muted">Defines the agent&apos;s personality, expertise, and behavior rules.</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">User Message Template</label>
            <textarea className={`${textareaCls} min-h-[100px]`} placeholder={"Analyze this:\nField: {{fieldName}}\n\nUse {{double_braces}} for input variables."} value={userMessageTemplate} onChange={e => setUserMessageTemplate(e.target.value)} />
            <p className="mt-1 text-xs text-muted">Template for the user message sent to the AI. Use {"{{fieldKey}}"} to inject input values.</p>
          </div>
        </div>
      </div>

      {/* Input Fields */}
      <div className="card p-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FormInput className="h-5 w-5 text-accent" />
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">Input Fields</span>
          </div>
          <button onClick={addInputField} className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs text-secondary hover:border-accent/40 hover:text-primary transition">
            <Plus className="h-3 w-3" /> Add Field
          </button>
        </div>
        <p className="mb-4 text-xs text-muted">Define the form fields users fill out before running this agent. Field keys are used in the user message template as {"{{key}}"}.</p>
        <div className="space-y-4">
          {inputFields.map((field, i) => (
            <div key={i} className="rounded-xl border border-border bg-surface2/50 p-4">
              <div className="grid gap-3 md:grid-cols-4">
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-muted uppercase">Key</label>
                  <input className={inputCls} placeholder="field_key" value={field.key} onChange={e => updateInputField(i, { key: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-muted uppercase">Label</label>
                  <input className={inputCls} placeholder="Display Label" value={field.label} onChange={e => updateInputField(i, { label: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-muted uppercase">Type</label>
                  <select className={selectCls} value={field.type} onChange={e => updateInputField(i, { type: e.target.value as AgentInputField["type"] })}>
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="textarea">Text Area</option>
                    <option value="select">Select</option>
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="mb-1 block text-[10px] font-medium text-muted uppercase">Placeholder</label>
                    <input className={inputCls} placeholder="Placeholder text" value={field.placeholder ?? ""} onChange={e => updateInputField(i, { placeholder: e.target.value })} />
                  </div>
                  <button onClick={() => removeInputField(i)} className="mb-0.5 rounded-lg border border-border p-2 text-secondary hover:border-red-400/40 hover:text-red-400 transition">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              {field.type === "select" && (
                <div className="mt-3">
                  <label className="mb-1 block text-[10px] font-medium text-muted uppercase">Options (comma-separated)</label>
                  <input className={inputCls} placeholder="Option 1, Option 2, Option 3" value={(field.options ?? []).join(", ")} onChange={e => updateInputField(i, { options: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} />
                </div>
              )}
              <div className="mt-3 flex items-center gap-2">
                <input type="checkbox" id={`req-${i}`} checked={field.required ?? false} onChange={e => updateInputField(i, { required: e.target.checked })} className="rounded border-border bg-surface2" />
                <label htmlFor={`req-${i}`} className="text-xs text-secondary">Required</label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tools */}
      <div className="card p-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-accent" />
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">Tools</span>
          </div>
          <button onClick={addTool} className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs text-secondary hover:border-accent/40 hover:text-primary transition">
            <Plus className="h-3 w-3" /> Add Tool
          </button>
        </div>
        <p className="mb-4 text-xs text-muted">Tools give the agent abilities. Each tool maps to a predefined action (like creating an opportunity or searching empire data).</p>
        <div className="space-y-6">
          {tools.map((tool, ti) => (
            <div key={ti} className="rounded-xl border border-border bg-surface2/50 p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-secondary">Tool {ti + 1}</span>
                <button onClick={() => removeTool(ti)} className="rounded-lg border border-border p-1.5 text-secondary hover:border-red-400/40 hover:text-red-400 transition">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-muted uppercase">Tool Name</label>
                  <input className={inputCls} placeholder="search_data" value={tool.name} onChange={e => updateTool(ti, { name: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-muted uppercase">Action</label>
                  <select className={selectCls} value={tool.action} onChange={e => updateTool(ti, { action: e.target.value })}>
                    {AVAILABLE_ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-[10px] font-medium text-muted uppercase">Description</label>
                  <input className={inputCls} placeholder="What does this tool do?" value={tool.description} onChange={e => updateTool(ti, { description: e.target.value })} />
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-medium text-muted uppercase">Parameters</span>
                  <button onClick={() => addParam(ti)} className="flex items-center gap-1 text-[10px] text-accent hover:underline">
                    <Plus className="h-2.5 w-2.5" /> Add
                  </button>
                </div>
                {Object.entries(tool.parameters).map(([key, param], pi) => (
                  <div key={pi} className="mb-2 grid grid-cols-5 gap-2">
                    <input className={inputCls} placeholder="key" value={key} onChange={e => updateParam(ti, key, e.target.value, param)} />
                    <select className={selectCls} value={param.type} onChange={e => updateParam(ti, key, key, { ...param, type: e.target.value })}>
                      <option value="string">string</option>
                      <option value="number">number</option>
                      <option value="boolean">boolean</option>
                      <option value="array">array</option>
                    </select>
                    <input className={`${inputCls} col-span-2`} placeholder="Description" value={param.description} onChange={e => updateParam(ti, key, key, { ...param, description: e.target.value })} />
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={param.required ?? false} onChange={e => updateParam(ti, key, key, { ...param, required: e.target.checked })} className="rounded border-border bg-surface2" />
                      <span className="text-[10px] text-muted">Req</span>
                      <button onClick={() => removeParam(ti, key)} className="ml-auto text-secondary hover:text-red-400 transition">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end gap-3">
        <button onClick={() => router.push("/agents")} className="rounded-xl border border-border px-5 py-2.5 text-sm text-secondary transition hover:text-primary">
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-2xl bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition hover:opacity-90 disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : isEditing ? "Update Agent" : "Create Agent"}
        </button>
      </div>
    </div>
  );
}
