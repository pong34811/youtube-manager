import { useState, useEffect } from "react";
import { ref, push, update } from "firebase/database";
import { database } from "../../firebase";
import { useLocale } from "../../hooks/useLocale";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";

export default function ConfigFormModal({ open, onClose, editingConfig }) {
  const { t } = useLocale();
  const [form, setForm] = useState({ channelName: "", channelId: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingConfig) {
      setForm({ channelName: editingConfig.channelName || "", channelId: editingConfig.channelId || "" });
    } else {
      setForm({ channelName: "", channelId: "" });
    }
  }, [editingConfig, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const configsRef = ref(database, "youtube-configs");
      const data = {
        channelName: form.channelName,
        channelId: form.channelId,
        updatedAt: new Date().toISOString(),
      };
      if (editingConfig) {
        await update(ref(database, `youtube-configs/${editingConfig.id}`), data);
      } else {
        await push(configsRef, { ...data, createdAt: new Date().toISOString() });
      }
      onClose();
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editingConfig ? t("channels.editConfig") : t("channels.addConfig")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-[var(--text-primary)] mb-1">{t("channels.channelName")}</label>
          <input required value={form.channelName} onChange={(e) => setForm({ ...form, channelName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm text-[var(--text-primary)] mb-1">{t("channels.channelId")}</label>
          <input required value={form.channelId} onChange={(e) => setForm({ ...form, channelId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        <div className="flex justify-end space-x-3 pt-2">
          <Button variant="secondary" onClick={onClose}>{t("channels.cancel")}</Button>
          <Button type="submit" disabled={saving}>{saving ? t("channels.saving") : editingConfig ? t("channels.update") : t("channels.add")}</Button>
        </div>
      </form>
    </Modal>
  );
}
