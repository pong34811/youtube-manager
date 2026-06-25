import { useState, useEffect } from "react";
import { ref, push, update, remove, onValue } from "firebase/database";
import { database } from "../../firebase";
import { useLocale } from "../../hooks/useLocale";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";

export default function UsersPage() {
  const { t } = useLocale();
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ email: "", name: "", role: "user" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const usersRef = ref(database, "users");
    const unsub = onValue(usersRef, (snap) => {
      setUsers(snap.val() || {});
      setLoading(false);
    });
    return unsub;
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ email: "", name: "", role: "user" });
    setShowModal(true);
  };

  const openEdit = (id, user) => {
    setEditing(id);
    setForm({ email: user.email || "", name: user.name || "", role: user.role || "user" });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.email || !form.name) return;
    setSaving(true);
    try {
      if (editing) {
        await update(ref(database, `users/${editing}`), { email: form.email, name: form.name, role: form.role });
      } else {
        await push(ref(database, "users"), { email: form.email, name: form.name, role: form.role, createdAt: new Date().toLocaleString("en-GB") });
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id, user) => {
    if (confirm(`Delete "${user.name || user.email}"?`)) {
      remove(ref(database, `users/${id}`));
    }
  };

  const userList = Object.entries(users).map(([id, u]) => ({ id, ...u }));

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl text-[var(--text-primary)]">{t("page.users")}</h1>
        <Button onClick={openAdd} icon={<span>+</span>}>{t("users.add")}</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : userList.length === 0 ? (
        <div className="text-center py-20 text-[var(--text-secondary)]">{t("users.noUsers")}</div>
      ) : (
        <div className="grid gap-4">
          {userList.map((u) => (
            <div key={u.id} className="bg-[var(--bg-primary)] rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center justify-between">
              <div>
                <p className="text-[var(--text-primary)]">{u.name || "—"}</p>
                <p className="text-sm text-[var(--text-secondary)]">{u.email}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`text-xs px-2 py-1 rounded-full ${u.role === "admin" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"}`}>
                  {u.role === "admin" ? t("users.admin") : t("users.user")}
                </span>
                <button onClick={() => openEdit(u.id, u)} className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">{t("users.edit")}</button>
                <button onClick={() => handleDelete(u.id, u)} className="text-sm text-red-600 hover:text-red-800 dark:text-red-400">{t("users.delete")}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? t("users.editTitle") : t("users.addTitle")}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--text-primary)] mb-1">{t("users.email")}</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none"
              disabled={!!editing} />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-primary)] mb-1">{t("users.name")}</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-primary)] mb-1">{t("users.role")}</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="user">{t("users.user")}</option>
              <option value="admin">{t("users.admin")}</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">{t("users.cancel")}</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {saving ? t("users.saving") : t("users.save")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
