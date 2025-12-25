import { useState } from "react";
import { ref, push, remove, update } from "firebase/database";
import { database } from "../firebase";

export default function ConfigSection({ allConfigs, showStatus }) {
  const [formData, setFormData] = useState({
    channelName: "",
    apiKey: "",
    channelId: "",
  });
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const configsRef = ref(database, "youtube-configs");

    try {
      if (editingId) {
        await update(ref(database, `youtube-configs/${editingId}`), {
          ...formData,
          updatedAt: new Date().toISOString(),
        });
        showStatus("อัปเดต Config สำเร็จ!", "success");
        setEditingId(null);
      } else {
        await push(configsRef, {
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        showStatus("บันทึก Config สำเร็จ!", "success");
      }
      setFormData({ channelName: "", apiKey: "", channelId: "" });
    } catch (error) {
      console.error("Error saving config:", error);
      showStatus("เกิดข้อผิดพลาดในการบันทึก Config", "error");
    }
  };

  const handleEdit = (id, config) => {
    setFormData({
      channelName: config.channelName,
      apiKey: config.apiKey,
      channelId: config.channelId,
    });
    setEditingId(id);
  };

  const handleDelete = async (id) => {
    if (confirm("คุณแน่ใจหรือไม่ที่จะลบ Config นี้?")) {
      try {
        await remove(ref(database, `youtube-configs/${id}`));
        showStatus("ลบ Config สำเร็จ!", "success");
      } catch (error) {
        console.error("Error deleting config:", error);
        showStatus("เกิดข้อผิดพลาดในการลบ Config", "error");
      }
    }
  };

  const handleCancel = () => {
    setFormData({ channelName: "", apiKey: "", channelId: "" });
    setEditingId(null);
  };

  const configsArray = Object.entries(allConfigs).map(([key, value]) => ({
    id: key,
    ...value,
  }));

  return (
    <div className="animate-fade-in">
      {/* Add Config Form */}
      <div className="glass-panel rounded-3xl p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-3">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </span>
          {editingId ? "แก้ไข Config" : "เพิ่ม Config ใหม่"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label
                htmlFor="channelName"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                ชื่อช่อง
              </label>
              <input
                type="text"
                id="channelName"
                required
                placeholder="เช่น My Awesome Channel"
                value={formData.channelName}
                onChange={(e) =>
                  setFormData({ ...formData, channelName: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="apiKey"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                API Key
              </label>
              <input
                type="text"
                id="apiKey"
                required
                placeholder="AIza..."
                value={formData.apiKey}
                onChange={(e) =>
                  setFormData({ ...formData, apiKey: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="channelId"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Channel ID
              </label>
              <input
                type="text"
                id="channelId"
                required
                placeholder="UC..."
                value={formData.channelId}
                onChange={(e) =>
                  setFormData({ ...formData, channelId: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all outline-none"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className={`flex-1 font-bold py-3 px-4 rounded-xl transition duration-200 shadow-lg ${
                editingId
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/30"
                  : "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-indigo-500/30"
              }`}
            >
              {editingId ? "อัปเดต Config" : "บันทึก Config"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-xl transition duration-200"
              >
                ยกเลิก
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Config List */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          รายการ Config ทั้งหมด
        </h2>
        <div className="space-y-4">
          {configsArray.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="h-10 w-10 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium">
                ยังไม่มี Config ที่บันทึกไว้
              </p>
            </div>
          ) : (
            configsArray.map((config) => (
              <div
                key={config.id}
                className="glass-card rounded-2xl p-6 hover:border-indigo-300/50 group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                      {config.channelName}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                      <p className="flex items-center">
                        <span className="w-24 font-semibold text-gray-500">
                          API Key:
                        </span>
                        <code className="bg-gray-100 px-2 py-0.5 rounded text-indigo-600 font-mono text-xs">
                          {config.apiKey.substring(0, 10)}...
                          {config.apiKey.substring(config.apiKey.length - 4)}
                        </code>
                      </p>
                      <p className="flex items-center">
                        <span className="w-24 font-semibold text-gray-500">
                          Channel ID:
                        </span>
                        <code className="bg-gray-100 px-2 py-0.5 rounded text-pink-600 font-mono text-xs">
                          {config.channelId}
                        </code>
                      </p>
                      <p className="flex items-center">
                        <span className="w-24 font-semibold text-gray-500">
                          สร้างเมื่อ:
                        </span>
                        {new Date(config.createdAt).toLocaleString("th-TH")}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleEdit(config.id, config)}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-700 p-2 rounded-lg transition duration-200 shadow-sm"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(config.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg transition duration-200 shadow-sm"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
