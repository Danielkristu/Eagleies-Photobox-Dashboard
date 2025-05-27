import {
  DataProvider,
  GetOneResponse,
  UpdateResponse,
  BaseRecord,
} from "@refinedev/core";
import {
  doc,
  getDoc,
  updateDoc,
  DocumentData,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export const photoboxDataProvider: DataProvider = {
  // Ambil dokumen Photobox/{boothId}
  getOne: async ({ id }): Promise<GetOneResponse<BaseRecord>> => {
    const docRef = doc(db, "Photobox", id as string);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      throw new Error("Document not found");
    }

    const data = snapshot.data() as DocumentData;

    return {
      data: {
        id: snapshot.id,
        ...data,
      },
    };
  },

  // Update Photobox/{boothId}
update: async ({ id, variables }) => {
  const docRef = doc(db, "Photobox", id as string);
  await setDoc(docRef, variables, { merge: true });

  return {
    data: {
      id,
      ...variables,
    },
  };
},



  // Optional stubs
  getList: async () => ({ data: [], total: 0 }),
  deleteOne: async () => ({ data: {} }),
  create: async () => ({ data: {} }),
  getApiUrl: () => "",
  custom: async () => ({ data: [] }),
};
