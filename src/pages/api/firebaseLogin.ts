import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User,
} from "firebase/auth";
import { db } from "../../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export const googleLogin = async (): Promise<User | null> => {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    if (user) {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: new Date(),
      });
    }

    console.log("User logged in and data saved:", user);
    return user;
  } catch (error) {
    console.error("Error logging in with Google:", error);
    return null;
  }
};
export const googleLogout = async (): Promise<void> => {
  const auth = getAuth();
  try {
    await signOut(auth);
    console.log("User logged out");
    return Promise.resolve();
  } catch (error) {
    console.error("Error logging out:", error);
    return Promise.reject(error);
  }
};

export const getCurrentUser = (): User | null => {
  const auth = getAuth();
  return auth.currentUser;
};
