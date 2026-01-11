import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase.ts";
import { getSessionId } from "./closet.ts";

// Private singleton state reused through the app
let state: Map<string, string> = new Map();
let isInitialized = false;
let isInitializing = false;
const listeners = new Set<(images: Map<string, string>) => void>();

const initialize = async () => {
  if (isInitialized || isInitializing) {
    return;
  }

  isInitializing = true;

  try {
    const sessionId = getSessionId();
    // Load the session's image collection document
    const docRef = doc(db, "images", sessionId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const images = data.images || {};

      // Type-safe conversion from Firestore data to Map<string, string>
      const newState = new Map<string, string>();
      for (const [key, value] of Object.entries(images)) {
        if (typeof value === "string") {
          newState.set(key, value);
        }
      }

      listeners.forEach((listener) => listener(newState));
      state = newState;
    } else {
      state = new Map();
    }
  } catch (error) {
    console.error("Error loading images from Firestore:", error);
    state = new Map();
  } finally {
    isInitialized = true;
    isInitializing = false;
  }
};

export function useImage() {
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
    const sessionId = getSessionId();

    // Update the session's image collection document
    const docRef = doc(db, "images", sessionId);
    const newState = new Map(state);
    newState.set(id, imageData);

    await setDoc(
      docRef,
      {
        images: Object.fromEntries(newState),
        sessionId,
        updatedAt: new Date(),
      },
      { merge: true },
    );

    emitChange(newState);
  };

  const removeImage = async (id: string): Promise<void> => {
    const sessionId = getSessionId();
    const docRef = doc(db, "images", sessionId);
    const newState = new Map(state);
    newState.delete(id);

    await setDoc(
      docRef,
      {
        images: Object.fromEntries(newState),
        sessionId,
        updatedAt: new Date(),
      },
      { merge: true },
    );

    emitChange(newState);
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
    removeImage,
  };
}
