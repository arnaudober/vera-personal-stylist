import { useState, useEffect } from "react";

const DB_NAME = "images";
const OBJECT_NAME = "images";

// Private singleton state reused through the app
let state: Map<string, string> = new Map();
let isInitialized = false;
let isInitializing = false;
const listeners = new Set<(images: Map<string, string>) => void>();

const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(OBJECT_NAME)) {
        db.createObjectStore(OBJECT_NAME, { keyPath: "id" });
      }
    };
  });
};

const initialize = async () => {
  if (isInitialized || isInitializing) {
    return;
  }

  isInitializing = true;

  try {
    const db = await openDatabase();
    const transaction = db.transaction([OBJECT_NAME], "readonly");
    const store = transaction.objectStore(OBJECT_NAME);

    const request = store.getAll();
    await new Promise<void>((resolve, reject) => {
      request.onsuccess = () => {
        const results = request.result || [];
        const newState = new Map(
          results.map((item: { id: string; imageData: string }) => [
            item.id,
            item.imageData,
          ]),
        );
        // Emit change to update all listeners
        listeners.forEach((listener) => listener(newState));
        state = newState;
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    state = new Map();
  } finally {
    isInitialized = true;
    isInitializing = false;
  }
};

export function useImage() {
  // We "subscribe" to the singleton state
  const [images, setImages] = useState(state);

  useEffect(() => {
    const listener = (newImages: Map<string, string>) => setImages(newImages);
    listeners.add(listener);

    if (!isInitialized && !isInitializing) {
      void initialize();
    }

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const saveImage = async ({
    id,
    imageData,
  }: {
    id: string;
    imageData: string;
  }): Promise<void> => {
    const db = await openDatabase();
    const transaction = db.transaction([OBJECT_NAME], "readwrite");
    const store = transaction.objectStore(OBJECT_NAME);

    return new Promise((resolve, reject) => {
      const request = store.put({ id, imageData });
      request.onsuccess = () => {
        const newState = new Map(state);
        newState.set(id, imageData);
        emitChange(newState);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  };

  const getImage = (id: string): string | undefined => {
    return state.get(id) || undefined;
  };

  function emitChange(newImages: Map<string, string>): void {
    listeners.forEach((listener) => listener(newImages));
    state = newImages;
  }

  return {
    images,
    getImage,
    saveImage,
  };
}
