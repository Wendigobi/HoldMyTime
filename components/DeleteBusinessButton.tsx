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
      console.log('Deleting business:', businessId);
      
      const res = await fetch(`/api/businesses/${businessId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Delete response status:', res.status);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error('Delete failed:', data);
        const errorMessage = data.error || data.details?.message || `Failed to delete business (Status: ${res.status})`;
        alert(`Error: ${errorMessage}`);
        setIsDeleting(false);
        return;
      }

      const result = await res.json();
      console.log('Delete successful:', result);
      
      // Successfully deleted - reload the page to show updated list
      alert(`"${businessName}" has been deleted successfully.`);
      window.location.reload();
    } catch (err) {
      console.error('Network error:', err);
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
