/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BaseRecord,
  GetOneParams,
  GetOneResponse,
  UpdateParams,
  UpdateResponse,
  CreateParams,
  CreateResponse,
  DeleteOneParams,
  DeleteOneResponse,
  CustomParams,
  CustomResponse,
} from "@refinedev/core";

import {
  doc,
  getDoc,
  updateDoc,
  DocumentData,
  PartialWithFieldValue,
} from "firebase/firestore";
import { db } from "../firebase";

export const appConfigDataProvider = {
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

  update: async <
    TData extends BaseRecord = BaseRecord,
    TVariables extends PartialWithFieldValue<DocumentData> = PartialWithFieldValue<DocumentData>
  >(
    params: UpdateParams<TVariables>
  ): Promise<UpdateResponse<TData>> => {
    const docRef = doc(db, params.resource, params.id as string);
    await updateDoc(docRef, params.variables);

    return {
      data: { id: params.id, ...(params.variables as object) } as TData,
    };
  },

  create: async <TData extends BaseRecord = BaseRecord>(
    params: CreateParams
  ): Promise<CreateResponse<TData>> => {
    return { data: {} as TData };
  },

  deleteOne: async <TData extends BaseRecord = BaseRecord>(
    params: DeleteOneParams
  ): Promise<DeleteOneResponse<TData>> => {
    return { data: {} as TData };
  },

  custom: async <TData extends BaseRecord[] = BaseRecord[]>(
    params?: CustomParams
  ): Promise<CustomResponse<TData>> => {
    return { data: [] as unknown as TData };
  },

  getApiUrl: () => "",
};
