import { Edit, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../api.js";
import { resourceConfig } from "./resourceConfig.js";

function blank(fields) {
  return Object.fromEntries(fields.map(([name, , type, options]) => [name, type === "select" ? options[0] : ""]));
}

export default function AdminResource({ type }) {
  const config = resourceConfig[type];
  const empty = useMemo(() => blank(config.fields), [type]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await api.get(config.endpoint);
    setItems(data);
  }

  useEffect(() => {
    setForm(empty);
    setEditing(null);
    setOpen(false);
    setMessage("");
    setError("");
    load().catch(() => {
      setItems([]);
      setError("Could not load this section. Make sure the backend server is running.");
    });
  }, [type]);

  function startCreate() {
    setEditing(null);
    setForm(empty);
    setError("");
    setMessage("");
    setOpen(true);
  }

  function startEdit(item) {
    setEditing(item.id);
    setForm({ ...empty, ...item });
    setError("");
    setMessage("");
    setOpen(true);
  }

  async function save(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    const missing = (config.required || []).filter((field) => !form[field] || String(form[field]).trim() === "");
    if (missing.length) {
      setError(`Please complete: ${missing.join(", ").replaceAll("_", " ")}.`);
      return;
    }

    try {
      setSaving(true);
      if (editing) await api.put(`${config.endpoint}/${editing}`, form);
      else await api.post(config.endpoint, form);
      setOpen(false);
      await load();
      setMessage("Changes saved.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Save failed. Please check the fields and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this record?")) return;
    setError("");
    try {
      await api.delete(`${config.endpoint}/${id}`);
      await load();
      setMessage("Record deleted.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Delete failed. Please try again.");
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase text-maroon">Manage</p>
          <h1 className="text-3xl font-black text-ink">{config.title}</h1>
        </div>
        {!config.readOnly && (
          <button onClick={startCreate} className="btn-dark"><Plus className="h-4 w-4" /> Add New</button>
        )}
      </div>
      {message && <p className="mb-4 rounded-md bg-green-50 p-3 text-sm font-semibold text-green-700">{message}</p>}
      {error && !open && <p className="mb-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-maroon">{error}</p>}
      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-ink text-white">
              <tr>
                {config.columns.map((column) => <th key={column} className="px-4 py-3 font-black capitalize">{column.replace("_", " ")}</th>)}
                {type === "messages" && <th className="px-4 py-3 font-black">Message</th>}
                <th className="px-4 py-3 text-right font-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-black/10">
                  {config.columns.map((column) => <td key={column} className="max-w-xs px-4 py-3 text-black/70">{item[column]}</td>)}
                  {type === "messages" && <td className="max-w-sm px-4 py-3 text-black/70">{item.message}</td>}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {!config.readOnly && <button onClick={() => startEdit(item)} className="grid h-9 w-9 place-items-center rounded-md bg-black/5 text-ink hover:bg-ember"><Edit className="h-4 w-4" /></button>}
                      <button onClick={() => remove(item.id)} className="grid h-9 w-9 place-items-center rounded-md bg-red-50 text-maroon hover:bg-maroon hover:text-white"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <form onSubmit={save} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-black">{editing ? "Edit" : "Add"} {config.title}</h2>
              <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-md bg-black/5"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid gap-4">
              {config.fields.map(([name, label, inputType, options]) => (
                <label key={name} className="grid gap-2">
                  <span className="label">
                    {label} {(config.required || []).includes(name) && <span className="text-maroon">*</span>}
                  </span>
                  {inputType === "textarea" ? (
                    <textarea className="field min-h-28" value={form[name] || ""} onChange={(e) => setForm({ ...form, [name]: e.target.value })} />
                  ) : inputType === "select" ? (
                    <select className="field" value={form[name] || options[0]} onChange={(e) => setForm({ ...form, [name]: e.target.value })}>
                      {options.map((option) => <option key={option}>{option}</option>)}
                    </select>
                  ) : (
                    <input className="field" type={inputType || "text"} value={form[name] || ""} onChange={(e) => setForm({ ...form, [name]: e.target.value })} />
                  )}
                </label>
              ))}
            </div>
            {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-maroon">{error}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setOpen(false)} className="rounded-md bg-black/5 px-5 py-3 text-sm font-bold">Cancel</button>
              <button className="btn-primary disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
