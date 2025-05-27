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
import { getBoothId } from "../hooks/useBoothId";

export const backgroundDataProvider = {
  getList: async <TData extends BaseRecord = BaseRecord>(
    params: GetListParams
  ): Promise<GetListResponse<TData>> => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const boothId = await getBoothId();
    if (!boothId) {
      throw new Error("Booth ID not found");
    }

    const colRef = collection(db, "Clients", userId, "booths", boothId, "backgrounds");
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

    const boothId = await getBoothId();
    if (!boothId) {
      throw new Error("Booth ID not found");
    }

    const docRef = doc(db, "Clients", userId, "booths", boothId, "backgrounds", params.id as string);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      throw new Error("Background not found");
    }

    return {
      data: { id: snapshot.id, ...snapshot.data() } as TData,
    };
  },

  create: async <
    TData extends BaseRecord = BaseRecord,
    TVariables = {}
  >(
    params: CreateParams<TVariables>
  ): Promise<CreateResponse<TData>> => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const boothId = await getBoothId();
    if (!boothId) {
      throw new Error("Booth ID not found");
    }

    const { id, ...rest } = params.variables as TVariables & { id: string };
    const docRef = doc(db, "Clients", userId, "booths", boothId, "backgrounds", id as string);
    await setDoc(docRef, rest as any);

    return {
      data: {
        id,
        ...rest,
      } as TData,
    };
  },

  update: async <
    TData extends BaseRecord = BaseRecord,
    TVariables = {}
  >(
    params: UpdateParams<TVariables>
  ): Promise<UpdateResponse<TData>> => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const boothId = await getBoothId();
    if (!boothId) {
      throw new Error("Booth ID not found");
    }

    const docRef = doc(db, "Clients", userId, "booths", boothId, "backgrounds", params.id as string);
    await updateDoc(docRef, params.variables as any);

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

    const boothId = await getBoothId();
    if (!boothId) {
      throw new Error("Booth ID not found");
    }

    const docRef = doc(db, "Clients", userId, "booths", boothId, "backgrounds", params.id as string);
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