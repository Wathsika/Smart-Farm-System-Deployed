import React, { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgs, setMsgs] = useState([
    { role: "bot", text: "Hi 👋 I'm your store assistant. How can I help?" },
  ]);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  async function send() {
    const message = input.trim();
    if (!message) return;
    setMsgs((m) => [...m, { role: "user", text: message }]);
    setInput("");
    setLoading(true);
    try {
      const r = await api.post("/chat", { message });
      const answer = r?.data?.answer || "Sorry, I couldn't find that.";
      setMsgs((m) => [...m, { role: "bot", text: answer }]);
    } catch {
      setMsgs((m) => [
        ...m,
        { role: "bot", text: "Server issue. Please try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 rounded-full px-4 py-3 bg-green-600 text-white shadow-lg"
      >
        {open ? "Close" : "Chat"}
      </button>

      {open && (
        <div className="fixed bottom-20 right-4 w-80 h-[28rem] bg-white border shadow-lg rounded-xl flex flex-col">
          <div className="px-4 py-3 border-b font-semibold">Support</div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : ""}>
                <div
                  className={`inline-block px-3 py-2 rounded-xl ${
                    m.role === "user"
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-xs text-gray-400">typing…</div>}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!loading) send();
            }}
            className="p-2 border-t flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about products, stock, price…"
              className="flex-1 px-3 py-2 border rounded-lg"
            />
            <button
              disabled={loading}
              className="px-3 py-2 bg-green-600 text-white rounded-lg"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
