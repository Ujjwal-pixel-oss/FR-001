import type { User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { firestore } from "./firebase";

export async function saveUserToFirestore(user: User, name?: string) {
    try {
        const userRef = doc(firestore, "users", user.uid);
        const existingUser = await getDoc(userRef);

        await setDoc(
            userRef,
            {
                uid: user.uid,
                name: name || user.displayName || "",
                email: user.email || "",
                lastLoginAt: serverTimestamp(),
                ...(existingUser.exists() ? {} : { createdAt: serverTimestamp() }),
            },
            { merge: true },
        );
    } catch (err) {
        console.warn("Could not sync user to Firestore:", err);
    }
}
