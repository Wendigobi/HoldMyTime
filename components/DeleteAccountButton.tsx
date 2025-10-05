'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteAccountButton({ userEmail }: { userEmail: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirmEmail !== userEmail) {
      alert('Email does not match. Please type your email correctly to confirm deletion.');
      return;
    }

    if (!confirm(
      'Are you absolutely sure? This will:\n\n' +
      '• Cancel your subscription immediately\n' +
      '• Delete all your booking pages\n' +
      '• Delete all booking records\n' +
      '• Permanently delete your account\n\n' +
      'This action CANNOT be undone.'
    )) {
      return;
    }

    setIsDeleting(true);

    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete account');
      }

      alert('Your account has been deleted successfully.');
      router.push('/');
      router.refresh();
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(err?.message || 'Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="btn-danger"
      >
        Delete Account
      </button>
    );
  }

  return (
    <div className="space-y-4 p-4 border-2 border-red-900/50 rounded-lg bg-red-950/20">
      <p className="text-sm font-semibold text-red-400">
        Type your email address to confirm deletion:
      </p>
      <input
        type="email"
        value={confirmEmail}
        onChange={(e) => setConfirmEmail(e.target.value)}
        placeholder={userEmail}
        className="field"
        disabled={isDeleting}
      />
      <div className="flex gap-3">
        <button
          onClick={handleDelete}
          disabled={isDeleting || confirmEmail !== userEmail}
          className="btn-danger"
        >
          {isDeleting ? 'Deleting...' : 'Confirm Delete'}
        </button>
        <button
          onClick={() => {
            setShowConfirm(false);
            setConfirmEmail('');
          }}
          disabled={isDeleting}
          className="btn-outline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
