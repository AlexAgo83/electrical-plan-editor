interface RegisterServiceWorkerCallbacks {
  onNeedRefresh: () => void;
  onOfflineReady: () => void;
  onRegistrationError: (error: unknown) => void;
}

export interface RegisteredServiceWorker {
  applyUpdate: () => Promise<void>;
}

let updateServiceWorkerAction: ((reloadPage?: boolean) => Promise<void>) | null = null;

export async function applyRegisteredServiceWorkerUpdate(): Promise<void> {
  if (updateServiceWorkerAction === null) {
    return;
  }

  await updateServiceWorkerAction(true);
}

export async function registerServiceWorker(
  callbacks: RegisterServiceWorkerCallbacks
): Promise<RegisteredServiceWorker | null> {
  if (!import.meta.env.PROD) {
    return null;
  }

  try {
    const { registerSW } = await import("virtual:pwa-register");
    updateServiceWorkerAction = registerSW({
      immediate: false,
      onNeedRefresh: callbacks.onNeedRefresh,
      onOfflineReady: callbacks.onOfflineReady,
      onRegisterError: callbacks.onRegistrationError
    });

    return {
      applyUpdate: async () => {
        await applyRegisteredServiceWorkerUpdate();
      }
    };
  } catch (error) {
    callbacks.onRegistrationError(error);
    return null;
  }
}
