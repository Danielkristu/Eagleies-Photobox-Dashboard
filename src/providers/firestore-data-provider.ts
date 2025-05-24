import {
  BaseRecord,
  GetListParams,
  GetListResponse,
  GetOneParams,
  GetOneResponse,
  CreateParams,
  CreateResponse,
  UpdateParams,
  UpdateResponse,
  DeleteOneParams,
  DeleteOneResponse,
} from "@refinedev/core";

import {
  doc,
  collection,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export const firestoreDataProvider = {
  getList: async <TData extends BaseRecord = BaseRecord>(
    params: GetListParams
  ): Promise<GetListResponse<TData>> => {
    // contoh query: sesuaikan dengan kebutuhan
    const colRef = collection(db, params.resource);
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
    const docRef = doc(db, params.resource, params.id as string);
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
    const id =
      (params.variables as { id?: string }).id ??
      doc(collection(db, params.resource)).id;
    const docRef = doc(db, params.resource, id);

    const dataToSave = { ...params.variables };
    await setDoc(docRef, dataToSave);

    return {
      data: { id, ...dataToSave } as unknown as TData,
    };
  },

  update: async <
    TData extends BaseRecord = BaseRecord,
    TVariables extends Record<string, unknown> = Record<string, unknown>
  >(
    params: UpdateParams<TVariables>
  ): Promise<UpdateResponse<TData>> => {
    const docRef = doc(db, params.resource, params.id as string);
    await updateDoc(docRef, params.variables);

    return {
      data: {
        id: params.id,
        ...(params.variables as object),
      } as unknown as TData,
    };
  },

  deleteOne: async <
    TData extends BaseRecord = BaseRecord,
    TVariables extends { [key: string]: never } = { [key: string]: never }
  >(
    params: DeleteOneParams<TVariables>
  ): Promise<DeleteOneResponse<TData>> => {
    const docRef = doc(db, params.resource, params.id as string);
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
