/**
 * Import necessary Firebase Admin SDK modules and function types.
 * These are used on the server-side in Cloud Functions.
 */
import { onCall, HttpsError, CallableRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// Initialize the Firebase Admin SDK.
initializeApp();

/**
 * Interface defining the expected data structure from the client.
 */
interface RequestData {
  boothCode: string;
}

/**
 * Interface defining the structure of the successful response.
 */
interface ResponseData {
  token: string;
}

/**
 * An HTTPS Callable Function to exchange a boothCode for a custom auth token.
 *
 * @param {CallableRequest<RequestData>} request The data passed from the client app.
 * @returns {Promise<ResponseData>} A promise that resolves with the custom auth token.
 */
export const getBoothToken = onCall<RequestData>(
  async (request: CallableRequest<RequestData>): Promise<ResponseData> => {
    // --- 1. Validate Input ---
    const boothCode = request.data.boothCode;
    if (!boothCode || typeof boothCode !== 'string') {
      // Throwing an HttpsError is the recommended way to return errors to the client.
      throw new HttpsError(
        "invalid-argument",
        "The function must be called with a 'boothCode' string argument."
      );
    }

    console.log(`Attempting to authenticate with boothCode: ${boothCode}`);

    // --- 2. Query Firestore for the Booth ---
    const firestore = getFirestore();
    // Use a collectionGroup query to search across all 'Booths' subcollections.
    const boothsRef = firestore.collectionGroup("Booths");
    const querySnapshot = await boothsRef.where("boothCode", "==", boothCode).limit(1).get();

    if (querySnapshot.empty) {
      console.error(`No booth found with code: ${boothCode}`);
      throw new HttpsError(
        "not-found",
        "Login failed. No booth found with the provided code."
      );
    }

    // --- 3. Extract IDs and Create Custom Token ---
    const boothDoc = querySnapshot.docs[0];
    const boothId = boothDoc.id;
    // The path to the parent (Client) document is parent.parent.
    const clientId = boothDoc.ref.parent.parent!.id;

    console.log(`Found booth. ClientID: ${clientId}, BoothID: ${boothId}`);

    // The UID for the custom token should be unique to the booth session.
    const uid = `booth-session-${boothId}`;
    const auth = getAuth();

    // 'claims' are extra data embedded in the auth token.
    // Our security rules will use these to grant specific permissions.
    const claims = {
      clientId: clientId,
      boothId: boothId,
      role: 'photobooth' // This claim helps identify this token as a specific 'booth' role.
    };
    
    // Create the custom token that expires after 12 hours.
    const customToken = await auth.createCustomToken(uid, claims);

    console.log(`Successfully created custom token for booth ${boothId}`);

    // --- 4. Return Token to Client ---
    return { token: customToken };
  }
);
