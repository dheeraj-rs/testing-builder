import { memo } from 'react';
import { classNames } from '@/app/(builder)/website-builder/utils/classNames';

interface PanelHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export const PanelHeader = memo(({ className, children }: PanelHeaderProps) => {
  return (
    <div
      className={classNames(
        'flex items-center gap-2 bg-surface-b text-text-secondary border-b border-surface px-4 py-1 min-h-[34px] text-sm',
        className,
      )}
    >
      {children}
    </div>
  );
});
