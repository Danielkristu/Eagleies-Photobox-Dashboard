// src/providers/firestore-data-provider.ts

import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { DataProvider } from "@refinedev/core";
import { db } from "../firebase";

export const firestoreDataProvider: DataProvider = {
  getList: async ({ resource }) => {
    const snapshot = await getDocs(collection(db, resource));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      data,
      total: data.length,
    };
  },

  getOne: async ({ id }) => {
  const docRef = doc(db, "Photobox", id as string);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    throw new Error("Document not found");
  }

  const data = snapshot.data();

  return {
    data: {
      id: snapshot.id,
      ...data, // ⬅️ Harus mengandung semua field (price, callback_url, dll)
    },
  };
}


  create: async ({ resource, variables }) => {
    const docRef = await addDoc(collection(db, resource), variables);
    return {
      data: {
        id: docRef.id,
        ...variables,
      },
    };
  },

  update: async ({ resource, id, variables }) => {
    const docRef = doc(db, resource, id as string);
    await updateDoc(docRef, variables);
    return {
      data: {
        id,
        ...variables,
      },
    };
  },

  deleteOne: async ({ resource, id }) => {
    const docRef = doc(db, resource, id as string);
    await deleteDoc(docRef);
    return {
      data: {
        id,
      },
    };
  },

  getApiUrl: () => "",

  custom: async () => {
    return { data: [] };
  },
};
