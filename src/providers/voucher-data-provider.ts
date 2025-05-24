/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BaseRecord,
  GetListResponse,
  GetOneResponse,
  CreateResponse,
  UpdateResponse,
  DeleteOneResponse,
  GetListParams,
  GetOneParams,
  CreateParams,
  UpdateParams,
  DeleteOneParams,
  DeleteOneResponse,
} from "@refinedev/core";
import {
  doc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
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
  const boothsRef = collection(db, `Clients/${clientId}/booths`);
  const boothsSnapshot = await getDocs(boothsRef);

  if (boothsSnapshot.empty) {
    throw new Error("No booths found for this client");
  }

  const boothDoc = boothsSnapshot.docs[0];
  return boothDoc.id;
};

export const voucherDataProvider = {
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
      "Clients",
      userId,
      "booths",
      boothId,
      "vouchers"
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
      "Clients",
      userId,
      "booths",
      boothId,
      "vouchers",
      params.id as string
    );
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      throw new Error("Document not found");
    }

    return {
      data: { id: snapshot.id, ...(snapshot.data() as object) } as TData,
    };
  },

  create: async <
    TData extends BaseRecord = BaseRecord,
    TVariables extends Record<string, unknown> = Record<string, unknown>
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
      "Clients",
      userId,
      "booths",
      boothId,
      "vouchers",
      id
    );
    await setDoc(docRef, rest);

    return {
      data: {
        id,
        ...rest,
      } as TData,
    };
  },

  update: async <
    TData extends BaseRecord = BaseRecord,
    TVariables extends Record<string, unknown> = Record<string, unknown>
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
      "Clients",
      userId,
      "booths",
      boothId,
      "vouchers",
      params.id as string
    );
    await updateDoc(docRef, params.variables);

    return {
      data: {
        id: params.id,
        ...(params.variables as object),
      } as TData,
    };
  },

  deleteOne: async <TData extends BaseRecord = BaseRecord>(
    params: DeleteOneParams
  ): Promise<DeleteOneResponse<TData>> => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const boothId = await getBoothId(userId);
    const docRef = doc(
      db,
      "Clients",
      userId,
      "booths",
      boothId,
      "vouchers",
      params.id as string
    );
    await deleteDoc(docRef);

    return {
      data: { id: params.id } as TData,
    };
  },

  getApiUrl: () => "",
  custom: async <TData extends BaseRecord = BaseRecord>() => ({
    data: [] as TData[],
  }),
};