import { createContext, useContext, useEffect, useState } from "react";
import {
  doc, getDoc, setDoc, onSnapshot, serverTimestamp, collection, query, where, getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";

const PregnancyContext = createContext(null);

const DEFAULT_PERMISSIONS = {
  pai:      { diary:"view", kicks:"edit", contractions:"edit", health:"view",  layette:"edit", photos:"edit", songs:"edit", birthPlan:"view", birthTrack:"edit", tips:"view" },
  doula:    { diary:"none", kicks:"view", contractions:"view", health:"view",  layette:"none", photos:"none", songs:"none", birthPlan:"edit", birthTrack:"edit", tips:"edit" },
  obstetra: { diary:"none", kicks:"view", contractions:"view", health:"edit",  layette:"none", photos:"none", songs:"none", birthPlan:"view", birthTrack:"edit", tips:"edit" },
};

export function PregnancyProvider({ children }) {
  const { user } = useAuth();
  const [pregnancy, setPregnancy] = useState(null);
  const [myRole, setMyRole] = useState(null);
  const [myPermissions, setMyPermissions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setPregnancy(null); setMyRole(null); setMyPermissions(null); setLoading(false); return; }

    // Tenta carregar gestação onde sou a mãe (owner)
    const pregnancyId = `preg_${user.uid}`;
    const ref = doc(db, "pregnancies", pregnancyId);

    const unsub = onSnapshot(ref, async (snap) => {
      if (snap.exists()) {
        setPregnancy({ id: snap.id, ...snap.data() });
        setMyRole("mae");
        setMyPermissions(null); // mãe tem acesso total
      } else {
        // Verifica se é membro de alguma gestação
        const membersQ = query(
          collection(db, "pregnancyMembers"),
          where("userId", "==", user.uid),
          where("status", "==", "active")
        );
        const membersSnap = await getDocs(membersQ);
        if (!membersSnap.empty) {
          const memberDoc = membersSnap.docs[0].data();
          const pregSnap = await getDoc(doc(db, "pregnancies", memberDoc.pregnancyId));
          if (pregSnap.exists()) {
            setPregnancy({ id: pregSnap.id, ...pregSnap.data() });
            setMyRole(memberDoc.role);
            setMyPermissions(memberDoc.permissions ?? DEFAULT_PERMISSIONS[memberDoc.role]);
          }
        } else {
          setPregnancy(null);
          setMyRole(null);
          setMyPermissions(null);
        }
      }
      setLoading(false);
    });

    return unsub;
  }, [user]);

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
      pregnancy, myRole, myPermissions, loading,
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
