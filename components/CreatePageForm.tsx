// components/CreatePageForm.tsx
'use client';

export default function CreatePageForm() {
  return (
    <form
      className="space-y-3 rounded-lg border border-amber-500/20 bg-black/40 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        alert('Submitted (stub)');
      }}
    >
      <input
        className="w-full rounded-md border border-amber-500/30 bg-black/60 px-3 py-2 text-amber-50 placeholder-amber-400/50 outline-none"
        placeholder="email"
      />
      <input
        className="w-full rounded-md border border-amber-500/30 bg-black/60 px-3 py-2 text-amber-50 placeholder-amber-400/50 outline-none"
        placeholder="business_name"
      />
      <button
        type="submit"
        className="rounded-md bg-amber-500 px-4 py-2 font-medium text-black hover:bg-amber-400"
      >
        Create page
      </button>
    </form>
  );
}
