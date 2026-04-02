import { useState } from "react";

export default function MessageInput({ onSend, sending }) {
  const [text, setText] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value || sending) return;
    onSend(value);
    setText("");
  };

  return (
    <form className="message-form" onSubmit={submit}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your message..."
      />
      <button type="submit" disabled={sending}>
        {sending ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
