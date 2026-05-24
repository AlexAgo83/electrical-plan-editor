import type { Wire, WireId } from "../../core/entities";
import { buildWireEndpointReferenceNameLookup, normalizeWireEndpointReferenceName } from "../../core/wireReferences";
import type { AppStore } from "../../store";
import { appActions } from "../../store";
import type { ChoiceDialogRequest } from "../types/confirm-dialog";

type DispatchAction = (
  action: Parameters<AppStore["dispatch"]>[0],
  options?: {
    trackHistory?: boolean;
  }
) => void;

export interface WireEndpointReferenceSyncPlan {
  apply: () => void;
}

interface MatchingWireEndpointReferenceTarget {
  wireId: WireId;
  side: "A" | "B";
  currentName: string | undefined;
}

export function normalizeWireEndpointReferenceInput(value: string): string | undefined {
  const normalized = value.trim();
  return normalized.length === 0 ? undefined : normalized;
}

export function resolveWireEndpointReferenceName(
  reference: string | undefined,
  inputName: string,
  kind: "connection" | "seal",
  lookup: ReturnType<typeof buildWireEndpointReferenceNameLookup>
): string | undefined {
  const normalizedInputName = normalizeWireEndpointReferenceName(inputName);
  if (normalizedInputName !== undefined) {
    return normalizedInputName;
  }

  const normalizedReference = normalizeWireEndpointReferenceInput(reference ?? "");
  if (normalizedReference === undefined) {
    return undefined;
  }

  return kind === "connection" ? lookup.connection.get(normalizedReference) : lookup.seal.get(normalizedReference);
}

export function normalizeWireEndpointReferenceNames(nextName: string | readonly string[] | undefined): string[] {
  const values = Array.isArray(nextName) ? nextName : [nextName];
  const normalizedNames: string[] = [];
  for (const value of values) {
    const normalized = normalizeWireEndpointReferenceName(value);
    if (normalized === undefined || normalizedNames.includes(normalized)) {
      continue;
    }
    normalizedNames.push(normalized);
  }
  return normalizedNames;
}

export function createWireEndpointReferenceNameSync({
  store,
  dispatchAction,
  choiceAction
}: {
  store: AppStore;
  dispatchAction: DispatchAction;
  choiceAction: (request: ChoiceDialogRequest) => Promise<string | null>;
}) {
  return (
    kind: "connection" | "seal",
    reference: string | undefined,
    nextName: string | readonly string[] | undefined,
    options?: {
      excludeWireId?: WireId;
      onResolvedName?: (resolvedName: string | undefined) => void;
    }
  ): boolean | WireEndpointReferenceSyncPlan | Promise<WireEndpointReferenceSyncPlan | false> => {
    const normalizedReference = normalizeWireEndpointReferenceInput(reference ?? "");
    if (normalizedReference === undefined) {
      return true;
    }

    const normalizedNextNames = normalizeWireEndpointReferenceNames(nextName);
    const wiresSnapshot = store.getState().wires;
    const matchingTargets = wiresSnapshot.allIds
      .map((wireId) => wiresSnapshot.byId[wireId])
      .filter((wire): wire is Wire => wire !== undefined)
      .filter((wire) => options?.excludeWireId !== wire.id)
      .flatMap((wire): MatchingWireEndpointReferenceTarget[] => {
        const endpointATargetReference = normalizeWireEndpointReferenceInput(
          kind === "connection" ? wire.endpointAConnectionReference ?? "" : wire.endpointASealReference ?? ""
        );
        const endpointBTargetReference = normalizeWireEndpointReferenceInput(
          kind === "connection" ? wire.endpointBConnectionReference ?? "" : wire.endpointBSealReference ?? ""
        );
        const targets: MatchingWireEndpointReferenceTarget[] = [];

        if (endpointATargetReference === normalizedReference) {
          targets.push({
            wireId: wire.id,
            side: "A",
            currentName: normalizeWireEndpointReferenceName(
              kind === "connection" ? wire.endpointAConnectionName : wire.endpointASealName
            )
          });
        }
        if (endpointBTargetReference === normalizedReference) {
          targets.push({
            wireId: wire.id,
            side: "B",
            currentName: normalizeWireEndpointReferenceName(
              kind === "connection" ? wire.endpointBConnectionName : wire.endpointBSealName
            )
          });
        }

        return targets;
      });

    const existingNames = new Set<string>();
    for (const target of matchingTargets) {
      if (target.currentName !== undefined) {
        existingNames.add(target.currentName);
      }
    }

    const createPlan = (resolvedName: string | undefined): WireEndpointReferenceSyncPlan => ({
      apply: () => {
        options?.onResolvedName?.(resolvedName);
        const updatesByWireId = new Map<WireId, { endpointA: boolean; endpointB: boolean }>();

        for (const target of matchingTargets) {
          const existingUpdate = updatesByWireId.get(target.wireId);
          if (existingUpdate !== undefined) {
            if (target.side === "A") {
              existingUpdate.endpointA = true;
            } else {
              existingUpdate.endpointB = true;
            }
            continue;
          }
          updatesByWireId.set(target.wireId, {
            endpointA: target.side === "A",
            endpointB: target.side === "B"
          });
        }

        const latestWiresSnapshot = store.getState().wires;
        for (const [wireId, { endpointA, endpointB }] of updatesByWireId.entries()) {
          const wire = latestWiresSnapshot.byId[wireId];
          if (wire === undefined) {
            continue;
          }
          const nextWire =
            kind === "connection"
              ? {
                  ...wire,
                  ...(endpointA ? { endpointAConnectionName: resolvedName } : {}),
                  ...(endpointB ? { endpointBConnectionName: resolvedName } : {})
                }
              : {
                  ...wire,
                  ...(endpointA ? { endpointASealName: resolvedName } : {}),
                  ...(endpointB ? { endpointBSealName: resolvedName } : {})
                };
          dispatchAction(appActions.saveWire(nextWire), { trackHistory: false });
        }
      }
    });

    if (normalizedNextNames.length === 0) {
      return createPlan(undefined);
    }

    const candidateNames = [...normalizedNextNames];
    for (const wireName of existingNames) {
      if (!candidateNames.includes(wireName)) {
        candidateNames.push(wireName);
      }
    }

    if (candidateNames.length === 1) {
      return createPlan(candidateNames[0]);
    }

    const visibleChoiceNames = candidateNames.slice(0, 3);
    const details =
      candidateNames.length > visibleChoiceNames.length
        ? `Showing ${visibleChoiceNames.length} overwrite proposals out of ${candidateNames.length} detected names.`
        : `Detected names: ${candidateNames.join(", ")}.`;

    return choiceAction({
      title: `Choose ${kind} name`,
      message: `Reference '${normalizedReference}' has ${candidateNames.length} conflicting name${candidateNames.length > 1 ? "s" : ""}. Choose the one to keep.`,
      details,
      discardLabel: "Discard",
      options: visibleChoiceNames.map((name) => ({ id: name, label: name })),
      closeOnBackdrop: true
    }).then((choiceId) => {
      const selectedName = choiceId === null ? undefined : visibleChoiceNames.find((name) => name === choiceId);
      return selectedName === undefined ? false : createPlan(selectedName);
    });
  };
}
