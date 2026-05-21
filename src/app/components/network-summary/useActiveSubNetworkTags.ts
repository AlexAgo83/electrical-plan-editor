import { useCallback, useEffect, useRef, useState } from "react";

export interface ActiveSubNetworkTagsState {
  activeSubNetworkTags: ReadonlySet<string>;
  isSubNetworkFilteringActive: boolean;
  toggleSubNetworkTag: (tag: string) => void;
  enableAllSubNetworkTags: () => void;
}

export function useActiveSubNetworkTags(allSubNetworkTags: string[]): ActiveSubNetworkTagsState {
  const subNetworkFilterInitializedRef = useRef(false);
  const [activeSubNetworkTags, setActiveSubNetworkTags] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (allSubNetworkTags.length === 0) {
      subNetworkFilterInitializedRef.current = false;
      setActiveSubNetworkTags((current) => (current.size === 0 ? current : new Set()));
      return;
    }
    setActiveSubNetworkTags((current) => {
      const next = new Set<string>();
      const isUninitialized = !subNetworkFilterInitializedRef.current;
      for (const tag of allSubNetworkTags) {
        if (isUninitialized || current.has(tag)) {
          next.add(tag);
        }
      }
      if (isUninitialized) {
        subNetworkFilterInitializedRef.current = true;
      }
      const hasSameSize = next.size === current.size;
      if (hasSameSize && [...next].every((tag) => current.has(tag))) {
        return current;
      }
      return next;
    });
  }, [allSubNetworkTags]);

  const toggleSubNetworkTag = useCallback((tag: string) => {
    setActiveSubNetworkTags((current) => {
      const next = new Set(current);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }, []);

  const enableAllSubNetworkTags = useCallback(() => {
    setActiveSubNetworkTags(new Set(allSubNetworkTags));
  }, [allSubNetworkTags]);

  return {
    activeSubNetworkTags,
    isSubNetworkFilteringActive: allSubNetworkTags.length > 0 && activeSubNetworkTags.size < allSubNetworkTags.length,
    toggleSubNetworkTag,
    enableAllSubNetworkTags
  };
}
