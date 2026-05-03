import { useState, useRef, useEffect } from "react";

type Variant = "sidebar" | "inline" | "page";

type Props = {
  source: string;
  variant?: Variant;
  eyebrow?: string;
  headline?: string;
  sub?: string;
};

const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/newsletter-subscribe`;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export function NewsletterSignup({
  source,
  variant = "sidebar",
  eyebrow = "Newsletter",
  headline = "The I&R Newsletter",
  sub = "From the Investing & Retirement Research Desk. One scannable email every Thursday — rates, tool comparisons, headlines. Free, no spam.",
}: Props) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const startedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(ANON ? { Authorization: `Bearer ${ANON}`, apikey: ANON } : {}),
        },
        body: JSON.stringify({
          email,
          source,
          website,
          startedAt: startedAtRef.current,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: "err", text: data?.error || "Subscription failed. Please try again." });
      } else if (data?.status === "already_subscribed") {
        setMessage({ type: "ok", text: "You're already subscribed — thanks!" });
        setEmail("");
      } else {
        setMessage({
          type: "ok",
          text: "Check your inbox for a confirmation link to finish subscribing.",
        });
        setEmail("");
      }
    } catch {
      setMessage({ type: "err", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  if (variant === "page") {
    return (
      <form
        onSubmit={submit}
        className="bg-white border border-[#e4d9cf] rounded-sm p-6 sm:p-8 shadow-sm"
      >
        <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#0e4d45] mb-2">
          Email address
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 px-3 py-2.5 text-sm border border-[#d4c5b8] bg-[#fef6f1] rounded-sm focus:outline-none focus:ring-1 focus:ring-[#0e4d45] focus:border-[#0e4d45] text-black"
            disabled={loading}
            maxLength={254}
          />
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="absolute left-[-9999px] w-px h-px opacity-0"
            name="website"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-sm bg-[#0e4d45] text-[#fef6f1] text-[11px] font-semibold uppercase tracking-wider hover:bg-[#0a3832] transition-colors disabled:opacity-60 whitespace-nowrap"
          >
            {loading ? "Subscribing…" : "Subscribe"}
          </button>
        </div>
        <p className="mt-3 text-[11px] text-[#5a5a5a]">
          Double opt-in. We&apos;ll send a confirmation link — you&apos;re not subscribed until you click it. Unsubscribe anytime.
        </p>
        {message && (
          <p
            role="status"
            className={`mt-3 text-[12px] font-medium ${
              message.type === "ok" ? "text-[#0e4d45]" : "text-[#540f04]"
            }`}
          >
            {message.text}
          </p>
        )}
      </form>
    );
  }

  const isSidebar = variant === "sidebar";
  return (
    <div
      className={
        isSidebar
          ? "bg-white border border-[#d4c5b8] rounded-sm shadow-sm"
          : "bg-white border border-[#d4c5b8] rounded-sm shadow-sm"
      }
    >
      <div className="px-3 pt-3 pb-2 border-b border-[#0e4d45]/20">
        <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] text-[#0e4d45]">
          {eyebrow}
        </div>
      </div>
      <div className="p-3">
        <div className="border-l-[3px] border-[#0e4d45] pl-3 mb-3">
          <div className="font-serif text-sm sm:text-base font-bold leading-tight text-black mb-1">
            {headline}
          </div>
          <p className="text-[11px] text-[#5a5a5a] leading-snug">{sub}</p>
        </div>
        <form onSubmit={submit} className="space-y-2 relative">
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={loading}
            maxLength={254}
            className="w-full px-2.5 py-2 text-[12px] border border-[#d4c5b8] bg-[#fef6f1] rounded-sm focus:outline-none focus:ring-1 focus:ring-[#0e4d45] focus:border-[#0e4d45] text-black"
          />
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="absolute left-[-9999px] w-px h-px opacity-0"
            name="website"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full text-center text-[10px] sm:text-[11px] font-semibold bg-[#0e4d45] hover:bg-[#0a3832] text-[#fef6f1] rounded-sm px-3 py-2 transition-colors uppercase tracking-wider disabled:opacity-60"
          >
            {loading ? "Subscribing…" : "Subscribe Free"}
          </button>
        </form>
        {message && (
          <p
            role="status"
            className={`mt-2 text-[11px] leading-snug ${
              message.type === "ok" ? "text-[#0e4d45]" : "text-[#540f04]"
            }`}
          >
            {message.text}
          </p>
        )}
        <p className="mt-2 text-[9px] text-[#5a5a5a] leading-snug">
          Double opt-in. Confirm via email. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}
