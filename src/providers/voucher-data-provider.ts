import { doc, setDoc, getDocs, getDoc, updateDoc, deleteDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import { getBoothId } from "../hooks/useBoothId";

export const voucherDataProvider = {
  getList: async () => {
    const boothId = getBoothId();
    const colRef = collection(db, "Photobox", boothId!, "Vouchers");
    const snapshot = await getDocs(colRef);

    const data = snapshot.docs.map((doc) => ({
      id: doc.id, // pakai doc ID sebagai id
      ...doc.data(),
    }));

    return {
      data,
      total: data.length,
    };
  },

  getOne: async ({ id }) => {
    const boothId = getBoothId();
    const docRef = doc(db, "Photobox", boothId!, "Vouchers", id);
    const snapshot = await getDoc(docRef);
    return { data: { id: snapshot.id, ...snapshot.data() } };
  },

  create: async ({ variables }) => {
    const boothId = getBoothId();
    const { id, ...rest } = variables;

    const docRef = doc(db, "Photobox", boothId!, "Vouchers", id); // ← pakai kode voucher sebagai ID
    await setDoc(docRef, rest);

    return {
      data: {
        id,
        ...rest,
      },
    };
  },

  update: async ({ id, variables }) => {
    const boothId = getBoothId();
    const docRef = doc(db, "Photobox", boothId!, "Vouchers", id);
    await updateDoc(docRef, variables);
    return { data: { id, ...variables } };
  },

  deleteOne: async ({ id }) => {
    const boothId = getBoothId();
    const docRef = doc(db, "Photobox", boothId!, "Vouchers", id);
    await deleteDoc(docRef);
    return { data: { id } };
  },

  getApiUrl: () => "",
  custom: async () => ({ data: [] }),
};
