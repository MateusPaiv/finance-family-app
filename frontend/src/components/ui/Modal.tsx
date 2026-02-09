import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-200 data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className={cn(
              'w-full bg-white border border-gray-200 rounded-lg shadow-lg',
              'transition-all duration-200',
              'data-[closed]:opacity-0 data-[closed]:scale-95',
              sizeStyles[size],
            )}
          >
            {title && (
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  {title}
                </DialogTitle>
                <button
                  onClick={onClose}
                  className="p-1 rounded hover:bg-gray-50 transition-colors duration-fast"
                  aria-label="Close"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            )}

            <div className="p-6">{children}</div>

            {footer && (
              <div className="flex justify-end gap-3 px-6 pb-6">{footer}</div>
            )}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
