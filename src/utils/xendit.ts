/* eslint-disable @typescript-eslint/no-explicit-any */
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // Pastikan kamu sudah mengkonfigurasi Firestore
import axios from "axios";
import { notification } from "antd"; // untuk menampilkan error jika ada masalah
import { collection, getDocs } from "firebase/firestore";
// Fungsi untuk mengambil Xendit API Key dari Firestore
export async function getXenditApiKey(userId: string): Promise<string | null> {
  console.log("Fetching Xendit API Key for userId:", userId); // Log userId

  try {
    const clientRef = doc(db, "Clients", userId); // Path harus sesuai dengan yang ada di Firestore
    const clientSnap = await getDoc(clientRef);

    if (clientSnap.exists()) {
      const clientData = clientSnap.data();
      console.log("Client Data Found:", clientData); // Log data client yang ditemukan
      return clientData.xendit_api_key || null;
    } else {
      console.error("Client not found for userId:", userId); // Log jika client tidak ditemukan
      return null;
    }
  } catch (error) {
    console.error("Error fetching Xendit API key from Firestore:", error);
    return null;
  }
}

export async function fetchBoothsData(userId: string) {
  try {
    // Path ke subcollection booths di document client
    const boothsCol = collection(db, "clients", userId, "booths");
    const boothsSnapshot = await getDocs(boothsCol);

    const boothsList = boothsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("Fetched booths:", boothsList);

    return boothsList;
  } catch (error) {
    console.error("Error fetching booths data:", error);
    throw error;
  }
}

// Fungsi untuk mengambil total pendapatan dari Xendit menggunakan API Key
export async function fetchTotalRevenueFromXendit(userId: string) {
  const xenditApiKey = await getXenditApiKey(userId);

  if (!xenditApiKey) {
    notification.error({
      message: "API Key Missing",
      description: "Cannot fetch transactions without an API key.",
    });
    return 0;
  }

  try {
    const response = await axios.get("https://api.xendit.co/v2/invoices", {
      headers: {
        Authorization: `Basic ${btoa(xenditApiKey + ":")}`,
      },
    });

    console.log("Response from Xendit:", response.data);

    const invoices = response.data || [];

    let totalRevenue = 0;

    invoices.forEach((invoice: any) => {
      if (invoice.status === "PAID") {
        // Hitung hanya yang sudah dibayar
        totalRevenue += invoice.amount; // Tambahkan jumlah invoice
      }
    });

    return totalRevenue;
  } catch (error) {
    console.error("Error fetching invoices from Xendit", error);
    notification.error({
      message: "Error fetching revenue",
      description: "There was an issue fetching the total revenue from Xendit.",
    });
    return 0;
  }
}
