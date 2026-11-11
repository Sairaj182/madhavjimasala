"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function decodeKey(value: string) {
  const padding = "=".repeat((4 - value.length % 4) % 4);
  const normalized = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(normalized);
  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
}

export default function PushNotifications() {
  const [working, setWorking] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    const detectSubscription = async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        if (!cancelled) setUnavailable(true);
        return;
      }
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (!cancelled) setEnabled(Boolean(subscription));
      } catch {
        if (!cancelled) setMessage("Push notifications are not available on this device.");
      }
    };
    void detectSubscription();
    return () => { cancelled = true; };
  }, []);

  const enableNotifications = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setUnavailable(true);
      setMessage("Push notifications are not supported by this browser.");
      return;
    }

    setWorking(true);
    setMessage("");
    try {
      const keyResponse = await fetch(`${API_URL}/push/public-key`, { credentials: "include" });
      if (!keyResponse.ok) throw new Error("Push notifications are not configured yet.");
      const { publicKey } = await keyResponse.json();
      const permission = await Notification.requestPermission();
      if (permission !== "granted") throw new Error("Notification permission was not granted.");

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription() || await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: decodeKey(publicKey) });
      const saveResponse = await fetch(`${API_URL}/push/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(subscription.toJSON()),
      });
      if (!saveResponse.ok) {
        const data = await saveResponse.json().catch(() => null);
        throw new Error(data?.error || "Unable to enable notifications.");
      }
      setEnabled(true);
      setMessage("Order notifications are enabled on this device.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to enable notifications.");
    } finally {
      setWorking(false);
    }
  };

  const disableNotifications = async () => {
    setWorking(true);
    setMessage("");
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const response = await fetch(`${API_URL}/push/subscribe`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.error || "Unable to disable notifications.");
        }
        await subscription.unsubscribe();
      }
      setEnabled(false);
      setMessage("Order notifications are disabled on this device.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to disable notifications.");
    } finally {
      setWorking(false);
    }
  };

  if (unavailable) return <p className="text-xs text-brand-gray">Push notifications are not supported by this browser.</p>;

  if (enabled) return (
    <div className="flex flex-col items-start gap-1 sm:items-end">
      <span className="text-xs font-semibold text-green-700">Order notifications enabled</span>
      <button type="button" onClick={() => void disableNotifications()} disabled={working} className="text-xs font-semibold text-brand-gray underline underline-offset-2 hover:text-brand-maroon disabled:opacity-60">
        {working ? "Updating..." : "Disable on this device"}
      </button>
      {message && <p className="text-xs text-brand-gray">{message}</p>}
    </div>
  );

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <button type="button" onClick={() => void enableNotifications()} disabled={working} className="rounded-full border border-brand-maroon px-4 py-2 text-xs font-bold text-brand-maroon transition hover:bg-brand-maroon hover:text-white disabled:opacity-60">
        {working ? "Enabling..." : "Enable order notifications"}
      </button>
      {message && <p className="text-xs text-red-700">{message}</p>}
    </div>
  );
}
