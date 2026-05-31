import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged, signInWithPopup, signInWithRedirect,
  getRedirectResult, signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, increment } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";

// Detecta celular / navegador embarcado (onde popup falha)
function isMobileOrInApp() {
  const ua = navigator.userAgent || "";
  const mobile = /Android|iPhone|iPad|iPod/i.test(ua);
  const inApp = /FBAN|FBAV|Instagram|Line|WhatsApp|wv/i.test(ua);
  return mobile || inApp;
}

const AuthContext = createContext(null);

const BOOTSTRAP_ADMIN_EMAIL = "emanuel.melo87@gmail.com";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [realIsAdmin, setRealIsAdmin] = useState(false);
  // Admin pode "ver como" outro perfil (impersonação para teste):
  // null = ele mesmo (admin). "mae"|"pai"|"doula"|"obstetra" = simula esse perfil.
  const [previewRole, setPreviewRole] = useState(null);
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
          lastSeenAt: serverTimestamp(),
        };
        // Conta 1 acesso por sessão (métrica de uso)
        const counted = sessionStorage.getItem("bg-counted");
        if (!counted) { profile.opens = increment(1); sessionStorage.setItem("bg-counted", "1"); }
        if (!snap.exists()) {
          await setDoc(ref, { ...profile, opens: increment(1), createdAt: serverTimestamp() });
        } else {
          await setDoc(ref, profile, { merge: true });
        }
        setUser(firebaseUser);

        // Detecta admin da plataforma
        let admin = (firebaseUser.email || "").toLowerCase() === BOOTSTRAP_ADMIN_EMAIL;
        if (!admin) {
          try {
            const a = await getDoc(doc(db, "platformAdmins", firebaseUser.uid));
            admin = a.exists() && a.data().active !== false;
          } catch { /* ignore */ }
        }
        setRealIsAdmin(admin);
      } else {
        setUser(null);
        setRealIsAdmin(false);
        setPreviewRole(null);
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

  // Identidade efetiva (considerando a impersonação do admin)
  const previewing = realIsAdmin && previewRole != null;
  // Quando simula um perfil que não é admin, perde os poderes de admin
  const isAdmin = previewing ? false : realIsAdmin;

  // Só o admin real pode trocar de perfil
  const changePreview = (role) => { if (realIsAdmin) setPreviewRole(role); };

  return (
    <AuthContext.Provider value={{
      user, loading, loginWithGoogle, logout,
      isAdmin, realIsAdmin, previewRole, previewing, setPreviewRole: changePreview,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
