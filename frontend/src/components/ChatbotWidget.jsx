import React, { useEffect, useRef, useState } from "react";
import { Bot, Send } from "lucide-react"; // Make sure lucide-react is installed: npm install lucide-react
import { api } from "../lib/api"; // Your original API import

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgs, setMsgs] = useState([
    // "Hi" වැනි ආචාර වචන ඉවත් කර ඇත
    { role: "bot", text: "I'm your AI store assistant. How can I help you today?" },
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
      // Using your original api import
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
      {/* Chat Toggle Button with Robot Icon */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`fixed bottom-4 right-4 w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group ${
          open ? 'rotate-180 scale-110' : 'hover:scale-110'
        }`}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? (
          <svg className="w-6 h-6 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <Bot className="w-7 h-7 transition-transform duration-300 group-hover:animate-pulse" />
        )}
      </button>

      {/* Chat Widget */}
      {open && (
        <div className="fixed bottom-20 right-4 w-80 h-[32rem] bg-white border border-gray-200 shadow-xl rounded-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
          {/* Header */}
          <div className="px-4 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white flex items-center gap-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold">AI Assistant</div>
              <div className="text-xs text-green-100">Always here to help</div>
            </div>
            <div className="ml-auto">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm bg-gray-50">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "bot" && (
                  <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-green-600" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm ${
                    m.role === "user"
                      ? "bg-green-600 text-white rounded-br-md"
                      : "bg-white text-gray-800 border border-gray-100 rounded-bl-md"
                  }`}
                >
                  {m.text}
                </div>
                {m.role === "user" && (
                  // User avatar placeholder - ඔබට මෙය සැබෑ පරිශීලක අයිකනයක්/රූපයක් සමඟ ප්‍රතිස්ථාපනය කළ හැකිය
                  <div className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center ml-2 flex-shrink-0 mt-1">
                    <div className="w-4 h-4 bg-gray-600 rounded-full"></div> {/* පරිශීලක icon සඳහා placeholder */}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  <Bot className="w-4 h-4 text-green-600" />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md border border-gray-100 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Section */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !loading && input.trim()) {
                    send();
                  }
                }}
                placeholder="Ask about products, stock, prices..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={loading}
              />
              <button
                onClick={() => {
                  if (!loading && input.trim()) send();
                }}
                disabled={loading || !input.trim()}
                className={`px-4 py-3 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  loading || !input.trim()
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700 active:scale-95"
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}