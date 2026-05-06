import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { useSuspendUser } from '@/features/users/api/user.api';
import { toast } from 'sonner';

interface SuspendUserModalProps {
  readonly userId: string;
  readonly userName: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function SuspendUserModal({
  userId,
  userName,
  open,
  onOpenChange,
}: SuspendUserModalProps) {
  const [reason, setReason] = useState('');
  const suspendUser = useSuspendUser();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    suspendUser.mutate(
      { userId, reason: reason.trim() || undefined },
      {
        onSuccess: () => {
          toast.success(`${userName} has been suspended`);
          setReason('');
          onOpenChange(false);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      setReason('');
    }
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend <strong>{userName}</strong>? They
              will not be able to sign in until unsuspended.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="suspend-reason">
                Reason <span className="text-gray-400">(optional)</span>
              </Label>
              <Textarea
                id="suspend-reason"
                placeholder="e.g., Violated terms of service, suspicious activity..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                autoFocus
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={suspendUser.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="warning"
              disabled={suspendUser.isPending}
            >
              {suspendUser.isPending ? 'Suspending...' : 'Suspend User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
