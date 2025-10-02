// app/page.tsx
"use client";

import { useState } from "react";

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [phone, setPhone] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [priceTier, setPriceTier] = useState("$25");
  const [status, setStatus] = useState<null | string>(null);

  const create = async () => {
    setStatus("Creating...");
    try {
      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          slug,
          phone,
          owner_email: ownerEmail,
          price_tier: priceTier,
          services: [],
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed");

      setStatus(`Created! slug=${json.slug}`);
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <main style={{ maxWidth: 700, margin: "2rem auto", padding: 24 }}>
      <h1>Create your booking page</h1>
      <p>Stripe checkout + confirmation. Fixed deposits.</p>

      <div style={{ display: "grid", gap: 12 }}>
        <input
          placeholder="Business email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Business name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Slug (unique)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <input
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          placeholder="Owner email"
          value={ownerEmail}
          onChange={(e) => setOwnerEmail(e.target.value)}
        />

        <select
          value={priceTier}
          onChange={(e) => setPriceTier(e.target.value)}
        >
          <option>$25</option>
          <option>$50</option>
          <option>$75</option>
          <option>$100</option>
        </select>

        <button onClick={create}>Create page</button>
        <div style={{ minHeight: 20, color: status?.startsWith("Error") ? "crimson" : "green" }}>
          {status}
        </div>
      </div>
    </main>
  );
}
