import type { MouseEvent, ReactElement, ReactNode } from "react";

interface EntityReferenceButtonProps {
  children: ReactNode;
  className?: string;
  title: string;
  onClick: () => void;
}

export function EntityReferenceButton({
  children,
  className = "",
  title,
  onClick
}: EntityReferenceButtonProps): ReactElement {
  function handleClick(event: MouseEvent<HTMLButtonElement>): void {
    event.stopPropagation();
    onClick();
  }

  return (
    <button
      type="button"
      className={`entity-reference-button${className.length > 0 ? ` ${className}` : ""}`}
      title={title}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}
