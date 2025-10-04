'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteBusinessButton({ businessId, businessName }: { businessId: string; businessName: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${businessName}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/businesses/${businessId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to delete business');
        setIsDeleting(false);
        return;
      }

      router.refresh();
    } catch (err) {
      alert('Failed to delete business');
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  );
}
