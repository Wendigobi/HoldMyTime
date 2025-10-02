// app/dashboard/page.tsx
export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <main style={{ maxWidth: 800, margin: "2rem auto", padding: 24 }}>
      <h1>Dashboard</h1>
      <p>Your dashboard placeholder is live. Wire this up to Supabase data when you’re ready.</p>
      <p><a href="/">Back to Home</a></p>
    </main>
  );
}
