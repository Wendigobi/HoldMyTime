// components/DeleteBusinessButton.tsx
'use client';

import { useState } from 'react';

export default function DeleteBusinessButton({
  businessId,
  businessName,
}: { businessId: string; businessName: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

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
        setIsDeleting(false);
        return;
      }

      // Successfully deleted - reload the page to show updated list
      alert(`"${businessName}" has been deleted successfully.`);
      window.location.reload();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      alert(`Network error deleting business: ${errorMsg}`);
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
