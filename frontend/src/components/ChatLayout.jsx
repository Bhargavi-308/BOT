
import { useEffect, useState } from "react";
import { api } from "../api";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import MessageInput from "./MessageInput";

export default function ChatLayout({ user, onLogout }) {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const loadConversations = async () => {
    setLoadingConversations(true);
    try {
      const data = await api.listConversations();
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load conversations");
    } finally {
      setLoadingConversations(false);
    }
  };

  const openConversation = async (id) => {
    if (!id) return;

    setActiveConversationId(id);
    setLoadingMessages(true);
    setError("");

    try {
      const data = await api.getConversation(id);
      setMessages(Array.isArray(data?.messages) ? data.messages : []);
    } catch (err) {
      setError(err.message || "Failed to load conversation");
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setError("");
  };

  const handleSend = async (text) => {
    if (!text?.trim() || sending) return;

    setSending(true);
    setError("");

    const optimisticUser = {
      id: `temp-user-${Date.now()}`,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUser]);

    try {
      const data = await api.sendMessage({
        message: text.trim(),
        conversation_id: activeConversationId,
      });

      setActiveConversationId(data.conversation_id);

      setMessages((prev) => {
        const withoutTemp = prev.filter(
          (m) => String(m.id) !== String(optimisticUser.id)
        );
        return [...withoutTemp, data.user_message, data.assistant_message];
      });

      await loadConversations();
    } catch (err) {
      setMessages((prev) =>
        prev.filter((m) => String(m.id) !== String(optimisticUser.id))
      );
      setError(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteConversation(id);

      if (id === activeConversationId) {
        handleNewChat();
      }

      await loadConversations();
    } catch (err) {
      setError(err.message || "Failed to delete conversation");
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        user={user}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelect={openConversation}
        onNewChat={handleNewChat}
        onDelete={handleDelete}
        onLogout={onLogout}
        loading={loadingConversations}
      />

      <main className="chat-panel">
        <div className="chat-header">
          <div>
            <h2>AI Chatbot</h2>
            <span>{user?.email || "User"}</span>
          </div>
        </div>

        {error ? <div className="error-banner">{error}</div> : null}

        <ChatWindow messages={messages} loading={loadingMessages} />
        <MessageInput onSend={handleSend} sending={sending} />
      </main>
    </div>
  );
}
