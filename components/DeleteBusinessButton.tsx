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
      const res = await fetch(`/api/businesses/${businessId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errorMessage = data.error || `Failed to delete business (Status: ${res.status})`;
        alert(errorMessage);
        return;
      }

      // Successfully deleted
      alert(`"${businessName}" has been deleted successfully.`);
      router.refresh();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      alert(`Network error deleting business: ${errorMsg}`);
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
