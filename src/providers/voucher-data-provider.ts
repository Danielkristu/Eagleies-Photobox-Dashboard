/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { getBoothId } from "../hooks/useBoothId";

export const voucherDataProvider = {
  getList: async <TData extends BaseRecord = BaseRecord>(
    params: GetListParams
  ): Promise<GetListResponse<TData>> => {
    const boothId = getBoothId();
    const colRef = collection(db, "Photobox", boothId!, "Vouchers");
    const snapshot = await getDocs(colRef);

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TData[];

    return { data, total: data.length };
  },

  getOne: async <TData extends BaseRecord = BaseRecord>(
    params: GetOneParams
  ): Promise<GetOneResponse<TData>> => {
    const boothId = getBoothId();
    const docRef = doc(
      db,
      "Photobox",
      boothId!,
      "Vouchers",
      params.id as string
    );
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) throw new Error("Document not found");

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
    const boothId = getBoothId();
    const { id, ...rest } = params.variables as TVariables & { id: string };

    const docRef = doc(db, "Photobox", boothId!, "Vouchers", id);
    await setDoc(docRef, rest);

    return { data: { id, ...rest } as unknown as TData };
  },

  update: async <
    TData extends BaseRecord = BaseRecord,
    TVariables extends Record<string, unknown> = Record<string, unknown>
  >(
    params: UpdateParams<TVariables>
  ): Promise<UpdateResponse<TData>> => {
    const boothId = getBoothId();
    const docRef = doc(
      db,
      "Photobox",
      boothId!,
      "Vouchers",
      params.id as string
    );
    await updateDoc(docRef, params.variables);

    return {
      data: { id: params.id, ...(params.variables as object) } as TData,
    };
  },

  deleteOne: async <TData extends BaseRecord = BaseRecord>(
    params: DeleteOneParams
  ): Promise<DeleteOneResponse<TData>> => {
    const boothId = getBoothId();
    const docRef = doc(
      db,
      "Photobox",
      boothId!,
      "Vouchers",
      params.id as string
    );
    await deleteDoc(docRef);

    return { data: { id: params.id } as TData };
  },

  getApiUrl: () => "",
  custom: async <TData extends BaseRecord = BaseRecord>() => ({
    data: [] as TData[],
  }),
};
