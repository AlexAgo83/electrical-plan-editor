import type { ReactElement } from "react";

interface TableEntryCountFooterProps {
  count: number;
  className?: string;
}

export function TableEntryCountFooter({ count, className }: TableEntryCountFooterProps): ReactElement {
  const label = count === 1 ? "entry" : "entries";
  return (
    <p className={className === undefined ? "table-entry-count-footer" : `table-entry-count-footer ${className}`}>
      {count} {label}
    </p>
  );
}
