import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { listResource, getResource } from '../../api/adminApi';

export default function ChatPage() {
  const [threads, setThreads] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listResource('/admin/chat/threads')
      .then((result) => setThreads(result.rows || []))
      .finally(() => setLoading(false));
  }, []);

  const openThread = async (id) => {
    setActiveId(id);
    setMessages(await getResource(`/admin/chat/threads/${id}/messages`));
  };

  return (
    <AdminLayout title="Chatting">
      <p className="mb-4 text-sm text-espresso-500">
        Read-only view of user-to-user conversations. Sending messages happens live on the website (Socket.io) — full moderation tools are a follow-up.
      </p>
      <div className="flex h-[calc(100vh-220px)] overflow-hidden rounded-2xl border border-linen-200 bg-white">
        <div className="w-72 shrink-0 overflow-y-auto border-r border-linen-200">
          {loading && <p className="p-4 text-sm text-espresso-400">Loading…</p>}
          {!loading && threads.length === 0 && <p className="p-4 text-sm text-espresso-400">No conversations yet</p>}
          {threads.map((t) => (
            <button
              key={t.id}
              onClick={() => openThread(t.id)}
              className={`block w-full border-b border-linen-100 p-4 text-left text-sm hover:bg-linen-50 ${activeId === t.id ? 'bg-carissma-50' : ''}`}
            >
              <p className="font-medium text-espresso-800">{t.participant_names || 'Conversation'}</p>
              <p className="truncate text-espresso-500">{t.last_message || 'No messages yet'}</p>
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {!activeId && <p className="text-sm text-espresso-400">Select a conversation</p>}
          {activeId && (
            <div className="space-y-3">
              {messages.map((m) => (
                <div key={m.id} className="rounded-xl bg-linen-50 p-3 text-sm">
                  <p className="font-medium text-espresso-800">{m.sender_name}</p>
                  <p className="text-espresso-700">{m.message}</p>
                  <p className="mt-1 text-xs text-espresso-400">{m.sent_at}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
