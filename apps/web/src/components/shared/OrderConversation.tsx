"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isBackofficeRole } from "@/lib/admin-roles";
import { STORE_API_URL } from "@/lib/store-api";

type OrderMessage = {
  id: string;
  message: string;
  createdAt: string;
  sender: { id: string; name: string; role: string };
};

let chatFlagRequest: Promise<boolean> | null = null;

function loadChatSetting() {
  if (chatFlagRequest) return chatFlagRequest;
  chatFlagRequest = fetch(`${STORE_API_URL}/settings/storefront`, { cache: "no-store" })
    .then(async (response) => {
      if (!response.ok) throw new Error("Unable to load chat setting");
      const data = await response.json() as { generalStoreChatOpen?: boolean };
      return data.generalStoreChatOpen === true;
    })
    .catch(() => false)
    .finally(() => { chatFlagRequest = null; });
  return chatFlagRequest;
}

export default function OrderConversation({ orderId, viewerId, adminView = false }: { orderId: string; viewerId: string; adminView?: boolean }) {
  const [open, setOpen] = useState(false);
  const [chatEnabled, setChatEnabled] = useState(false);
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messageList = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    void loadChatSetting().then((enabled) => { if (!cancelled) setChatEnabled(enabled); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (open && messageList.current) messageList.current.scrollTop = messageList.current.scrollHeight;
  }, [messages, open]);

  const loadMessages = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const response = await fetch(`${STORE_API_URL}/orders/${encodeURIComponent(orderId)}/messages`, { credentials: "include", cache: "no-store" });
      const data = await response.json().catch(() => null);
      if (response.status === 503) {
        setOpen(false);
        setChatEnabled(false);
        setMessages([]);
        setDraft("");
        setError("");
        return;
      }
      if (!response.ok) throw new Error(data?.error || "Could not load this conversation.");
      setMessages(data as OrderMessage[]);
      setError("");
    } catch (failure) {
      if (!quiet) setError(failure instanceof Error ? failure.message : "Could not load this conversation.");
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!open || !chatEnabled) return;
    void loadMessages();
    const interval = window.setInterval(() => { void loadMessages(true); }, 15000);
    return () => window.clearInterval(interval);
  }, [open, chatEnabled, loadMessages]);

  const sendMessage = async () => {
    const message = draft.trim();
    if (!message || sending) return;
    setSending(true);
    setError("");
    try {
      const response = await fetch(`${STORE_API_URL}/orders/${encodeURIComponent(orderId)}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message }),
      });
      const data = await response.json().catch(() => null);
      if (response.status === 503) {
        setOpen(false);
        setChatEnabled(false);
        setMessages([]);
        setDraft("");
        setError("");
        return;
      }
      if (!response.ok) throw new Error(data?.error || "Could not send your message.");
      setMessages((current) => [...current, data as OrderMessage]);
      setDraft("");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not send your message.");
    } finally {
      setSending(false);
    }
  };

  if (!chatEnabled) return null;

  return (
    <section className={`rounded-2xl border ${adminView ? "border-slate-200 bg-slate-50" : "border-brand-gold/20 bg-brand-cream/20"}`}>
      <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5">
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-maroon text-white" aria-hidden="true">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h6m-9 8 3.2-3.2A8 8 0 1 1 20 17" /></svg>
          </span>
          <span className="min-w-0"><span className="block truncate text-sm font-bold text-gray-900">{adminView ? "Message customer" : "Ask about this order"}</span><span className="mt-0.5 block text-xs text-gray-500">{adminView ? "Reply in this order’s private conversation" : "Chat privately with the store about this order"}</span></span>
        </span>
        <span className="shrink-0 text-xs font-bold text-brand-maroon">{open ? "Close" : "Open chat"}</span>
      </button>

      {open && <div className="border-t border-gray-200/80 p-3 sm:p-5">
        <div ref={messageList} aria-live="polite" className="max-h-80 min-h-24 space-y-3 overflow-y-auto rounded-xl bg-white p-3 sm:p-4">
          {loading ? <p className="py-5 text-center text-sm text-gray-500">Loading conversation…</p> : messages.length === 0 ? <p className="py-5 text-center text-sm text-gray-500">No messages yet. {adminView ? "Send a note if you need to clarify anything." : "Send your question and the store team will reply here."}</p> : messages.map((item) => {
            const mine = item.sender.id === viewerId;
            const fromStoreTeam = isBackofficeRole(item.sender.role);
            const label = fromStoreTeam ? adminView ? `Store team (${item.sender.name})` : "Store team" : mine ? "You" : item.sender.name;
            return <div key={item.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <article className={`max-w-[88%] rounded-2xl px-3 py-2.5 sm:max-w-[75%] ${mine ? "rounded-br-md bg-brand-maroon text-white" : "rounded-bl-md border border-gray-100 bg-gray-50 text-gray-800"}`}>
                <div className={`mb-1 flex items-center justify-between gap-5 text-[10px] font-semibold ${mine ? "text-white/75" : "text-gray-400"}`}><span>{label}</span><time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</time></div>
                <p className="whitespace-pre-wrap break-words text-sm leading-5">{item.message}</p>
              </article>
            </div>;
          })}
        </div>
        {error && <p role="alert" className="mt-2 text-sm font-medium text-red-700">{error}</p>}
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
          <label htmlFor={`order-message-${orderId}`} className="sr-only">Write a message about this order</label>
          <textarea id={`order-message-${orderId}`} value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={1200} rows={2} placeholder={adminView ? "Write a reply to the customer…" : "What would you like to ask about this order?"} className="min-h-16 flex-1 resize-y rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-maroon focus:ring-2 focus:ring-brand-maroon/10" />
          <button type="button" onClick={() => void sendMessage()} disabled={!draft.trim() || sending} className="rounded-xl bg-brand-maroon px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-maroon-dark disabled:cursor-not-allowed disabled:opacity-50">{sending ? "Sending…" : "Send message"}</button>
        </div>
        <p className="mt-2 text-right text-[11px] text-gray-400">{draft.length}/1200 · Replies refresh while this chat is open</p>
      </div>}
    </section>
  );
}
