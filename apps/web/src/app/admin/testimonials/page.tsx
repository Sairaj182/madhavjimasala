"use client";

import { useCallback, useEffect, useState } from "react";

type Comment = { id: string; name: string; title: string; company: string | null; quote: string; rating: number; createdAt: string };
const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function TestimonialReviewPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/testimonials/pending`, { credentials: "include" });
      if (!response.ok) throw new Error("Unable to load pending comments.");
      setComments(await response.json());
      setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load comments."); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function review(id: string, action: "approve" | "reject") {
    setBusy(id);
    try {
      const response = await fetch(`${API_URL}/testimonials/${encodeURIComponent(id)}${action === "approve" ? "/approve" : ""}`, {
        method: action === "approve" ? "POST" : "DELETE", credentials: "include",
      });
      if (!response.ok) throw new Error(`Unable to ${action} comment.`);
      setComments((current) => current.filter((comment) => comment.id !== id));
      setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Review failed."); }
    finally { setBusy(null); }
  }

  return <div className="min-h-full min-w-0 overflow-y-auto px-4 py-6 sm:p-8">
    <h1 className="font-heading text-3xl font-bold text-brand-dark">Customer comments</h1>
    <p className="mt-2 text-sm text-brand-gray">Review comments before they appear on the home page.</p>
    {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {comments.length === 0 && !error && <p className="mt-8 text-sm text-brand-gray">No comments are waiting for review.</p>}
    <div className="mt-6 grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">{comments.map((comment) => <article key={comment.id} className="min-w-0 max-w-full rounded-xl border border-brand-border bg-white p-4 shadow-sm sm:p-5">
      <div className="flex min-w-0 items-start justify-between gap-4"><p className="min-w-0 break-words font-bold text-brand-dark [overflow-wrap:anywhere]">{comment.name}</p><p className="shrink-0 text-sm text-brand-gold">{comment.rating} / 5 ★</p></div>
      <p className="mt-1 break-words text-xs text-brand-gray [overflow-wrap:anywhere]">{comment.title}{comment.company ? ` · ${comment.company}` : ""} · {new Date(comment.createdAt).toLocaleDateString("en-IN")}</p>
      <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-brand-dark [overflow-wrap:anywhere]">{comment.quote}</p>
      <div className="mt-5 flex flex-wrap gap-3"><button type="button" disabled={busy === comment.id} onClick={() => void review(comment.id, "approve")} className="rounded-full bg-brand-maroon px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Approve</button><button type="button" disabled={busy === comment.id} onClick={() => void review(comment.id, "reject")} className="rounded-full border border-brand-border px-4 py-2 text-sm font-semibold text-brand-dark disabled:opacity-50">Reject</button></div>
    </article>)}</div>
  </div>;
}
