import * as functions from "firebase-functions";
import fetch from "node-fetch";

// Environment variables for security
const RECAPTCHA_SECRET_KEY = functions.config().recaptcha.secret_key;

/**
 * Callable function to verify Google reCAPTCHA v3 token
 * @param data expects { token: string, action: string }
 */
export const verifyRecaptcha = functions.https.onCall(async (request, context) => {
  const token = request.data.token;
  const action = request.data.action || "login";

  if (!token) {
    throw new functions.https.HttpsError("invalid-argument", "No reCAPTCHA token provided.");
  }
  if (!RECAPTCHA_SECRET_KEY) {
    throw new functions.https.HttpsError("internal", "reCAPTCHA secret key not set in environment.");
  }

  // Call Google reCAPTCHA API
  const response = await fetch(
    `https://www.google.com/recaptcha/api/siteverify`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${RECAPTCHA_SECRET_KEY}&response=${token}`
    }
  );
  const result = await response.json();

  // result.success is true if valid, result.score is 0.0-1.0 (v3 only)
  if (!result.success || result.action !== action || result.score < 0.5) {
    throw new functions.https.HttpsError("permission-denied", "Failed reCAPTCHA verification.");
  }

  return { success: true, score: result.score };
});
