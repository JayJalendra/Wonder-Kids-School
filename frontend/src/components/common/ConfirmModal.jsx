import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to delete this record? This action cannot be undone.',
  confirmText = 'Delete',
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start space-x-3 mt-1">
        <div className="flex-shrink-0 p-2 bg-rose-50 text-rose-600 rounded-full">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <p className="text-sm text-slate-600 pt-1.5">{message}</p>
      </div>
      <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-100">
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};
