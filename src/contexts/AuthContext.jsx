import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged, signInWithPopup, signInWithRedirect,
  getRedirectResult, signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";

// Detecta celular / navegador embarcado (onde popup falha)
function isMobileOrInApp() {
  const ua = navigator.userAgent || "";
  const mobile = /Android|iPhone|iPad|iPod/i.test(ua);
  const inApp = /FBAN|FBAV|Instagram|Line|WhatsApp|wv/i.test(ua);
  return mobile || inApp;
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Captura o retorno do login por redirect (mobile)
    getRedirectResult(auth).catch(e => console.error("redirect login:", e));

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Garante/atualiza o perfil do usuário no Firestore
        const ref = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(ref);
        const profile = {
          name: firebaseUser.displayName,
          email: (firebaseUser.email || "").toLowerCase(),
          photoURL: firebaseUser.photoURL,
        };
        if (!snap.exists()) {
          await setDoc(ref, { ...profile, createdAt: serverTimestamp() });
        } else {
          // mantém nome/foto/email atualizados
          await setDoc(ref, profile, { merge: true });
        }
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function loginWithGoogle() {
    // Popup primeiro (funciona no desktop e no Safari/iPad com clique do usuário).
    // Só cai para redirect se o popup for bloqueado ou não suportado (ex: webview).
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      const redirectFallback = [
        "auth/popup-blocked",
        "auth/cancelled-popup-request",
        "auth/operation-not-supported-in-environment",
        "auth/web-storage-unsupported",
      ];
      if (redirectFallback.includes(e.code)) {
        await signInWithRedirect(auth, googleProvider);
      } else if (e.code === "auth/popup-closed-by-user") {
        // usuário fechou — não faz nada
      } else {
        throw e;
      }
    }
  }

  async function logout() {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
