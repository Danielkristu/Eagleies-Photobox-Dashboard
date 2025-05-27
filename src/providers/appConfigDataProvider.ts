import { DataProvider } from "@refinedev/core";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export const appConfigDataProvider: DataProvider = {
  getOne: async ({ id }) => {
    const ref = doc(db, "Photobox", id as string);
    const snap = await getDoc(ref);

    if (!snap.exists()) throw new Error("Document not found");

    return {
      data: {
        id: snap.id,
        ...snap.data(),
      },
    };
  },

  update: async ({ id, variables }) => {
    const ref = doc(db, "Photobox", id as string);
    await setDoc(ref, variables, { merge: true });

    return {
      data: { id, ...variables },
    };
  },

  // Optional opsi default
  getList: async () => ({ data: [], total: 0 }),
  create: async () => ({ data: {} }),
  deleteOne: async () => ({ data: {} }),
  getApiUrl: () => "",
  custom: async () => ({ data: [] }),
};
