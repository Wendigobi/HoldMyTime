// app/page.tsx
"use client";
import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/businesses", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        deposit: form.get("deposit"),
      }),
    });
    const j = await res.json();
    setLoading(false);
    if (!res.ok) setMsg(j.error ?? "Something went wrong");
    else setMsg(`Created! /${j.business.slug}`);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 p-8">
        <div className="pt-10">
          <h1 className="text-5xl font-bold leading-tight">
            Book more jobs in 24h — <span className="text-yellow-500">with a deposit.</span>
          </h1>
          <p className="mt-4 text-zinc-400">
            Stop no-shows. Create a booking page with a fixed deposit ($25, $50, $75, or $100). Share it, get paid, get confirmations.
          </p>
        </div>

        <form onSubmit={onSubmit} className="self-start mt-10 rounded-2xl border border-yellow-500/40 bg-zinc-950 p-6 shadow-[0_0_40px_rgba(234,179,8,.05)]">
          <h2 className="text-xl font-medium mb-4">Create your booking page</h2>
          <input name="email" type="email" placeholder="your@email.com" className="input" required />
          <input name="name" placeholder="Business name" className="input" required />
          <input name="phone" placeholder="Phone (optional)" className="input" />
          <select name="deposit" className="input" defaultValue="25">
            {[25,50,75,100].map(v => <option key={v} value={v}>${v}</option>)}
          </select>
          <button disabled={loading} className="w-full mt-4 py-2 rounded bg-yellow-500 text-black font-medium hover:bg-yellow-400">
            {loading ? "Creating..." : "Create page"}
          </button>
          {msg && <p className="mt-3 text-sm text-yellow-400">{msg}</p>}
          <style jsx global>{`
            .input { width:100%; margin:.5rem 0; padding:.6rem .8rem; border-radius:.6rem; background:#0a0a0a; border:1px solid #232323; outline:none }
            .input:focus { border-color:#eab308 }
          `}</style>
        </form>
      </div>
    </div>
  );
}
