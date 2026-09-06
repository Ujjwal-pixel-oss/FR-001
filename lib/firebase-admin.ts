import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getFirebaseAdminAuth() {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY)?.replace(
        /\\n/g,
        "\n",
    );

    const app =
        getApps().length > 0
            ? getApp()
            : initializeApp({
                  credential: cert({
                      projectId,
                      clientEmail,
                      privateKey,
                  }),
              });

    return getAuth(app);
}

export async function verifyFirebaseRequest(request: Request) {
    const authorization = request.headers.get("authorization");
    const token = authorization?.startsWith("Bearer ")
        ? authorization.slice("Bearer ".length)
        : null;

    if (!token) {
        return null;
    }

    try {
        return await getFirebaseAdminAuth().verifyIdToken(token);
    } catch {
        return null;
    }
}
