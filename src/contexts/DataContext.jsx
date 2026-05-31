import { createContext, useContext, useEffect, useState } from "react";
import {
  collection, doc, onSnapshot, addDoc, setDoc, updateDoc,
  deleteDoc, query, orderBy, serverTimestamp, writeBatch, getDocs, increment,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { usePregnancy } from "./PregnancyContext";

const DataContext = createContext(null);

const uid = () => Math.random().toString(36).slice(2, 9);
const tod = () => new Date().toISOString().split("T")[0];

// Lê dados do localStorage legado e limpa após migrar
function readLegacy(key, def) {
  try {
    const s = localStorage.getItem(key);
    return s != null ? JSON.parse(s) : def;
  } catch { return def; }
}

export function DataProvider({ children }) {
  const { pregnancy } = usePregnancy();
  const pid = pregnancy?.id;

  const [diary, setDiary] = useState([]);
  const [kicks, setKicks] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [medications, setMedications] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [layette, setLayette] = useState([]);
  const [songs, setSongs] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [ready, setReady] = useState(false);

  // ─── Firestore listeners ──────────────────────────────────────────────
  useEffect(() => {
    if (!pid) { setReady(true); return; }

    const unsubs = [];

    // Diary
    unsubs.push(onSnapshot(
      query(collection(db, "pregnancies", pid, "diary"), orderBy("date", "desc")),
      snap => setDiary(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    ));

    // Kicks — documento único com { "2024-01-01": 5, ... }
    unsubs.push(onSnapshot(
      doc(db, "pregnancies", pid, "kicks", "daily"),
      snap => setKicks(snap.exists() ? snap.data() : {})
    ));

    // Appointments
    unsubs.push(onSnapshot(
      query(collection(db, "pregnancies", pid, "appointments"), orderBy("date", "desc")),
      snap => setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    ));

    // Medications
    unsubs.push(onSnapshot(
      collection(db, "pregnancies", pid, "medications"),
      snap => setMedications(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    ));

    // Symptoms
    unsubs.push(onSnapshot(
      query(collection(db, "pregnancies", pid, "symptoms"), orderBy("date", "desc")),
      snap => setSymptoms(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    ));

    // Layette
    unsubs.push(onSnapshot(
      collection(db, "pregnancies", pid, "layette"),
      snap => setLayette(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    ));

    // Songs
    unsubs.push(onSnapshot(
      collection(db, "pregnancies", pid, "songs"),
      snap => setSongs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    ));

    // Photos
    unsubs.push(onSnapshot(
      query(collection(db, "pregnancies", pid, "photos"), orderBy("date", "desc")),
      snap => setPhotos(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    ));

    // Aguarda todos os listeners iniciarem e depois migra localStorage se necessário
    setTimeout(() => {
      migrateFromLocalStorage(pid);
      setReady(true);
    }, 800);

    return () => unsubs.forEach(u => u());
  }, [pid]);

  // ─── Migração do localStorage ─────────────────────────────────────────
  async function migrateFromLocalStorage(pregnancyId) {
    const migrated = localStorage.getItem("bg-migrated-" + pregnancyId);
    if (migrated) return;

    const batch = writeBatch(db);
    let hasData = false;

    // Diary
    const legacyDiary = readLegacy("bg-diary", []);
    for (const e of legacyDiary) {
      const ref = doc(collection(db, "pregnancies", pregnancyId, "diary"));
      batch.set(ref, { date: e.date, week: e.week, mood: e.mood ?? null, text: e.text ?? "", createdAt: serverTimestamp() });
      hasData = true;
    }

    // Kicks
    const legacyKicks = readLegacy("bg-kicks", {});
    if (Object.keys(legacyKicks).length > 0) {
      batch.set(doc(db, "pregnancies", pregnancyId, "kicks", "daily"), legacyKicks, { merge: true });
      hasData = true;
    }

    // Appointments
    const legacyCons = readLegacy("bg-cons", []);
    for (const c of legacyCons) {
      const ref = doc(collection(db, "pregnancies", pregnancyId, "appointments"));
      batch.set(ref, { date: c.date, doctor: c.doc, type: c.type, notes: c.notes ?? "", createdAt: serverTimestamp() });
      hasData = true;
    }

    // Medications
    const legacyMeds = readLegacy("bg-meds", []);
    for (const m of legacyMeds) {
      const ref = doc(collection(db, "pregnancies", pregnancyId, "medications"));
      batch.set(ref, { name: m.name, dose: m.dose ?? "", time: m.time ?? "", createdAt: serverTimestamp() });
      hasData = true;
    }

    // Symptoms
    const legacySyms = readLegacy("bg-syms", []);
    for (const s of legacySyms) {
      const ref = doc(collection(db, "pregnancies", pregnancyId, "symptoms"));
      batch.set(ref, { date: s.date, items: s.items ?? [], notes: s.notes ?? "", createdAt: serverTimestamp() });
      hasData = true;
    }

    // Layette
    const DEF_ENV = readLegacy("bg-env", []);
    for (const item of DEF_ENV) {
      const ref = doc(db, "pregnancies", pregnancyId, "layette", String(item.id));
      batch.set(ref, { cat: item.cat, n: item.n, done: item.done });
      hasData = true;
    }

    // Songs
    const legacySongs = readLegacy("bg-songs", []);
    for (const s of legacySongs) {
      const ref = doc(collection(db, "pregnancies", pregnancyId, "songs"));
      batch.set(ref, { title: s.title, artist: s.artist ?? "" });
      hasData = true;
    }

    // Photos
    const legacyPhotos = readLegacy("bg-photos", []);
    for (const p of legacyPhotos) {
      const ref = doc(collection(db, "pregnancies", pregnancyId, "photos"));
      batch.set(ref, { url: p.url, week: p.week, date: p.date, caption: p.caption ?? "" });
      hasData = true;
    }

    if (hasData) {
      await batch.commit();
      console.log("✅ Dados migrados do localStorage para o Firestore");
    }

    localStorage.setItem("bg-migrated-" + pregnancyId, "1");
  }

  // ─── CRUD Diary ──────────────────────────────────────────────────────
  async function addDiaryEntry({ mood, text, week }) {
    await addDoc(collection(db, "pregnancies", pid, "diary"), {
      date: tod(), week: week ?? "—", mood: mood ?? null,
      text: text ?? "", createdAt: serverTimestamp(),
    });
  }
  async function deleteDiaryEntry(id) {
    await deleteDoc(doc(db, "pregnancies", pid, "diary", id));
  }

  // ─── CRUD Kicks ──────────────────────────────────────────────────────
  async function addKick(date) {
    // increment() é atômico no servidor — não perde toques simultâneos
    await setDoc(doc(db, "pregnancies", pid, "kicks", "daily"),
      { [date]: increment(1) }, { merge: true });
  }
  async function resetKicks(date) {
    await setDoc(doc(db, "pregnancies", pid, "kicks", "daily"),
      { [date]: 0 }, { merge: true });
  }

  // ─── CRUD Appointments ───────────────────────────────────────────────
  async function addAppointment({ date, doctor, type, notes }) {
    await addDoc(collection(db, "pregnancies", pid, "appointments"), {
      date, doctor, type, notes: notes ?? "", createdAt: serverTimestamp(),
    });
  }
  async function deleteAppointment(id) {
    await deleteDoc(doc(db, "pregnancies", pid, "appointments", id));
  }

  // ─── CRUD Medications ────────────────────────────────────────────────
  async function addMedication({ name, dose, time }) {
    await addDoc(collection(db, "pregnancies", pid, "medications"), {
      name, dose: dose ?? "", time: time ?? "", createdAt: serverTimestamp(),
    });
  }
  async function deleteMedication(id) {
    await deleteDoc(doc(db, "pregnancies", pid, "medications", id));
  }

  // ─── CRUD Symptoms ───────────────────────────────────────────────────
  async function addSymptom({ items, notes }) {
    await addDoc(collection(db, "pregnancies", pid, "symptoms"), {
      date: tod(), items: items ?? [], notes: notes ?? "", createdAt: serverTimestamp(),
    });
  }
  async function deleteSymptom(id) {
    await deleteDoc(doc(db, "pregnancies", pid, "symptoms", id));
  }

  // ─── CRUD Layette ────────────────────────────────────────────────────
  async function addLayetteItem({ cat, n }) {
    const ref = doc(collection(db, "pregnancies", pid, "layette"));
    await setDoc(ref, { cat, n, done: false });
  }
  async function toggleLayetteItem(id, done) {
    await updateDoc(doc(db, "pregnancies", pid, "layette", id), { done });
  }
  async function deleteLayetteItem(id) {
    await deleteDoc(doc(db, "pregnancies", pid, "layette", id));
  }

  // ─── CRUD Songs ──────────────────────────────────────────────────────
  async function addSong({ title, artist, url }) {
    await addDoc(collection(db, "pregnancies", pid, "songs"), {
      title: title ?? "", artist: artist ?? "", url: url ?? "",
      addedBy: auth.currentUser?.uid ?? null,
      addedByName: auth.currentUser?.displayName ?? "",
      createdAt: serverTimestamp(),
    });
  }
  async function deleteSong(id) {
    await deleteDoc(doc(db, "pregnancies", pid, "songs", id));
  }

  // ─── CRUD Photos ─────────────────────────────────────────────────────
  async function addPhoto({ url, week, caption }) {
    await addDoc(collection(db, "pregnancies", pid, "photos"), {
      url, week: week ?? "—", caption: caption ?? "", date: tod(),
    });
  }
  async function deletePhoto(id) {
    await deleteDoc(doc(db, "pregnancies", pid, "photos", id));
  }

  // ─── Exclusão total dos dados da gestação (LGPD) ─────────────────────
  async function deleteAllPregnancyData(pregnancyId) {
    const targetId = pregnancyId || pid;
    if (!targetId) return;
    const subs = [
      "diary", "kicks", "appointments", "medications", "symptoms",
      "layette", "songs", "photos", "contractions", "tips",
      "birthPlan", "birthEvents", "birthSession",
    ];
    for (const sub of subs) {
      try {
        const snap = await getDocs(collection(db, "pregnancies", targetId, sub));
        // apaga em lotes de 400
        let batch = writeBatch(db);
        let n = 0;
        for (const d of snap.docs) {
          batch.delete(d.ref);
          if (++n >= 400) { await batch.commit(); batch = writeBatch(db); n = 0; }
        }
        if (n > 0) await batch.commit();
      } catch (e) { console.error("delete sub", sub, e); }
    }
    // apaga a gestação em si
    try { await deleteDoc(doc(db, "pregnancies", targetId)); } catch (e) { console.error("delete preg", e); }
    // limpa flag de migração local
    localStorage.removeItem("bg-migrated-" + targetId);
  }

  return (
    <DataContext.Provider value={{
      ready,
      diary, addDiaryEntry, deleteDiaryEntry,
      kicks, addKick, resetKicks,
      appointments, addAppointment, deleteAppointment,
      medications, addMedication, deleteMedication,
      symptoms, addSymptom, deleteSymptom,
      layette, addLayetteItem, toggleLayetteItem, deleteLayetteItem,
      songs, addSong, deleteSong,
      photos, addPhoto, deletePhoto,
      deleteAllPregnancyData,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
