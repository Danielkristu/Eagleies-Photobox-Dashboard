import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

// Ambil API Key dari Firestore
const getXenditApiKey = async (boothId: string): Promise<string> => {
  const ref = doc(db, "Photobox", boothId);
  const snap = await getDoc(ref);

  if (!snap.exists()) throw new Error("Konfigurasi tidak ditemukan");

  const config = snap.data();
  const apiKey = config.xendit_api_key;

  if (!apiKey) throw new Error("API Key Xendit tidak tersedia");

  return "Basic " + btoa(apiKey + ":");
};

// Fetch transaksi Xendit real-time
export const fetchXenditTransactions = async (boothId: string, filters = {}) => {
  const BASE_URL = "https://api.xendit.co/v2/invoices";
  const params = new URLSearchParams(filters).toString();
  const auth = await getXenditApiKey(boothId);

  const response = await fetch(`${BASE_URL}?${params}`, {
    headers: {
      Authorization: auth,
    },
  });

  if (!response.ok) throw new Error("Gagal fetch transaksi dari Xendit");

  const result = await response.json();

  console.log("📦 Respon lengkap dari Xendit:", result);

  // Karena respon Xendit adalah array transaksi langsung, return result saja
  if (!Array.isArray(result)) {
    throw new Error("Response Xendit bukan array data transaksi");
  }

  return result;
};


