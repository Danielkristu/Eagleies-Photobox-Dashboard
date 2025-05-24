/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  DataProvider,
  GetOneParams,
  GetOneResponse,
  UpdateParams,
  UpdateResponse,
  BaseRecord,
  CustomParams,
} from "@refinedev/core";
import { doc, getDoc, setDoc, DocumentData } from "firebase/firestore";
import { db } from "../firebase";

export const photoboxDataProvider: DataProvider = {
  getOne: async <TData extends BaseRecord = BaseRecord>(
    params: GetOneParams
  ): Promise<GetOneResponse<TData>> => {
    const docRef = doc(db, "Photobox", params.id as string);
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
    TVariables = NonNullable<unknown>
  >(
    params: UpdateParams<TVariables>
  ): Promise<UpdateResponse<TData>> => {
    const docRef = doc(db, "Photobox", params.id as string);
    await setDoc(docRef, params.variables as object, { merge: true });

    return {
      data: {
        id: params.id,
        ...(params.variables as object),
      } as unknown as TData,
    };
  },

  getList: async <TData extends BaseRecord = BaseRecord>(): Promise<{
    data: TData[];
    total: number;
  }> => ({
    data: [] as TData[],
    total: 0,
  }),

  deleteOne: async <TData extends BaseRecord = BaseRecord>(): Promise<{
    data: TData;
  }> => ({
    data: {} as TData,
  }),

  create: async <TData extends BaseRecord = BaseRecord>(): Promise<{
    data: TData;
  }> => ({
    data: {} as TData,
  }),

  getApiUrl: () => "",

  custom: async <TData extends BaseRecord = BaseRecord>(
    _params?: CustomParams
  ) => ({
    data: {} as TData,
  }),
};
