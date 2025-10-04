// components/DeleteBusinessButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteBusinessButton({
  businessId,
  businessName,
}: { businessId: string; businessName: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Delete "${businessName}"? This cannot be undone.`)) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/businesses/${businessId}`, { method: 'DELETE' });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? 'Failed to delete business');
        return;
      }

      // Soft toast here if you have a toaster; otherwise:
      router.refresh();
    } catch (err) {
      alert('Network error deleting business');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="btn-danger btn-small w-full"
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  );
}
