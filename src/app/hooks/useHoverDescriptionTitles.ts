import { useEffect } from "react";
import type { AppLocale } from "../types/app-controller";

const CONTROL_SELECTOR = "button, select, option";
const AUTO_TITLE_ATTRIBUTE = "data-auto-hover-title";
const AUTO_TITLE_VALUE_ATTRIBUTE = "data-auto-hover-title-value";

function normalizeText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function extractLabelText(label: HTMLLabelElement): string {
  const clone = label.cloneNode(true) as HTMLElement;
  clone.querySelectorAll("input, select, textarea, button, option").forEach((element) => element.remove());
  return normalizeText(clone.textContent);
}

function readAssociatedLabelText(element: Element): string {
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLButtonElement
  ) {
    const labels = element.labels;
    if (labels !== null && labels.length > 0) {
      const labelText = Array.from(labels)
        .map((label) => extractLabelText(label))
        .filter((value) => value.length > 0)
        .join(" ");
      if (labelText.length > 0) {
        return labelText;
      }
    }
  }

  const nearestLabel = element.closest("label");
  if (nearestLabel !== null) {
    const labelText = extractLabelText(nearestLabel);
    if (labelText.length > 0) {
      return labelText;
    }
  }

  return "";
}

function readVisibleControlText(element: Element): string {
  if (element instanceof HTMLSelectElement) {
    const selectedOption = element.selectedOptions.item(0);
    if (selectedOption !== null) {
      const selectedText = normalizeText(selectedOption.textContent);
      if (selectedText.length > 0) {
        return selectedText;
      }
    }
  }

  return normalizeText(element.textContent);
}

function getFallbackTitleForElement(element: Element, locale: AppLocale): string {
  if (element instanceof HTMLButtonElement) {
    return locale === "fr" ? "Action" : "Action";
  }
  if (element instanceof HTMLSelectElement) {
    return locale === "fr" ? "Sélecteur" : "Selector";
  }
  if (element instanceof HTMLOptionElement) {
    return locale === "fr" ? "Option" : "Option";
  }
  return locale === "fr" ? "Contrôle" : "Control";
}

function computeControlDescription(element: Element, locale: AppLocale): string {
  const ariaLabel = normalizeText(element.getAttribute("aria-label"));
  if (ariaLabel.length > 0) {
    return ariaLabel;
  }

  const ariaDescription = normalizeText(element.getAttribute("aria-description"));
  if (ariaDescription.length > 0) {
    return ariaDescription;
  }

  const labelText = readAssociatedLabelText(element);
  if (labelText.length > 0) {
    return labelText;
  }

  const visibleText = readVisibleControlText(element);
  if (visibleText.length > 0) {
    return visibleText;
  }

  return getFallbackTitleForElement(element, locale);
}

function applyHoverDescription(element: Element, locale: AppLocale): void {
  const currentTitle = element.getAttribute("title");
  const currentTitleNormalized = normalizeText(currentTitle);
  const isAutoTitle = element.getAttribute(AUTO_TITLE_ATTRIBUTE) === "true";
  const previousAutoTitle = element.getAttribute(AUTO_TITLE_VALUE_ATTRIBUTE);

  if (
    isAutoTitle &&
    currentTitleNormalized.length > 0 &&
    previousAutoTitle !== null &&
    currentTitleNormalized !== previousAutoTitle
  ) {
    element.removeAttribute(AUTO_TITLE_ATTRIBUTE);
    element.removeAttribute(AUTO_TITLE_VALUE_ATTRIBUTE);
    return;
  }

  const hasExplicitTitle = currentTitleNormalized.length > 0 && !isAutoTitle;
  if (hasExplicitTitle) {
    return;
  }

  const description = computeControlDescription(element, locale);
  if (description.length === 0) {
    return;
  }

  if (currentTitleNormalized !== description) {
    element.setAttribute("title", description);
  }
  element.setAttribute(AUTO_TITLE_ATTRIBUTE, "true");
  element.setAttribute(AUTO_TITLE_VALUE_ATTRIBUTE, description);
}

function applyHoverDescriptionsWithin(root: Node, locale: AppLocale): void {
  if (root instanceof Element && root.matches(CONTROL_SELECTOR)) {
    applyHoverDescription(root, locale);
  }

  if (!(root instanceof Element) && !(root instanceof Document)) {
    return;
  }

  const controls = root.querySelectorAll(CONTROL_SELECTOR);
  controls.forEach((element) => applyHoverDescription(element, locale));
}

export function useHoverDescriptionTitles(locale: AppLocale): void {
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    applyHoverDescriptionsWithin(document, locale);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => applyHoverDescriptionsWithin(node, locale));
          continue;
        }

        if (mutation.type === "attributes") {
          applyHoverDescriptionsWithin(mutation.target, locale);
          continue;
        }

        if (mutation.type === "characterData") {
          applyHoverDescriptionsWithin(mutation.target, locale);
        }
      }
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["title", "aria-label", "aria-description", "disabled", "value"]
    });

    return () => {
      observer.disconnect();
    };
  }, [locale]);
}
