export default function ChatWindow({ messages, loading }) {
    if (loading) {
      return <div className="chat-window"><div className="center-note">Loading conversation...</div></div>;
    }
  
    // if (!messages || messages.length === 0) {
    //   return <div className="chat-window"><div className="center-note">Start a new chat</div></div>;
    // }
  
    return (
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div
            key={msg.id ?? index}
            className={`message-row ${msg.role === "user" ? "user" : "assistant"}`}
          >
            <div className={`message-bubble ${msg.role === "user" ? "user" : "assistant"}`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
    );
  }
  