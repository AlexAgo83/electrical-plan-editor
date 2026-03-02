import { useEffect } from "react";
import type { AppLocale } from "../types/app-controller";
import { translateTextValue } from "../lib/i18n";

const TRANSLATABLE_ATTRIBUTES = ["aria-label", "aria-description", "placeholder", "title"] as const;
const LOCALE_EXEMPT_SELECTOR = "[data-locale-exempt='true']";

const textNodeBaseContent = new WeakMap<Text, string>();
const elementAttributeBaseContent = new WeakMap<Element, Map<string, string>>();

function isWithinLocaleExemptSubtree(node: Node): boolean {
  if (node instanceof Element) {
    return node.closest(LOCALE_EXEMPT_SELECTOR) !== null;
  }
  const parent = node.parentElement;
  return parent?.closest(LOCALE_EXEMPT_SELECTOR) !== null;
}

function shouldSkipTextNode(node: Text): boolean {
  const parent = node.parentElement;
  if (parent === null) {
    return true;
  }
  if (parent.tagName === "SCRIPT" || parent.tagName === "STYLE") {
    return true;
  }
  if (isWithinLocaleExemptSubtree(node)) {
    return true;
  }
  return node.nodeValue?.trim().length === 0;
}

function resolveTextNodeBaseValue(node: Text, locale: AppLocale): string {
  const currentValue = node.nodeValue ?? "";
  const existing = textNodeBaseContent.get(node);
  if (existing === undefined) {
    textNodeBaseContent.set(node, currentValue);
    return currentValue;
  }

  const translatedExisting = translateTextValue("fr", existing);

  if (locale === "en") {
    if (currentValue !== existing && currentValue !== translatedExisting) {
      textNodeBaseContent.set(node, currentValue);
      return currentValue;
    }
    return existing;
  }

  if (currentValue !== existing && currentValue !== translatedExisting) {
    textNodeBaseContent.set(node, currentValue);
    return currentValue;
  }
  return existing;
}

function translateTextNode(node: Text, locale: AppLocale): void {
  if (shouldSkipTextNode(node)) {
    return;
  }

  const base = resolveTextNodeBaseValue(node, locale);
  const nextValue = locale === "fr" ? translateTextValue("fr", base) : base;
  if (node.nodeValue !== nextValue) {
    node.nodeValue = nextValue;
  }
}

function resolveAttributeBaseValue(element: Element, attributeName: string, locale: AppLocale): string | null {
  const currentValue = element.getAttribute(attributeName);
  if (currentValue === null) {
    return null;
  }

  const existingMap = elementAttributeBaseContent.get(element) ?? new Map<string, string>();
  const existing = existingMap.get(attributeName);
  if (existing === undefined) {
    existingMap.set(attributeName, currentValue);
    elementAttributeBaseContent.set(element, existingMap);
    return currentValue;
  }

  const translatedExisting = translateTextValue("fr", existing);

  if (locale === "en") {
    if (currentValue !== existing && currentValue !== translatedExisting) {
      existingMap.set(attributeName, currentValue);
      return currentValue;
    }
    return existing;
  }

  if (currentValue !== existing && currentValue !== translatedExisting) {
    existingMap.set(attributeName, currentValue);
    return currentValue;
  }

  return existing;
}

function translateElementAttributes(element: Element, locale: AppLocale): void {
  if (isWithinLocaleExemptSubtree(element)) {
    return;
  }

  for (const attributeName of TRANSLATABLE_ATTRIBUTES) {
    const base = resolveAttributeBaseValue(element, attributeName, locale);
    if (base === null || base.trim().length === 0) {
      continue;
    }
    const nextValue = locale === "fr" ? translateTextValue("fr", base) : base;
    if (element.getAttribute(attributeName) !== nextValue) {
      element.setAttribute(attributeName, nextValue);
    }
  }
}

function translateSubtree(root: Node, locale: AppLocale): void {
  if (root instanceof Text) {
    translateTextNode(root, locale);
    return;
  }

  if (!(root instanceof Element) && !(root instanceof Document)) {
    return;
  }

  const rootElement = root instanceof Document ? root.documentElement : root;
  if (rootElement === null) {
    return;
  }

  translateElementAttributes(rootElement, locale);
  const walker = document.createTreeWalker(rootElement, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let currentNode: Node | null = walker.currentNode;
  while (currentNode !== null) {
    if (currentNode instanceof Text) {
      translateTextNode(currentNode, locale);
    } else if (currentNode instanceof Element) {
      translateElementAttributes(currentNode, locale);
    }
    currentNode = walker.nextNode();
  }
}

export function useAppLocaleDomTranslation(locale: AppLocale): void {
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.documentElement.lang = locale;
    translateSubtree(document, locale);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => translateSubtree(node, locale));
          continue;
        }

        if (mutation.type === "characterData") {
          translateSubtree(mutation.target, locale);
          continue;
        }

        if (mutation.type === "attributes" && mutation.target instanceof Element) {
          translateSubtree(mutation.target, locale);
        }
      }
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...TRANSLATABLE_ATTRIBUTES]
    });

    return () => {
      observer.disconnect();
    };
  }, [locale]);
}
