/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  DataProvider,
  GetOneParams,
  GetOneResponse,
  UpdateParams,
  UpdateResponse,
  BaseRecord,
  CreateParams,
  CreateResponse,
  GetListParams,
  GetListResponse,
  DeleteOneParams,
  DeleteOneResponse,
} from "@refinedev/core";
import {
  doc,
  getDoc,
  setDoc,
  DocumentData,
  updateDoc,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";

// Helper function to get boothId from Firestore
const getBoothId = async (userId: string): Promise<string> => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("User not found");
  }

  const userData = userSnap.data();
  if (userData.role !== "client") {
    throw new Error("User is not a client");
  }

  const clientId = userId;
  const boothsRef = collection(db, `clients/${clientId}/booths`);
  const boothsSnapshot = await getDocs(boothsRef);

  if (boothsSnapshot.empty) {
    throw new Error("No booths found for this client");
  }

  const boothDoc = boothsSnapshot.docs[0];
  return boothDoc.id;
};

export const photoboxDataProvider: DataProvider = {
  getApiUrl: () => "",

  getOne: async <TData extends BaseRecord = BaseRecord>(
    params: GetOneParams
  ): Promise<GetOneResponse<TData>> => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const boothId = await getBoothId(userId);
    const docRef = doc(
      db,
      "clients",
      userId,
      "booths",
      boothId,
      "Configs",
      params.id as string
    );
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      throw new Error("Document not found");
    }

    return {
      data: { id: snapshot.id, ...(snapshot.data() as DocumentData) } as TData,
    };
  },

  update: async <
    TData extends BaseRecord = BaseRecord,
    TVariables = {} // Updated to match DataProvider interface
  >(
    params: UpdateParams<TVariables>
  ): Promise<UpdateResponse<TData>> => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const boothId = await getBoothId(userId);
    const docRef = doc(
      db,
      "clients",
      userId,
      "booths",
      boothId,
      "Configs",
      params.id as string
    );

    await updateDoc(docRef, params.variables as any); // Type assertion to satisfy Firestore

    return {
      data: {
        id: params.id,
        ...(params.variables as object),
      } as TData,
    };
  },

  getList: async <TData extends BaseRecord = BaseRecord>(
    params: GetListParams
  ): Promise<GetListResponse<TData>> => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const boothId = await getBoothId(userId);
    const colRef = collection(
      db,
      "clients",
      userId,
      "booths",
      boothId,
      "Configs"
    );
    const snapshot = await getDocs(colRef);

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TData[];

    return {
      data,
      total: data.length,
    };
  },

  deleteOne: async <
    TData extends BaseRecord = BaseRecord,
    TVariables = Record<string, never>
  >(
    params: DeleteOneParams<TVariables>
  ): Promise<DeleteOneResponse<TData>> => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const boothId = await getBoothId(userId);
    const docRef = doc(
      db,
      "clients",
      userId,
      "booths",
      boothId,
      "Configs",
      params.id as string
    );
    await deleteDoc(docRef);

    return {
      data: { id: params.id } as TData,
    };
  },

  create: async <
    TData extends BaseRecord = BaseRecord,
    TVariables = {} // Updated to match DataProvider interface
  >(
    params: CreateParams<TVariables>
  ): Promise<CreateResponse<TData>> => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const boothId = await getBoothId(userId);
    const { id, ...rest } = params.variables as TVariables & { id: string };
    const docRef = doc(
      db,
      "clients",
      userId,
      "booths",
      boothId,
      "Configs",
      id as string
    );
    await setDoc(docRef, rest as any); // Type assertion to satisfy Firestore

    return {
      data: {
        id,
        ...rest,
      } as unknown as TData,
    };
  },
};
