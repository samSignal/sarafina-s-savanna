import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Bold,
  ChevronLeft,
  Download,
  ExternalLink,
  Eye,
  Forward,
  Italic,
  MailPlus,
  Paperclip,
  Printer,
  RefreshCcw,
  Reply,
  Search,
  SendHorizontal,
  X,
} from "lucide-react";
import { isAdminUser, useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

type GmailMessage = {
  id: string;
  thread_id: string | null;
  snippet: string | null;
  from: string | null;
  to?: string | null;
  subject: string | null;
  date: string | null;
  message_id?: string | null;
  unread?: boolean;
};

type GmailMessageDetail = GmailMessage & {
  reply_to?: string | null;
  cc?: string | null;
  references?: string | null;
  in_reply_to?: string | null;
  text?: string | null;
  html?: string | null;
  attachments?: GmailAttachment[];
};

type SentMessage = {
  id: number;
  to: string;
  subject: string;
  body: string;
  gmail_message_id: string | null;
  thread_id?: string | null;
  created_at: string;
};

type SentMessageDetail = SentMessage & {
  cc?: string | null;
  bcc?: string | null;
};

type GmailThread = {
  thread_id: string | null;
  messages: GmailMessageDetail[];
};

type GmailAttachment = {
  attachment_id: string;
  filename: string;
  mime_type: string;
  size: number | null;
  cid?: string | null;
  inline?: boolean;
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const markupToHtml = (raw: string) => {
  let escaped = escapeHtml(raw);
  escaped = escaped.replace(/\*\*(.+?)\*\*/gs, "<strong>$1</strong>");
  escaped = escaped.replace(/__(.+?)__/gs, "<strong>$1</strong>");
  escaped = escaped.replace(/\*(.+?)\*/gs, "<em>$1</em>");
  escaped = escaped.replace(/_(.+?)_/gs, "<em>$1</em>");
  escaped = escaped.replace(/(https?:\/\/[^\s<]+)/gi, (m) => {
    const safe = escapeHtml(m);
    return `<a href="${safe}" target="_blank" rel="noopener noreferrer">${safe}</a>`;
  });
  return escaped.replace(/\r\n|\r|\n/g, "<br>");
};

const htmlToMarkup = (html: string) => {
  const doc = new DOMParser().parseFromString(html || "", "text/html");
  const root = doc.body;

  const toText = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || "";
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const el = node as HTMLElement;
    const tag = el.tagName.toUpperCase();

    const children = Array.from(el.childNodes).map(toText).join("");

    if (tag === "BR") return "\n";
    if (tag === "STRONG" || tag === "B") return `**${children}**`;
    if (tag === "EM" || tag === "I") return `_${children}_`;
    if (tag === "A") return el.textContent || el.getAttribute("href") || "";
    if (tag === "P" || tag === "DIV") return `${children}\n`;
    if (tag === "LI") return `${children}\n`;
    if (tag === "UL" || tag === "OL") return `${children}\n`;
    return children;
  };

  const text = Array.from(root.childNodes).map(toText).join("");
  return text.replace(/\u00A0/g, " ").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
};

const isEditorEmpty = (html: string) => {
  const text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(div|p|li)>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  return text.length === 0;
};

const sanitizeEmailHtml = (html: string) => {
  return (
    html
      .replace(/<script\b[\s\S]*?<\/script>/gi, "")
      .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, "")
      .replace(/\son\w+=(?:"[^"]*"|'[^']*')/gi, "")
  );
};

export default function Emails() {
  const { token, user } = useAuth();
  const replyEditorRef = useRef<HTMLDivElement | null>(null);
  const composeEditorRef = useRef<HTMLDivElement | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [attachmentBusy, setAttachmentBusy] = useState<Record<string, boolean>>({});

  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [spamLoading, setSpamLoading] = useState(false);
  const [spamMessages, setSpamMessages] = useState<GmailMessage[]>([]);
  const [sentLoading, setSentLoading] = useState(false);
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([]);
  const [search, setSearch] = useState("");

  const [activeTab, setActiveTab] = useState<"inbox" | "spam" | "sent">("inbox");
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [selectedSentId, setSelectedSentId] = useState<number | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [threadDetail, setThreadDetail] = useState<GmailThread | null>(null);
  const [sentDetail, setSentDetail] = useState<SentMessageDetail | null>(null);

  const [selected, setSelected] = useState<GmailMessageDetail | null>(null);
  const [replyBodyHtml, setReplyBodyHtml] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [replyCc, setReplyCc] = useState("");
  const [replyBcc, setReplyBcc] = useState("");
  const [replyShowCcBcc, setReplyShowCcBcc] = useState(false);
  const [replyAttachments, setReplyAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);

  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeCc, setComposeCc] = useState("");
  const [composeBcc, setComposeBcc] = useState("");
  const [composeShowCcBcc, setComposeShowCcBcc] = useState(false);
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBodyHtml, setComposeBodyHtml] = useState("");
  const [composeAttachments, setComposeAttachments] = useState<File[]>([]);
  const [sendingNew, setSendingNew] = useState(false);

  const authHeaders = useMemo(() => {
    const headers: HeadersInit = { Accept: "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  }, [token]);

  const canSendEmails = useMemo(() => {
    if (isAdminUser(user)) return true;
    return Boolean(user?.permissions?.includes("send_emails") || user?.permissions?.includes("*"));
  }, [user]);

  const canManageEmailConnection = useMemo(() => {
    if (isAdminUser(user)) return true;
    return Boolean(user?.permissions?.includes("manage_email_connection") || user?.permissions?.includes("*"));
  }, [user]);

  const decodeText = (value: string) => {
    const doc = new DOMParser().parseFromString(value, "text/html");
    return doc.documentElement.textContent || "";
  };

  const attachmentAccept =
    "image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.rtf,.zip,.rar,.7z";

  const setAttachmentLoading = (key: string, value: boolean) => {
    setAttachmentBusy((prev) => ({ ...prev, [key]: value }));
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "attachment";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  };

  const openBlobInNewTab = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  };

  const blobToDataUrl = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to read blob"));
      reader.readAsDataURL(blob);
    });

  const fetchAttachment = async (messageId: string, attachmentId: string, disposition: "inline" | "attachment") => {
    const res = await fetch(
      `/api/admin/gmail/message/${encodeURIComponent(messageId)}/attachment/${encodeURIComponent(attachmentId)}?disposition=${disposition}`,
      { headers: authHeaders },
    );
    if (!res.ok) throw new Error("Failed to fetch attachment");
    const blob = await res.blob();
    return blob;
  };

  const previewAttachment = async (messageId: string, att: GmailAttachment) => {
    const key = `${messageId}:${att.attachment_id}:preview`;
    setAttachmentLoading(key, true);
    const win = window.open("", "_blank", "noopener,noreferrer");
    try {
      const blob = await fetchAttachment(messageId, att.attachment_id, "inline");
      const url = URL.createObjectURL(blob);
      if (win) {
        win.location.href = url;
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch {
      toast.error("Failed to preview attachment");
    } finally {
      setAttachmentLoading(key, false);
    }
  };

  const downloadAttachment = async (messageId: string, att: GmailAttachment) => {
    const key = `${messageId}:${att.attachment_id}:download`;
    setAttachmentLoading(key, true);
    try {
      const blob = await fetchAttachment(messageId, att.attachment_id, "attachment");
      downloadBlob(blob, att.filename);
    } catch {
      toast.error("Failed to download attachment");
    } finally {
      setAttachmentLoading(key, false);
    }
  };

  const printHtml = (html: string) => {
    const win = window.open("", "_blank", "noopener,noreferrer");
    if (!win) {
      toast.error("Popup blocked. Allow popups to print.");
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    const start = Date.now();
    const tick = () => {
      if (win.closed) return;
      if (win.document.readyState === "complete" || Date.now() - start > 3000) {
        win.print();
        return;
      }
      setTimeout(tick, 100);
    };
    tick();
  };

  const printThread = () => {
    const msgs = threadDetail?.messages || [];
    if (msgs.length === 0) return;

    const blocks = msgs
      .map((m) => {
        const from = escapeHtml(m.from || "-");
        const to = escapeHtml(m.to || "-");
        const date = escapeHtml(formatDate(m.date));
        const subject = escapeHtml(m.subject || "(no subject)");
        const body = m.html?.trim()
          ? sanitizeEmailHtml(m.html)
          : `<pre style="white-space:pre-wrap;margin:0;">${escapeHtml(m.text || "")}</pre>`;
        return `
          <div style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin:0 0 16px 0;">
            <div style="padding:12px 14px;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;">
              <div style="font-weight:700;">${subject}</div>
              <div style="color:#6b7280;font-size:12px;margin-top:4px;">
                From: ${from} · To: ${to} · ${date}
              </div>
            </div>
            <div style="padding:14px;">
              ${body}
            </div>
          </div>
        `;
      })
      .join("");

    const doc = [
      "<!doctype html>",
      "<html>",
      "<head>",
      '<meta charset="utf-8" />',
      '<meta name="viewport" content="width=device-width, initial-scale=1" />',
      "<title>Print Email</title>",
      "<style>",
      "html,body{margin:0;padding:0;background:#fff}",
      "img,video{max-width:100% !important;height:auto !important}",
      "table{max-width:100% !important}",
      "a{color:#188655}",
      "</style>",
      "</head>",
      "<body>",
      `<div style="max-width:900px;margin:24px auto;padding:0 12px;">${blocks}</div>`,
      "</body>",
      "</html>",
    ].join("");

    printHtml(doc);
  };

  const hydrateInlineAttachments = async (thread: GmailThread) => {
    const next: GmailThread = {
      thread_id: thread.thread_id,
      messages: thread.messages.map((m) => ({ ...m })),
    };

    for (const msg of next.messages) {
      if (!msg.html || !Array.isArray(msg.attachments) || msg.attachments.length === 0) continue;

      const cidAtts = msg.attachments
        .filter((a) => Boolean(a.cid) && String(a.mime_type || "").startsWith("image/"))
        .map((a) => ({ ...a, cid: String(a.cid) }));

      if (cidAtts.length === 0) continue;

      let html = msg.html;
      for (const a of cidAtts) {
        const size = typeof a.size === "number" ? a.size : null;
        if (size !== null && size > 2_000_000) continue;

        try {
          const blob = await fetchAttachment(msg.id, a.attachment_id, "inline");
          const dataUrl = await blobToDataUrl(blob);
          const cid = a.cid || "";
          if (!cid) continue;
          const re = new RegExp(`src=(["'])cid:${escapeRegExp(cid)}\\1`, "gi");
          html = html.replace(re, `src="${dataUrl}"`);
          const re2 = new RegExp(`src=(["'])cid:${escapeRegExp("<" + cid + ">")}\\1`, "gi");
          html = html.replace(re2, `src="${dataUrl}"`);
        } catch {
          continue;
        }
      }

      msg.html = html;
    }

    return next;
  };

  const applyFormat = (target: "reply" | "compose", command: "bold" | "italic") => {
    const el = target === "reply" ? replyEditorRef.current : composeEditorRef.current;
    if (!el) return;
    el.focus();
    document.execCommand(command);
    const next = el.innerHTML;
    if (target === "reply") setReplyBodyHtml(next);
    else setComposeBodyHtml(next);
  };

  const onPastePlain = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain").replace(/\t/g, " ").replace(/ {2,}/g, " ");
    document.execCommand("insertText", false, text);
  };

  const extractEmail = (value: string) => {
    const match = value.match(/<([^>]+)>/);
    if (match?.[1]) return match[1].trim();
    return value.trim();
  };

  const formatDate = (value: string | null) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateParts = (value: string | null) => {
    if (!value) return { date: "-", time: "" };
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return { date: value, time: "" };
    const date = parsed.toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" });
    const time = parsed.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    return { date, time };
  };

  const loadStatus = async () => {
    setStatusLoading(true);
    try {
      const res = await fetch("/api/admin/gmail/status", { headers: authHeaders });
      if (!res.ok) {
        setConnected(false);
        return;
      }
      const data = (await res.json()) as { connected?: boolean };
      setConnected(Boolean(data.connected));
    } catch {
      setConnected(false);
    } finally {
      setStatusLoading(false);
    }
  };

  const loadInbox = async () => {
    setMessagesLoading(true);
    try {
      const res = await fetch("/api/admin/gmail/inbox?max=20", { headers: authHeaders });
      if (!res.ok) {
        toast.error("Failed to load inbox");
        return;
      }
      const data = (await res.json()) as { messages?: GmailMessage[] };
      setMessages(Array.isArray(data.messages) ? data.messages : []);
    } catch {
      toast.error("Failed to load inbox");
    } finally {
      setMessagesLoading(false);
    }
  };

  const loadSpam = async () => {
    setSpamLoading(true);
    try {
      const res = await fetch("/api/admin/gmail/spam?max=20", { headers: authHeaders });
      if (!res.ok) {
        toast.error("Failed to load spam");
        return;
      }
      const data = (await res.json()) as { messages?: GmailMessage[]; moved_to_inbox?: number };
      setSpamMessages(Array.isArray(data.messages) ? data.messages : []);
      const moved = typeof data.moved_to_inbox === "number" ? data.moved_to_inbox : 0;
      if (moved > 0) {
        toast.success(`Moved ${moved} spam message${moved === 1 ? "" : "s"} to Inbox`);
        loadInbox();
      }
    } catch {
      toast.error("Failed to load spam");
    } finally {
      setSpamLoading(false);
    }
  };

  const loadSent = async () => {
    setSentLoading(true);
    try {
      const res = await fetch("/api/admin/gmail/sent?max=50", { headers: authHeaders });
      if (!res.ok) {
        toast.error("Failed to load sent emails");
        return;
      }
      const data = (await res.json()) as { messages?: SentMessage[] };
      setSentMessages(Array.isArray(data.messages) ? data.messages : []);
    } catch {
      toast.error("Failed to load sent emails");
    } finally {
      setSentLoading(false);
    }
  };

  const connectGmail = async () => {
    if (!canManageEmailConnection) {
      toast.error("You do not have permission to manage the Gmail connection");
      return;
    }
    try {
      const res = await fetch("/api/admin/gmail/oauth/url", { headers: authHeaders });
      if (!res.ok) {
        toast.error("Failed to generate Google connect link");
        return;
      }
      const data = (await res.json()) as { url?: string };
      if (!data.url) {
        toast.error("Missing Google connect link");
        return;
      }
      window.open(data.url, "_blank", "noopener,noreferrer");
      toast.message("Complete Google consent in the new tab, then click Refresh Status.");
    } catch {
      toast.error("Failed to generate Google connect link");
    }
  };

  const loadThread = async (id: string) => {
    if (!id) return;
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/gmail/thread/${encodeURIComponent(id)}`, { headers: authHeaders });
      if (!res.ok) {
        toast.error("Failed to load thread");
        return;
      }
      const data = (await res.json()) as GmailThread;
      const hydrated = await hydrateInlineAttachments(data);
      setThreadDetail(hydrated);
    } catch {
      toast.error("Failed to load thread");
    } finally {
      setDetailLoading(false);
    }
  };

  const loadSentMessage = async (id: number) => {
    if (!id) return;
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/gmail/sent/${id}`, { headers: authHeaders });
      if (!res.ok) {
        toast.error("Failed to load sent message");
        return;
      }
      const data = (await res.json()) as { message?: SentMessageDetail };
      if (data.message) {
        setSentDetail(data.message);
      }
    } catch {
      toast.error("Failed to load sent message");
    } finally {
      setDetailLoading(false);
    }
  };

  const sendReply = async () => {
    if (!selected) return;
    if (!canSendEmails) {
      toast.error("You do not have permission to send emails");
      return;
    }
    const body = htmlToMarkup(replyBodyHtml).trim();
    if (!body) {
      toast.error("Reply message is required");
      return;
    }

    setSending(true);
    try {
      const form = new FormData();
      form.append("gmail_message_id", selected.id);
      form.append("body", body);
      if (replyTo.trim()) form.append("to", replyTo.trim());
      if (replySubject.trim()) form.append("subject", replySubject.trim());
      if (replyCc.trim()) form.append("cc", replyCc.trim());
      if (replyBcc.trim()) form.append("bcc", replyBcc.trim());
      for (const f of replyAttachments) form.append("attachments[]", f);

      const res = await fetch("/api/admin/gmail/reply", {
        method: "POST",
        headers: authHeaders,
        body: form,
      });

      if (!res.ok) {
        const error = (await res.json().catch(() => null)) as { message?: string } | null;
        toast.error(error?.message || "Failed to send reply");
        return;
      }

      toast.success("Reply sent");
      setSelected(null);
      setReplyBodyHtml("");
      setReplyTo("");
      setReplySubject("");
      setReplyCc("");
      setReplyBcc("");
      setReplyShowCcBcc(false);
      setReplyAttachments([]);
      loadSent();
    } catch {
      toast.error("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const sendNewEmail = async () => {
    if (!canSendEmails) {
      toast.error("You do not have permission to send emails");
      return;
    }
    const to = composeTo.trim();
    const cc = composeCc.trim();
    const bcc = composeBcc.trim();
    const subject = composeSubject.trim();
    const body = htmlToMarkup(composeBodyHtml).trim();

    if (!to) {
      toast.error("Recipient email is required");
      return;
    }
    if (!subject) {
      toast.error("Subject is required");
      return;
    }
    if (!body) {
      toast.error("Message is required");
      return;
    }

    setSendingNew(true);
    try {
      const form = new FormData();
      form.append("to", to);
      form.append("subject", subject);
      form.append("body", body);
      if (cc) form.append("cc", cc);
      if (bcc) form.append("bcc", bcc);
      for (const f of composeAttachments) form.append("attachments[]", f);

      const res = await fetch("/api/admin/gmail/send", {
        method: "POST",
        headers: authHeaders,
        body: form,
      });

      if (!res.ok) {
        const error = (await res.json().catch(() => null)) as { message?: string } | null;
        toast.error(error?.message || "Failed to send email");
        return;
      }

      toast.success("Email sent");
      setComposeOpen(false);
      setComposeTo("");
      setComposeCc("");
      setComposeBcc("");
      setComposeShowCcBcc(false);
      setComposeSubject("");
      setComposeBodyHtml("");
      setComposeAttachments([]);
      loadSent();
    } catch {
      toast.error("Failed to send email");
    } finally {
      setSendingNew(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, [authHeaders]);

  useEffect(() => {
    if (connected) {
      loadInbox();
      loadSpam();
      loadSent();
    }
  }, [connected]);

  useEffect(() => {
    if (!connected) return;
    if ((activeTab === "inbox" || activeTab === "spam") && selectedThreadId) {
      loadThread(selectedThreadId);
    }
    if (activeTab === "sent" && selectedSentId) {
      loadSentMessage(selectedSentId);
    }
  }, [activeTab, selectedThreadId, selectedSentId, connected]);

  useEffect(() => {
    if (selected) {
      const replyToRaw = selected.reply_to || "";
      const fromRaw = selected.from || "";
      const recipient = extractEmail(replyToRaw || fromRaw);
      setReplyTo(recipient);
      setReplySubject(selected.subject || "");
      setReplyBodyHtml("");
      setReplyCc("");
      setReplyBcc("");
      setReplyShowCcBcc(false);
      setReplyAttachments([]);
    }
  }, [selected]);

  useEffect(() => {
    if (!replyEditorRef.current) return;
    if (replyEditorRef.current.innerHTML !== replyBodyHtml) {
      replyEditorRef.current.innerHTML = replyBodyHtml;
    }
  }, [replyBodyHtml]);

  useEffect(() => {
    if (!composeEditorRef.current) return;
    if (composeEditorRef.current.innerHTML !== composeBodyHtml) {
      composeEditorRef.current.innerHTML = composeBodyHtml;
    }
  }, [composeBodyHtml]);

  const visibleMessages = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter((m) => {
      const from = (m.from || "").toLowerCase();
      const subject = (m.subject || "").toLowerCase();
      const snippet = (m.snippet || "").toLowerCase();
      return from.includes(q) || subject.includes(q) || snippet.includes(q);
    });
  }, [messages, search]);

  const visibleThreads = useMemo(() => {
    const map = new Map<string, { message: GmailMessage; unread: boolean }>();
    for (const m of visibleMessages) {
      const key = m.thread_id || m.id;
      const isUnread = Boolean(m.unread);
      const existing = map.get(key);
      if (!existing) {
        map.set(key, { message: m, unread: isUnread });
        continue;
      }

      const a = existing.message.date ? new Date(existing.message.date).getTime() : 0;
      const b = m.date ? new Date(m.date).getTime() : 0;
      if (b >= a) {
        map.set(key, { message: m, unread: existing.unread || isUnread });
      } else if (isUnread && !existing.unread) {
        map.set(key, { message: existing.message, unread: true });
      }
    }

    return Array.from(map.entries())
      .map(([threadId, value]) => ({ threadId, message: value.message, unread: value.unread }))
      .sort((x, y) => {
        const a = x.message.date ? new Date(x.message.date).getTime() : 0;
        const b = y.message.date ? new Date(y.message.date).getTime() : 0;
        return b - a;
      });
  }, [visibleMessages]);

  const visibleSent = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sentMessages;
    return sentMessages.filter((m) => {
      const to = (m.to || "").toLowerCase();
      const subject = (m.subject || "").toLowerCase();
      const body = (m.body || "").toLowerCase();
      return to.includes(q) || subject.includes(q) || body.includes(q);
    });
  }, [sentMessages, search]);

  const openReply = () => {
    const last = threadDetail?.messages?.[threadDetail.messages.length - 1];
    if (!last) return;
    setSelected(last);
  };

  const openResend = () => {
    if (!sentDetail) return;
    setComposeTo(sentDetail.to);
    setComposeCc(sentDetail.cc || "");
    setComposeBcc(sentDetail.bcc || "");
    setComposeShowCcBcc(Boolean((sentDetail.cc || "").trim() || (sentDetail.bcc || "").trim()));
    setComposeSubject(sentDetail.subject);
    setComposeBodyHtml(markupToHtml(sentDetail.body));
    setComposeOpen(true);
  };

  const openForward = () => {
    const first = threadDetail?.messages?.[0];
    const last = threadDetail?.messages?.[threadDetail.messages.length - 1];
    if (!last) return;

    const subject = last.subject || "";
    const fwdSubject = /^\s*fwd:/i.test(subject) ? subject : `Fwd: ${subject || "(no subject)"}`;
    const from = last.from || "-";
    const to = last.to || "-";
    const date = last.date || "-";
    const body = (last.text || decodeText(last.snippet || "") || "").trim();

    const forwarded = [
      "",
      "",
      "---------- Forwarded message ----------",
      `From: ${from}`,
      `Date: ${date}`,
      `Subject: ${subject || "(no subject)"}`,
      `To: ${to}`,
      "",
      body,
    ].join("\n");

    setComposeTo("");
    setComposeCc("");
    setComposeBcc("");
    setComposeShowCcBcc(false);
    setComposeSubject(fwdSubject);
    setComposeBodyHtml(markupToHtml(forwarded.trim()));
    setComposeOpen(true);
  };

  const openThreadFromSent = () => {
    const threadId = sentDetail?.thread_id || null;
    if (!threadId) return;
    setActiveTab("inbox");
    setSelectedSentId(null);
    setSelectedThreadId(threadId);
  };

  const renderBody = (detail: GmailMessageDetail | null) => {
    if (!detail) return null;
    const html = sanitizeEmailHtml(detail.html || "");
    const text = detail.text || "";

    if (html.trim()) {
      const srcDoc = [
        "<!doctype html>",
        "<html>",
        "<head>",
        '<meta charset="utf-8" />',
        '<meta name="viewport" content="width=device-width, initial-scale=1" />',
        '<base target="_blank" />',
        "<style>",
        "html,body{margin:0;padding:0;width:100%;background:#fff}",
        "img,video{max-width:100% !important;height:auto !important}",
        "table{max-width:100% !important}",
        "body{-webkit-text-size-adjust:100%;text-size-adjust:100%}",
        "</style>",
        "</head>",
        "<body>",
        html,
        "</body>",
        "</html>",
      ].join("");

      return <iframe title="email" sandbox="" className="w-full h-[520px] border rounded-md bg-white" srcDoc={srcDoc} />;
    }

    if (text.trim()) {
      return <div className="whitespace-pre-wrap break-words text-[15px] leading-7 text-zinc-700 font-sans">{text}</div>;
    }

    const snippet = detail.snippet ? decodeText(detail.snippet) : "";
    return <div className="text-[15px] leading-7 text-muted-foreground font-sans">{snippet || "No content."}</div>;
  };

  const wrapSelection = (ref: { current: HTMLTextAreaElement | null }, before: string, after?: string) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const value = el.value ?? "";
    const selectedText = value.slice(start, end);
    const suffix = typeof after === "string" ? after : before;
    const next = value.slice(0, start) + before + selectedText + suffix + value.slice(end);
    el.value = next;
    const cursor = selectedText.length === 0 ? start + before.length : start + before.length + selectedText.length + suffix.length;
    el.setSelectionRange(cursor, cursor);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.focus();
  };

  const removeFileAt = (files: File[], index: number) => files.filter((_, i) => i !== index);

  const renderAttachments = (files: File[], onRemove: (index: number) => void) => {
    if (files.length === 0) return null;
    return (
      <div className="space-y-2">
        {files.map((f, i) => (
          <div key={`${f.name}-${i}`} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{f.name}</div>
              <div className="text-xs text-muted-foreground">{Math.round(f.size / 1024)} KB</div>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => onRemove(i)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    );
  };

  const renderThread = () => {
    const thread = threadDetail?.messages || [];
    if (!threadDetail || thread.length === 0) {
      return <div className="text-sm text-muted-foreground">No message selected.</div>;
    }

    return (
      <div className="space-y-4">
        {thread.map((m) => (
          <div key={m.id} className="rounded-md border bg-white">
            <div className="px-4 py-3 border-b">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  {m.unread ? <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" /> : null}
                  <div className="font-medium truncate">{m.from || "-"}</div>
                  <span className={["text-[11px]", m.unread ? "text-emerald-700" : "text-muted-foreground"].join(" ")}>
                    {m.unread ? "Unread" : "Read"}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground shrink-0">{formatDate(m.date)}</div>
              </div>
              <div className="text-xs text-muted-foreground truncate">
                To: {m.to || "-"}
                {m.cc ? ` · Cc: ${m.cc}` : ""}
              </div>
            </div>
            <div className="px-4 py-3 space-y-3">
              {Array.isArray(m.attachments) && m.attachments.length ? (
                <div className="rounded-md border bg-muted/30 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Paperclip className="h-4 w-4" />
                    Attachments
                    <span className="text-xs text-muted-foreground">({m.attachments.length})</span>
                  </div>
                  <div className="mt-2 space-y-2">
                    {(() => {
                      const unique = new Map<string, GmailAttachment>();
                      for (const a of m.attachments || []) {
                        const filename = a.filename || "";
                        const mime = a.mime_type || "";
                        const size = typeof a.size === "number" ? String(a.size) : "";
                        const key = `${filename}::${mime}::${size}`;
                        if (!unique.has(key)) unique.set(key, a);
                      }
                      const list = Array.from(unique.values()).sort((a, b) => {
                        const ai = Boolean(a.inline || a.cid);
                        const bi = Boolean(b.inline || b.cid);
                        if (ai !== bi) return ai ? 1 : -1;
                        return (a.filename || "").localeCompare(b.filename || "");
                      });

                      return list.map((a) => {
                        const previewKey = `${m.id}:${a.attachment_id}:preview`;
                        const downloadKey = `${m.id}:${a.attachment_id}:download`;
                        const inline = Boolean(a.inline || a.cid);
                      return (
                        <div key={a.attachment_id} className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">
                              {a.filename || "attachment"}
                              {inline ? <span className="ml-2 text-[11px] text-muted-foreground">(inline)</span> : null}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {a.mime_type || "file"}
                              {typeof a.size === "number" ? <span className="ml-2">· {Math.round(a.size / 1024)} KB</span> : null}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={Boolean(attachmentBusy[previewKey])}
                              onClick={() => previewAttachment(m.id, a)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={Boolean(attachmentBusy[downloadKey])}
                              onClick={() => downloadAttachment(m.id, a)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      );
                      });
                    })()}
                  </div>
                </div>
              ) : null}
              {renderBody(m)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Emails</h1>
          <p className="text-muted-foreground">Read incoming emails and reply from a professional sender.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setComposeOpen(true)} disabled={!connected || !canSendEmails}>
            <MailPlus className="h-4 w-4 mr-2" />
            New Email
          </Button>
          <Button variant="outline" onClick={loadStatus} disabled={statusLoading}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh Status
          </Button>
          <Button variant="outline" onClick={loadInbox} disabled={!connected || messagesLoading}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh Inbox
          </Button>
          <Button variant="outline" onClick={loadSpam} disabled={!connected || spamLoading}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh Spam
          </Button>
          <Button variant="outline" onClick={loadSent} disabled={!connected || sentLoading}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh Sent
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gmail Connection</CardTitle>
          <Badge variant={connected ? "default" : "outline"}>{connected ? "Connected" : "Not Connected"}</Badge>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            {connected
              ? "Gmail is connected. Inbox can be loaded below."
              : "Connect Gmail to read incoming emails. You will be asked to approve Google access in a new tab."}
          </div>
          <Button onClick={connectGmail} disabled={connected !== false || !canManageEmailConnection}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Connect Gmail
          </Button>
        </CardContent>
      </Card>

      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          const next = v as "inbox" | "spam" | "sent";
          setActiveTab(next);
          setSelectedThreadId(null);
          setThreadDetail(null);
          setSelectedSentId(null);
          setSentDetail(null);
        }}
      >
        <TabsList>
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="spam">Spam</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
        </TabsList>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {connected ? "Connected to Gmail" : "Not connected"}
          </div>
          <div className="relative w-full sm:w-[420px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" placeholder="Search..." />
          </div>
        </div>

        <TabsContent value="inbox">
          {selectedThreadId ? (
            <Card className="overflow-hidden flex flex-col h-[calc(100vh-280px)]">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div className="min-w-0 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedThreadId(null);
                      setThreadDetail(null);
                    }}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <div className="min-w-0">
                    <CardTitle className="truncate">
                      {threadDetail?.messages?.[threadDetail.messages.length - 1]?.subject || "Select an email"}
                    </CardTitle>
                    {threadDetail?.messages?.length ? (
                      <div className="text-xs text-muted-foreground truncate">
                        From: {threadDetail.messages[threadDetail.messages.length - 1]?.from || "-"} ·{" "}
                        {formatDate(threadDetail.messages[threadDetail.messages.length - 1]?.date || null)}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">Open a message from the list to read it.</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={openReply} disabled={!threadDetail?.messages?.length || !canSendEmails}>
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                  <Button variant="outline" size="sm" onClick={openForward} disabled={!threadDetail?.messages?.length || !canSendEmails}>
                    <Forward className="h-4 w-4 mr-2" />
                    Forward
                  </Button>
                  <Button variant="outline" size="sm" onClick={printThread} disabled={!threadDetail?.messages?.length}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 min-h-0">
                {detailLoading && selectedThreadId ? (
                  <div className="p-4 text-sm text-muted-foreground">Loading message...</div>
                ) : (
                  <ScrollArea className="h-full">
                    <div className="p-4 pr-6">{renderThread()}</div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden flex flex-col h-[calc(100vh-280px)]">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Inbox</CardTitle>
                <div className="text-sm text-muted-foreground">{visibleThreads.length}</div>
              </CardHeader>
              <CardContent className="p-0 flex-1 min-h-0">
                {!connected ? (
                  <div className="p-4 text-sm text-muted-foreground">Connect Gmail to view inbox messages.</div>
                ) : messagesLoading ? (
                  <div className="p-4 text-sm text-muted-foreground">Loading inbox...</div>
                ) : visibleThreads.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">No messages found.</div>
                ) : (
                  <div className="h-full overflow-y-auto">
                    <div className="divide-y">
                      {visibleThreads.map(({ threadId, message, unread }) => {
                        const from = message.from || "-";
                        const subject = message.subject || "(no subject)";
                        const preview = message.snippet ? decodeText(message.snippet) : "";
                        const dt = formatDateParts(message.date);
                        return (
                          <button
                            key={threadId}
                            type="button"
                            onClick={() => {
                              setSelectedSentId(null);
                              setSelectedThreadId(threadId);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-muted/60 transition bg-white"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 min-w-0">
                                  {unread ? <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" /> : null}
                                  <div className={["truncate", unread ? "font-semibold" : "font-medium"].join(" ")}>{from}</div>
                                </div>
                                <div className="text-[11px] text-blue-600 truncate">{dt.date}</div>
                              </div>
                              <div className="text-[11px] text-red-600 whitespace-nowrap text-right">
                                <div>{dt.time}</div>
                                <div className={["text-[10px]", unread ? "text-emerald-700" : "text-muted-foreground"].join(" ")}>
                                  {unread ? "Unread" : "Read"}
                                </div>
                              </div>
                            </div>
                            <div className={["mt-1 text-sm truncate", unread ? "font-semibold" : "font-medium"].join(" ")}>
                              {subject}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground truncate">{preview}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="spam">
          {selectedThreadId ? (
            <Card className="overflow-hidden flex flex-col h-[calc(100vh-280px)]">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div className="min-w-0 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedThreadId(null);
                      setThreadDetail(null);
                    }}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <div className="min-w-0">
                    <CardTitle className="truncate">
                      {threadDetail?.messages?.[threadDetail.messages.length - 1]?.subject || "Select an email"}
                    </CardTitle>
                    {threadDetail?.messages?.length ? (
                      <div className="text-xs text-muted-foreground truncate">
                        From: {threadDetail.messages[threadDetail.messages.length - 1]?.from || "-"} ·{" "}
                        {formatDate(threadDetail.messages[threadDetail.messages.length - 1]?.date || null)}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">Open a message from the list to read it.</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={openReply} disabled={!threadDetail?.messages?.length || !canSendEmails}>
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                  <Button variant="outline" size="sm" onClick={openForward} disabled={!threadDetail?.messages?.length || !canSendEmails}>
                    <Forward className="h-4 w-4 mr-2" />
                    Forward
                  </Button>
                  <Button variant="outline" size="sm" onClick={printThread} disabled={!threadDetail?.messages?.length}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 min-h-0">
                {detailLoading && selectedThreadId ? (
                  <div className="p-4 text-sm text-muted-foreground">Loading message...</div>
                ) : (
                  <ScrollArea className="h-full">
                    <div className="p-4 pr-6">{renderThread()}</div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden flex flex-col h-[calc(100vh-280px)]">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Spam</CardTitle>
                <div className="text-sm text-muted-foreground">{spamMessages.length}</div>
              </CardHeader>
              <CardContent className="p-0 flex-1 min-h-0">
                {!connected ? (
                  <div className="p-4 text-sm text-muted-foreground">Connect Gmail to view spam messages.</div>
                ) : spamLoading ? (
                  <div className="p-4 text-sm text-muted-foreground">Loading spam...</div>
                ) : spamMessages.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">No spam messages found.</div>
                ) : (
                  <div className="h-full overflow-y-auto">
                    <div className="divide-y">
                      {(() => {
                        const q = search.trim().toLowerCase();
                        const list = !q
                          ? spamMessages
                          : spamMessages.filter((m) => {
                              const from = (m.from || "").toLowerCase();
                              const subject = (m.subject || "").toLowerCase();
                              const snippet = (m.snippet || "").toLowerCase();
                              return from.includes(q) || subject.includes(q) || snippet.includes(q);
                            });

                        const map = new Map<string, { message: GmailMessage; unread: boolean }>();
                        for (const m of list) {
                          const key = m.thread_id || m.id;
                          const isUnread = Boolean(m.unread);
                          const existing = map.get(key);
                          if (!existing) {
                            map.set(key, { message: m, unread: isUnread });
                            continue;
                          }
                          const a = existing.message.date ? new Date(existing.message.date).getTime() : 0;
                          const b = m.date ? new Date(m.date).getTime() : 0;
                          if (b >= a) {
                            map.set(key, { message: m, unread: existing.unread || isUnread });
                          } else if (isUnread && !existing.unread) {
                            map.set(key, { message: existing.message, unread: true });
                          }
                        }

                        return Array.from(map.entries())
                          .map(([threadId, value]) => ({ threadId, message: value.message, unread: value.unread }))
                          .sort((x, y) => {
                            const a = x.message.date ? new Date(x.message.date).getTime() : 0;
                            const b = y.message.date ? new Date(y.message.date).getTime() : 0;
                            return b - a;
                          })
                          .map(({ threadId, message, unread }) => {
                            const from = message.from || "-";
                            const subject = message.subject || "(no subject)";
                            const preview = message.snippet ? decodeText(message.snippet) : "";
                            const dt = formatDateParts(message.date);
                            return (
                              <button
                                key={threadId}
                                type="button"
                                onClick={() => {
                                  setSelectedSentId(null);
                                  setSelectedThreadId(threadId);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-muted/60 transition bg-white"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 min-w-0">
                                      {unread ? <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" /> : null}
                                      <div className={["truncate", unread ? "font-semibold" : "font-medium"].join(" ")}>
                                        {from}
                                      </div>
                                    </div>
                                    <div className="text-[11px] text-blue-600 truncate">{dt.date}</div>
                                  </div>
                                  <div className="text-[11px] text-red-600 whitespace-nowrap text-right">
                                    <div>{dt.time}</div>
                                    <div className={["text-[10px]", unread ? "text-emerald-700" : "text-muted-foreground"].join(" ")}>
                                      {unread ? "Unread" : "Read"}
                                    </div>
                                  </div>
                                </div>
                                <div className={["mt-1 text-sm truncate", unread ? "font-semibold" : "font-medium"].join(" ")}>
                                  {subject}
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground truncate">{preview}</div>
                              </button>
                            );
                          });
                      })()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sent">
          {selectedSentId ? (
            <Card className="overflow-hidden flex flex-col h-[calc(100vh-280px)]">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div className="min-w-0 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedSentId(null);
                      setSentDetail(null);
                    }}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <div className="min-w-0">
                    <CardTitle className="truncate">{sentDetail?.subject || "Select an email"}</CardTitle>
                    {sentDetail ? (
                      <div className="text-xs text-muted-foreground truncate">
                        To: {sentDetail.to} · {formatDate(sentDetail.created_at)}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">Open a message from the list to read it.</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={openResend} disabled={!sentDetail || !canSendEmails}>
                    <SendHorizontal className="h-4 w-4 mr-2" />
                    Resend
                  </Button>
                  <Button variant="outline" size="sm" onClick={openThreadFromSent} disabled={!sentDetail?.thread_id}>
                    <Reply className="h-4 w-4 mr-2" />
                    View Thread
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 min-h-0">
                {detailLoading && selectedSentId ? (
                  <div className="p-4 text-sm text-muted-foreground">Loading message...</div>
                ) : sentDetail ? (
                  <ScrollArea className="h-full">
                    <div className="p-4 pr-6">
                      <pre className="whitespace-pre-wrap break-words text-sm text-foreground font-sans">{sentDetail.body}</pre>
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="p-4 text-sm text-muted-foreground">No message selected.</div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden flex flex-col h-[calc(100vh-280px)]">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Sent</CardTitle>
                <div className="text-sm text-muted-foreground">{visibleSent.length}</div>
              </CardHeader>
              <CardContent className="p-0 flex-1 min-h-0">
                {!connected ? (
                  <div className="p-4 text-sm text-muted-foreground">Connect Gmail to view sent messages.</div>
                ) : sentLoading ? (
                  <div className="p-4 text-sm text-muted-foreground">Loading sent...</div>
                ) : visibleSent.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">No sent messages yet.</div>
                ) : (
                  <div className="h-full overflow-y-auto">
                    <div className="divide-y">
                      {visibleSent.map((m) => {
                        const dt = formatDateParts(m.created_at);
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setSelectedThreadId(null);
                              setThreadDetail(null);
                              setSelectedSentId(m.id);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-muted/60 transition bg-white"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="truncate font-medium">{m.to}</div>
                                <div className="text-[11px] text-blue-600 truncate">{dt.date}</div>
                              </div>
                              <div className="text-[11px] text-red-600 whitespace-nowrap text-right">
                                <div>{dt.time}</div>
                                <div className="text-[10px] text-muted-foreground">Sent</div>
                              </div>
                            </div>
                            <div className="mt-1 text-sm font-semibold truncate">{m.subject}</div>
                            <div className="mt-1 text-xs text-muted-foreground truncate">{m.body}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => (!open ? setSelected(null) : null)}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Reply</DialogTitle>
            <DialogDescription>Send a reply to the selected email.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="text-sm">
              <div className="text-muted-foreground">To</div>
              <Input value={replyTo} onChange={(e) => setReplyTo(e.target.value)} placeholder="recipient@example.com" />
            </div>
            {replyShowCcBcc ? (
              <>
                <div className="text-sm">
                  <div className="text-muted-foreground">Cc</div>
                  <Input value={replyCc} onChange={(e) => setReplyCc(e.target.value)} placeholder="cc1@example.com, cc2@example.com" />
                </div>
                <div className="text-sm">
                  <div className="text-muted-foreground">Bcc</div>
                  <Input value={replyBcc} onChange={(e) => setReplyBcc(e.target.value)} placeholder="bcc@example.com" />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-end">
                <Button variant="outline" size="sm" onClick={() => setReplyShowCcBcc(true)}>
                  Add Cc/Bcc
                </Button>
              </div>
            )}
            <div className="text-sm">
              <div className="text-muted-foreground">Subject</div>
              <Input value={replySubject} onChange={(e) => setReplySubject(e.target.value)} placeholder="Subject" />
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormat("reply", "bold")}
              >
                <Bold className="h-4 w-4 mr-2" />
                Bold
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormat("reply", "italic")}
              >
                <Italic className="h-4 w-4 mr-2" />
                Italic
              </Button>
              <div className="relative inline-flex">
                <Button type="button" variant="outline" size="sm" tabIndex={-1}>
                  <Paperclip className="h-4 w-4 mr-2" />
                  Attach
                </Button>
                <input
                  type="file"
                  multiple
                  accept={attachmentAccept}
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                  onClick={(e) => {
                    e.currentTarget.value = "";
                  }}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length) setReplyAttachments((prev) => [...prev, ...files]);
                    e.currentTarget.value = "";
                  }}
                />
              </div>
            </div>
            {renderAttachments(replyAttachments, (i) => setReplyAttachments((prev) => removeFileAt(prev, i)))}
            <div className="relative">
              {isEditorEmpty(replyBodyHtml) ? (
                <div className="pointer-events-none absolute left-3 top-2 text-sm text-muted-foreground">Write your reply...</div>
              ) : null}
              <div
                ref={replyEditorRef}
                role="textbox"
                aria-multiline="true"
                contentEditable
                suppressContentEditableWarning
                className="block min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-sans whitespace-pre-line break-words"
                onPaste={onPastePlain}
                onInput={(e) => setReplyBodyHtml(e.currentTarget.innerHTML)}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Reply will be sent from your professional support address configured in the system.
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)} disabled={sending}>
              Cancel
            </Button>
            <Button onClick={sendReply} disabled={sending}>
              {sending ? "Sending..." : "Send Reply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>New Email</DialogTitle>
            <DialogDescription>Compose and send a new email.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="text-sm">
              <div className="text-muted-foreground">To</div>
              <Input value={composeTo} onChange={(e) => setComposeTo(e.target.value)} placeholder="recipient@example.com" />
            </div>
            {composeShowCcBcc ? (
              <>
                <div className="text-sm">
                  <div className="text-muted-foreground">Cc</div>
                  <Input value={composeCc} onChange={(e) => setComposeCc(e.target.value)} placeholder="cc1@example.com, cc2@example.com" />
                </div>
                <div className="text-sm">
                  <div className="text-muted-foreground">Bcc</div>
                  <Input value={composeBcc} onChange={(e) => setComposeBcc(e.target.value)} placeholder="bcc@example.com" />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-end">
                <Button variant="outline" size="sm" onClick={() => setComposeShowCcBcc(true)}>
                  Add Cc/Bcc
                </Button>
              </div>
            )}
            <div className="text-sm">
              <div className="text-muted-foreground">Subject</div>
              <Input value={composeSubject} onChange={(e) => setComposeSubject(e.target.value)} placeholder="Subject" />
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormat("compose", "bold")}
              >
                <Bold className="h-4 w-4 mr-2" />
                Bold
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormat("compose", "italic")}
              >
                <Italic className="h-4 w-4 mr-2" />
                Italic
              </Button>
              <div className="relative inline-flex">
                <Button type="button" variant="outline" size="sm" tabIndex={-1}>
                  <Paperclip className="h-4 w-4 mr-2" />
                  Attach
                </Button>
                <input
                  type="file"
                  multiple
                  accept={attachmentAccept}
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                  onClick={(e) => {
                    e.currentTarget.value = "";
                  }}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length) setComposeAttachments((prev) => [...prev, ...files]);
                    e.currentTarget.value = "";
                  }}
                />
              </div>
            </div>
            {renderAttachments(composeAttachments, (i) => setComposeAttachments((prev) => removeFileAt(prev, i)))}
            <div className="relative">
              {isEditorEmpty(composeBodyHtml) ? (
                <div className="pointer-events-none absolute left-3 top-2 text-sm text-muted-foreground">Write your email...</div>
              ) : null}
              <div
                ref={composeEditorRef}
                role="textbox"
                aria-multiline="true"
                contentEditable
                suppressContentEditableWarning
                className="block min-h-[260px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-sans whitespace-pre-line break-words"
                onPaste={onPastePlain}
                onInput={(e) => setComposeBodyHtml(e.currentTarget.innerHTML)}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Email will be sent from your professional support address configured in the system.
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setComposeOpen(false)} disabled={sendingNew}>
              Cancel
            </Button>
            <Button onClick={sendNewEmail} disabled={sendingNew}>
              {sendingNew ? "Sending..." : "Send Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
