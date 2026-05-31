import { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  doc, getDoc, setDoc, onSnapshot, serverTimestamp, collection, query, where,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";

const PregnancyContext = createContext(null);

export const DEFAULT_PERMISSIONS = {
  pai:      { diary:"view", kicks:"edit", contractions:"edit", health:"view", layette:"edit", photos:"edit", songs:"edit", birthPlan:"view", birthTrack:"edit", tips:"view" },
  doula:    { diary:"none", kicks:"view", contractions:"view", health:"view", layette:"none", photos:"none", songs:"none", birthPlan:"edit", birthTrack:"edit", tips:"edit" },
  obstetra: { diary:"none", kicks:"view", contractions:"view", health:"edit", layette:"none", photos:"none", songs:"none", birthPlan:"view", birthTrack:"edit", tips:"edit" },
};

export function PregnancyProvider({ children }) {
  const { user } = useAuth();

  // Gestação onde sou a mãe (dona)
  const [owned, setOwned] = useState(null);
  // Gestações onde sou membro (pai/doula/obstetra) — pode ser várias
  const [memberOf, setMemberOf] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loadingOwned, setLoadingOwned] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);

  // ─── Owner: minha própria gestação ───
  useEffect(() => {
    if (!user) { setOwned(null); setLoadingOwned(false); return; }
    const ref = doc(db, "pregnancies", `preg_${user.uid}`);
    const unsub = onSnapshot(ref, snap => {
      setOwned(snap.exists() ? { id: snap.id, role: "mae", permissions: null, ...snap.data() } : null);
      setLoadingOwned(false);
    }, () => setLoadingOwned(false));
    return unsub;
  }, [user]);

  // ─── Member: gestações que acompanho ───
  useEffect(() => {
    if (!user) { setMemberOf([]); setLoadingMembers(false); return; }
    const q = query(
      collection(db, "pregnancyMembers"),
      where("userId", "==", user.uid),
      where("status", "==", "active")
    );
    const unsub = onSnapshot(q, async (snap) => {
      const list = await Promise.all(snap.docs.map(async (m) => {
        const data = m.data();
        try {
          const pregSnap = await getDoc(doc(db, "pregnancies", data.pregnancyId));
          if (!pregSnap.exists()) return null;
          return {
            id: pregSnap.id,
            role: data.role,
            permissions: data.permissions ?? DEFAULT_PERMISSIONS[data.role],
            memberLabel: data.label || "",
            ...pregSnap.data(),
          };
        } catch { return null; }
      }));
      setMemberOf(list.filter(Boolean));
      setLoadingMembers(false);
    }, () => setLoadingMembers(false));
    return unsub;
  }, [user]);

  // Lista combinada (dona primeiro, depois as que acompanha)
  const pregnancies = useMemo(() => {
    const all = [];
    if (owned) all.push(owned);
    for (const p of memberOf) if (!all.find(x => x.id === p.id)) all.push(p);
    return all;
  }, [owned, memberOf]);

  // Seleção da gestação ativa (persistida por usuário)
  useEffect(() => {
    if (!user || pregnancies.length === 0) return;
    const key = `bg-active-preg-${user.uid}`;
    const saved = localStorage.getItem(key);
    if (saved && pregnancies.find(p => p.id === saved)) {
      setActiveId(saved);
    } else {
      setActiveId(pregnancies[0].id);
    }
  }, [user, pregnancies]);

  function selectPregnancy(id) {
    if (!user) return;
    setActiveId(id);
    localStorage.setItem(`bg-active-preg-${user.uid}`, id);
  }

  const pregnancy = pregnancies.find(p => p.id === activeId) ?? pregnancies[0] ?? null;
  const realRole = pregnancy?.role ?? null;
  const loading = loadingOwned || loadingMembers;

  // "Ver como perfil" — só a dona pode simular outro perfil (teste de permissões)
  const [previewRole, setPreviewRole] = useState(null);
  const previewing = realRole === "mae" && previewRole && previewRole !== "mae";
  const myRole = previewing ? previewRole : realRole;
  const myPermissions = previewing ? DEFAULT_PERMISSIONS[previewRole] : (pregnancy?.permissions ?? null);

  async function createPregnancy({ lmp, dpp, babyNickname }) {
    if (!user) return;
    const pregnancyId = `preg_${user.uid}`;
    await setDoc(doc(db, "pregnancies", pregnancyId), {
      ownerId: user.uid,
      lmp, dpp,
      babyNickname: babyNickname || "",
      theme: { palette: "rosa-bella" },
      createdAt: serverTimestamp(),
    });
  }

  async function updatePregnancy(data) {
    if (!user || !pregnancy) return;
    await setDoc(doc(db, "pregnancies", pregnancy.id), data, { merge: true });
  }

  function can(section, level = "view") {
    if (myRole === "mae") return true;
    if (!myPermissions) return false;
    const perm = myPermissions[section];
    if (level === "view") return perm === "view" || perm === "edit";
    if (level === "edit") return perm === "edit";
    return false;
  }

  return (
    <PregnancyContext.Provider value={{
      pregnancy, pregnancies, myRole, myPermissions, loading,
      realRole, previewRole, setPreviewRole, previewing,
      activeId, selectPregnancy,
      createPregnancy, updatePregnancy, can,
      DEFAULT_PERMISSIONS,
    }}>
      {children}
    </PregnancyContext.Provider>
  );
}

export function usePregnancy() {
  return useContext(PregnancyContext);
}
