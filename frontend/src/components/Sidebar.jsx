export default function Sidebar({
    user,
    conversations,
    activeConversationId,
    onSelect,
    onNewChat,
    onDelete,
    onLogout,
  }) {
    return (
      <aside className="sidebar">
        <button className="new-chat-btn" onClick={onNewChat}>
          + New Chat
        </button>
  
        <div className="conversation-list">
          {!conversations || conversations.length === 0 ? (
            <p className="muted">No chats yet</p>
          ) : (
            conversations.map((item) => (
              <div
                key={item.id}
                className={`conversation-item ${
                  activeConversationId === item.id ? "active" : ""
                }`}
              >
                <button
                  className="conversation-main"
                  onClick={() => onSelect(item.id)}
                >
                  {item.title}
                </button>
  
                <button
                  className="delete-btn"
                  onClick={() => onDelete(item.id)}
                  type="button"
                  title="Delete"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
  
        <div className="sidebar-footer">
          <div className="user-email">{user?.email || ""}</div>
          <button className="logout-btn" onClick={onLogout} type="button">
            Logout
          </button>
        </div>
      </aside>
    );
  }
  