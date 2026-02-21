interface RegisterServiceWorkerCallbacks {
  onNeedRefresh: () => void;
  onOfflineReady: () => void;
  onRegistrationError: (error: unknown) => void;
}

export interface RegisteredServiceWorker {
  applyUpdate: () => Promise<void>;
}

export async function registerServiceWorker(
  callbacks: RegisterServiceWorkerCallbacks
): Promise<RegisteredServiceWorker | null> {
  if (!import.meta.env.PROD) {
    return null;
  }

  try {
    const { registerSW } = await import("virtual:pwa-register");
    const updateServiceWorker = registerSW({
      immediate: false,
      onNeedRefresh: callbacks.onNeedRefresh,
      onOfflineReady: callbacks.onOfflineReady,
      onRegisterError: callbacks.onRegistrationError
    });

    return {
      applyUpdate: async () => {
        await updateServiceWorker(true);
      }
    };
  } catch (error) {
    callbacks.onRegistrationError(error);
    return null;
  }
}
