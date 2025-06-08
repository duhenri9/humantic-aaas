"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { Doc } from '../../convex/_generated/dataModel'; // For message type

interface ChatWindowProps {
  conversationId: Id<"conversations">;
  agentName?: string; // Optional, for display
  onCloseChat?: () => void; // Optional callback to close/minimize chat
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId, agentName, onCloseChat }) => {
  // Fetch messages for the given conversationId
  // The `skip` option could be used if conversationId is not yet available.
  const messages = useQuery(api.conversation.getConversationMessages, conversationId ? { conversationId } : "skip");
  const sendMessageMutation = useMutation(api.conversation.sendMessageToAgent);

  const [newMessageText, setNewMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null); // Ref for auto-scrolling

  // Auto-scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Scroll whenever messages array changes

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !conversationId) return;
    if (isSending) return;

    setIsSending(true);
    setError(null);
    const textToSend = newMessageText;
    setNewMessageText(""); // Clear input field immediately

    try {
      await sendMessageMutation({ conversationId, userMessageText: textToSend });
      // The `messages` list will automatically update via `useQuery`, triggering re-render and scroll.
    } catch (err: any) {
      console.error("Error sending message:", err);
      // Display a user-friendly error message
      setError(err.data?.value || err.message || "Failed to send message. Please try again.");
      setNewMessageText(textToSend); // Restore text to input field if send failed
    } finally {
      setIsSending(false); // Re-enable input and send button
    }
  };

  const getSenderDisplayName = (sender: Doc<"messages">["sender"], agentName?: string) => {
    if (sender === "user") return "You";
    if (sender === "agent") return agentName || "Agent";
    return "System";
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[400px] max-h-[700px] w-full max-w-2xl bg-white dark:bg-slate-800 shadow-2xl rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
          Chat with {agentName || "Agent"}
        </h2>
        {onCloseChat && (
          <button onClick={onCloseChat} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-2xl">&times;</button>
        )}
      </header>

      <div className="flex-grow p-4 space-y-4 overflow-y-auto bg-slate-100 dark:bg-slate-900">
        {messages === undefined && <p className="text-center text-slate-500 dark:text-slate-400 py-4">Loading conversation...</p>}
        {messages && messages.length === 0 && <p className="text-center text-slate-500 dark:text-slate-400 py-4">No messages yet. Start the conversation!</p>}

        {messages?.map((msg) => (
          <div key={msg._id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[75%] p-3 rounded-xl shadow-md ${
                msg.sender === 'user'
                  ? 'bg-sky-600 text-white rounded-br-none'
                  : (msg.sender === 'agent'
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-50 rounded-bl-none'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100 text-xs italic text-center w-full py-2 rounded-none self-center') // System messages
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
            <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-right mr-1' : 'text-left ml-1'} text-slate-500 dark:text-slate-400 opacity-90`}>
              {getSenderDisplayName(msg.sender, agentName)} @ {new Date(msg.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* Element to scroll to */}
      </div>

      {error && (
        <div className="p-3 text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900 border-t border-red-200 dark:border-red-800">
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850">
        <div className="flex items-center gap-3">
          {/* Future: Integrate SpeechInput component here if needed */}
          <input
            type="text"
            value={newMessageText}
            onChange={(e) => setNewMessageText(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none dark:bg-slate-700 dark:text-slate-100 disabled:opacity-70"
            disabled={isSending || messages === undefined}
            aria-label="Type your message"
          />
          <button
            type="submit"
            disabled={isSending || !newMessageText.trim() || messages === undefined}
            className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg disabled:opacity-60 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50"
            aria-label="Send message"
          >
            {isSending ? (
              <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
};
