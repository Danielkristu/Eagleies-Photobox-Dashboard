/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthBindings, OnErrorResponse } from "@refinedev/core";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

async function syncUserToFirestore(user: any) {
  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const role = "client"; // atur sesuai logika kamu

      await setDoc(userRef, {
        email: user.email,
        name: user.displayName || "",
        role,
      });

      if (role === "client") {
        const clientRef = doc(db, "Clients", user.uid);
        await setDoc(clientRef, {
          name: user.displayName || "",
          xendit_api_key: "",
          created_at: new Date(),
        });
      }
      return role;
    } else {
      return userSnap.data()?.role || "seller";
    }
  } catch (err) {
    console.error("syncUserToFirestore error:", err);
    return "seller"; // fallback role
  }
}

export const authProvider: AuthBindings = {
  login: async ({ email, password }) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      const role = await syncUserToFirestore(user);

      localStorage.setItem("user", JSON.stringify({ uid: user.uid, role }));

      return { success: true, redirectTo: "/" };
    } catch (error: any) {
      return {
        success: false,
        error: {
          name: "Login Error",
          message: error.message || "Unknown error",
        },
      };
    }
  },
  logout: async () => {
    await signOut(auth);
    localStorage.removeItem("user");
    return { success: true, redirectTo: "/login" };
  },
  check: async () => {
    const user = localStorage.getItem("user");
    return user ? { authenticated: true } : { authenticated: false, redirectTo: "/login" };
  },
  getPermissions: async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user?.role;
  },
  getIdentity: async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user?.uid ? { id: user.uid } : null;
  },
  onError: function (error: any): Promise<OnErrorResponse> {
    throw new Error("Function not implemented.");
  }
};
