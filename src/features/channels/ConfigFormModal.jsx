import { useState, useEffect } from "react";
import { ref, push, update, remove } from "firebase/database";
import { database } from "../../firebase";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";

export default function ConfigFormModal({ open, onClose, editingConfig }) {
  const [form, setForm] = useState({ channelName: "", apiKey: "", channelId: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingConfig) {
      setForm({ channelName: editingConfig.channelName || "", apiKey: editingConfig.apiKey || "", channelId: editingConfig.channelId || "" });
    } else {
      setForm({ channelName: "", apiKey: "", channelId: "" });
    }
  }, [editingConfig, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const configsRef = ref(database, "youtube-configs");
      if (editingConfig) {
        await update(ref(database, `youtube-configs/${editingConfig.id}`), { ...form, updatedAt: new Date().toISOString() });
      } else {
        await push(configsRef, { ...form, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      }
      onClose();
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editingConfig ? "Edit Channel Config" : "Add New Channel"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Channel Name</label>
          <input required value={form.channelName} onChange={(e) => setForm({ ...form, channelName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">API Key</label>
          <input required value={form.apiKey} onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Channel ID</label>
          <input required value={form.channelId} onChange={(e) => setForm({ ...form, channelId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        <div className="flex justify-end space-x-3 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? "Saving..." : editingConfig ? "Update" : "Add Channel"}</Button>
        </div>
      </form>
    </Modal>
  );
}
