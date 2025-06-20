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

      // Fetch all user fields from Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      let userData: any = { uid: user.uid, role };
      if (userSnap.exists()) {
        const data = userSnap.data();
        userData = {
          uid: user.uid,
          role: data.role || role,
        };
        if (data.email || user.email) userData.email = data.email || user.email;
        if (data.name || user.displayName) userData.name = data.name || user.displayName;
        if (data.profilePictureUrl) userData.profilePictureUrl = data.profilePictureUrl;
        if (data.phoneNumber || user.phoneNumber) userData.phoneNumber = data.phoneNumber || user.phoneNumber;
      }
      localStorage.setItem("user", JSON.stringify(userData));
      // Debug: log userData and localStorage
      console.log('Saved userData to localStorage:', userData);
      console.log('localStorage user:', localStorage.getItem('user'));

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
    return user?.uid
      ? {
          id: user.uid,
          email: user.email,
          name: user.name,
          role: user.role,
          profilePictureUrl: user.profilePictureUrl,
          phoneNumber: user.phoneNumber,
        }
      : null;
  },
  onError: function (error: any): Promise<OnErrorResponse> {
    throw new Error("Function not implemented.");
  }
};
