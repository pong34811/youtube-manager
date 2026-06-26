import { useState, useEffect } from "react";
import { ref, push, update, remove, onValue } from "firebase/database";
import { database } from "../../firebase";
import { useLocale } from "../../hooks/useLocale";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";

export default function ApiKeysTab() {
  const { t } = useLocale();
  const [keys, setKeys] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", key: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const keysRef = ref(database, "api-keys");
    const unsub = onValue(keysRef, (snap) => {
      setKeys(snap.val() || {});
      setLoading(false);
    });
    return unsub;
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", key: "" });
    setShowModal(true);
  };

  const openEdit = (id, item) => {
    setEditing(id);
    setForm({ name: item.name || "", key: item.key || "" });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.key) return;
    setSaving(true);
    try {
      if (editing) {
        await update(ref(database, `api-keys/${editing}`), { name: form.name, key: form.key });
      } else {
        await push(ref(database, "api-keys"), { name: form.name, key: form.key, createdAt: new Date().toISOString() });
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id, item) => {
    if (confirm(`Delete "${item.name}"?`)) {
      remove(ref(database, `api-keys/${id}`));
    }
  };

  const keyList = Object.entries(keys).map(([id, k]) => ({ id, ...k }));
  const maskKey = (key) => {
    if (!key) return "";
    if (key.length <= 8) return "***";
    return key.substring(0, 4) + "****" + key.substring(key.length - 4);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[var(--text-secondary)]">{t("apiKeys.desc")}</p>
        <Button onClick={openAdd} icon={<span>+</span>}>{t("apiKeys.add")}</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : keyList.length === 0 ? (
        <div className="text-center py-10 text-[var(--text-secondary)]">{t("apiKeys.noKeys")}</div>
      ) : (
        <div className="space-y-3">
          {keyList.map((item) => (
            <div key={item.id} className="bg-[var(--bg-primary)] rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <div>
                <p className="text-[var(--text-primary)]">{item.name}</p>
                <p className="text-xs text-[var(--text-secondary)] font-mono">{maskKey(item.key)}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button onClick={() => openEdit(item.id, item)} className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">{t("apiKeys.edit")}</button>
                <button onClick={() => handleDelete(item.id, item)} className="text-sm text-red-600 hover:text-red-800 dark:text-red-400">{t("apiKeys.delete")}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? t("apiKeys.editTitle") : t("apiKeys.addTitle")}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--text-primary)] mb-1">{t("apiKeys.name")}</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-primary)] mb-1">{t("apiKeys.key")}</label>
            <input type="text" required value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm" />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">{t("apiKeys.cancel")}</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {saving ? t("apiKeys.saving") : t("apiKeys.save")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
