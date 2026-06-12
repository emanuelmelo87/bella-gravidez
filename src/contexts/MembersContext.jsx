import { createContext, useContext, useEffect, useState } from "react";
import {
  collection, query, where, onSnapshot,
  doc, setDoc, updateDoc, deleteDoc,
  serverTimestamp, getDoc, addDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";
import { usePregnancy, DEFAULT_PERMISSIONS } from "./PregnancyContext";

const MembersContext = createContext(null);

const ROLE_LABELS = {
  pai:      { label: "Pai / Parceiro", icon: "👨‍👩‍👧" },
  doula:    { label: "Doula",          icon: "🤱" },
  obstetra: { label: "Obstetra",       icon: "👩‍⚕️" },
};

export function MembersProvider({ children }) {
  const { user } = useAuth();
  const { pregnancy } = usePregnancy();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pregnancy) { setMembers([]); setLoading(false); return; }

    const q = query(
      collection(db, "pregnancyMembers"),
      where("pregnancyId", "==", pregnancy.id)
    );
    const unsub = onSnapshot(q, snap => {
      setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [pregnancy]);

  async function createInvite(role) {
    if (!pregnancy || !user) return null;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const ref = await addDoc(collection(db, "pregnancyInvites"), {
      pregnancyId: pregnancy.id,
      role,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      expiresAt,
      usedBy: null,
    });
    return ref.id;
  }

  async function acceptInvite(inviteId) {
    if (!user) return { error: "not_logged_in" };

    const inviteRef = doc(db, "pregnancyInvites", inviteId);
    const inviteSnap = await getDoc(inviteRef);

    if (!inviteSnap.exists()) return { error: "not_found" };
    const invite = inviteSnap.data();

    if (invite.usedBy) return { error: "already_used" };
    if (new Date(invite.expiresAt.toDate()) < new Date()) return { error: "expired" };

    // Verifica se já é membro
    const memberId = `${invite.pregnancyId}_${user.uid}`;
    const memberRef = doc(db, "pregnancyMembers", memberId);
    const memberSnap = await getDoc(memberRef);
    if (memberSnap.exists()) return { error: "already_member", pregnancyId: invite.pregnancyId };

    // Cria o membro (inviteId é validado pelas regras do Firestore)
    await setDoc(memberRef, {
      pregnancyId: invite.pregnancyId,
      inviteId,
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName,
      userPhotoURL: user.photoURL,
      role: invite.role,
      status: "active",
      isPrimary: true,
      label: "",
      permissions: DEFAULT_PERMISSIONS[invite.role],
      invitedAt: serverTimestamp(),
      joinedAt: serverTimestamp(),
    });

    // Marca convite como usado
    await updateDoc(inviteRef, { usedBy: user.uid, usedAt: serverTimestamp() });

    return { success: true, pregnancyId: invite.pregnancyId, role: invite.role };
  }

  async function updateMember(memberId, data) {
    await updateDoc(doc(db, "pregnancyMembers", memberId), data);
  }

  async function removeMember(memberId) {
    await deleteDoc(doc(db, "pregnancyMembers", memberId));
  }

  async function updatePermissions(memberId, permissions) {
    await updateDoc(doc(db, "pregnancyMembers", memberId), { permissions });
  }

  return (
    <MembersContext.Provider value={{
      members, loading, ROLE_LABELS, DEFAULT_PERMISSIONS,
      createInvite, acceptInvite, updateMember, removeMember, updatePermissions,
    }}>
      {children}
    </MembersContext.Provider>
  );
}

export function useMembers() {
  return useContext(MembersContext);
}
