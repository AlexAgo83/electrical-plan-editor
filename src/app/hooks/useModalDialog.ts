import { useCallback, useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from "react";

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface UseModalDialogOptions {
  isOpen: boolean;
  onClose: () => void;
  initialFocusRef?: RefObject<HTMLElement | null>;
  onConfirm?: () => void;
  confirmOnEnter?: boolean;
  identity?: string;
}

export function useModalDialog<TElement extends HTMLElement>({
  isOpen,
  onClose,
  initialFocusRef,
  onConfirm,
  confirmOnEnter = false,
  identity
}: UseModalDialogOptions) {
  const dialogRef = useRef<TElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const enterArmedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    (initialFocusRef?.current ?? dialogRef.current)?.focus();
    return () => {
      if (previousFocusRef.current?.isConnected) previousFocusRef.current.focus();
      previousFocusRef.current = null;
    };
  }, [identity, initialFocusRef, isOpen]);

  useEffect(() => {
    if (!isOpen || !confirmOnEnter) {
      enterArmedRef.current = false;
      return;
    }
    const arm = () => { enterArmedRef.current = true; };
    const timer = window.setTimeout(arm, 0);
    window.addEventListener("keyup", arm, { capture: true, once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keyup", arm, true);
      enterArmedRef.current = false;
    };
  }, [confirmOnEnter, identity, isOpen]);

  const onKeyDown = useCallback((event: ReactKeyboardEvent<TElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key === "Enter" && confirmOnEnter) {
      event.preventDefault();
      event.stopPropagation();
      if (enterArmedRef.current) onConfirm?.();
      return;
    }
    if (event.key !== "Tab" || dialogRef.current === null) return;
    const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)]
      .filter((element) => !element.hidden && element.getAttribute("aria-hidden") !== "true");
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (first === undefined || last === undefined) {
      event.preventDefault();
      dialogRef.current.focus();
    } else if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }, [confirmOnEnter, onClose, onConfirm]);

  return { dialogRef, onKeyDown };
}
