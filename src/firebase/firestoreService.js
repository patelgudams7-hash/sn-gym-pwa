// ─── Firestore Service ────────────────────────────────────────────────────────
// All database operations for SN Gym.
// Data structure (per user):
//   users/{uid}/profile          <- document
//   users/{uid}/plans/           <- subcollection
//   users/{uid}/history/         <- subcollection
//   users/{uid}/measurements/    <- subcollection
//   users/{uid}/goals/           <- subcollection
//   users/{uid}/dietPlan/        <- subcollection (docs keyed by 'YYYY-MM-DD')
//   users/{uid}/docs/weeklyDiet  <- document
//   users/{uid}/docs/settings    <- document (routineSchedule, fastingState, etc.)

import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./config";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const userRef = (uid) => doc(db, "users", uid);
const subColRef = (uid, col) => collection(db, "users", uid, col);
const subDocRef = (uid, col, docId) => doc(db, "users", uid, col, docId);

async function getSubCollection(uid, col) {
  const snap = await getDocs(subColRef(uid, col));
  return snap.docs.map((d) => ({ _id: d.id, ...d.data() }));
}

// ─── Load all user data on login ──────────────────────────────────────────────

export async function loadUserData(uid) {
  try {
    const [
      profileSnap,
      weeklyDietSnap,
      settingsSnap,
      plans,
      history,
      measurements,
      goals,
      dietPlan
    ] = await Promise.all([
      getDoc(userRef(uid)),
      getDoc(subDocRef(uid, "docs", "weeklyDiet")),
      getDoc(subDocRef(uid, "docs", "settings")),
      getSubCollection(uid, "plans"),
      getSubCollection(uid, "history"),
      getSubCollection(uid, "measurements"),
      getSubCollection(uid, "goals"),
      getSubCollection(uid, "dietPlan")
    ]);

    // Convert dietPlan subcollection docs (keyed by date) into the flat object GymContext expects
    const dietPlanMap = {};
    dietPlan.forEach((d) => {
      const { _id, ...rest } = d;
      dietPlanMap[_id] = rest;
    });

    return {
      profile: profileSnap.exists() ? profileSnap.data() : null,
      weeklyDiet: weeklyDietSnap.exists() ? weeklyDietSnap.data() : null,
      settings: settingsSnap.exists() ? settingsSnap.data() : null,
      plans: plans.map(({ _id, ...rest }) => ({ id: _id, ...rest })),
      history: history.map(({ _id, ...rest }) => ({ id: _id, ...rest })),
      measurements: measurements.map(({ _id, ...rest }) => ({ date: _id, ...rest })),
      goals: goals.map(({ _id, ...rest }) => ({ id: _id, ...rest })),
      dietPlan: dietPlanMap
    };
  } catch (err) {
    console.error("[Firestore] loadUserData error:", err);
    return null;
  }
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function saveProfile(uid, profile) {
  try {
    await setDoc(userRef(uid), { ...profile, updatedAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.error("[Firestore] saveProfile error:", err);
  }
}

// ─── Plans ────────────────────────────────────────────────────────────────────

export async function savePlanFS(uid, plan) {
  try {
    const { id, ...data } = plan;
    await setDoc(subDocRef(uid, "plans", id), { ...data, updatedAt: serverTimestamp() });
  } catch (err) {
    console.error("[Firestore] savePlan error:", err);
  }
}

export async function deletePlanFS(uid, planId) {
  try {
    await deleteDoc(subDocRef(uid, "plans", planId));
  } catch (err) {
    console.error("[Firestore] deletePlan error:", err);
  }
}

// ─── Workout History ──────────────────────────────────────────────────────────

export async function saveWorkoutHistory(uid, entry) {
  try {
    const { id, ...data } = entry;
    await setDoc(subDocRef(uid, "history", id), { ...data, savedAt: serverTimestamp() });
  } catch (err) {
    console.error("[Firestore] saveWorkoutHistory error:", err);
  }
}

// ─── Measurements ─────────────────────────────────────────────────────────────

export async function saveMeasurement(uid, entry) {
  // Use date as doc ID so there is only one entry per day (upsert)
  try {
    const { date, ...data } = entry;
    await setDoc(
      subDocRef(uid, "measurements", date),
      { ...data, date, savedAt: serverTimestamp() }
    );
  } catch (err) {
    console.error("[Firestore] saveMeasurement error:", err);
  }
}

// ─── Goals ────────────────────────────────────────────────────────────────────

export async function saveGoalFS(uid, goal) {
  try {
    const { id, ...data } = goal;
    await setDoc(subDocRef(uid, "goals", id), { ...data, updatedAt: serverTimestamp() });
  } catch (err) {
    console.error("[Firestore] saveGoal error:", err);
  }
}

export async function deleteGoalFS(uid, goalId) {
  try {
    await deleteDoc(subDocRef(uid, "goals", goalId));
  } catch (err) {
    console.error("[Firestore] deleteGoal error:", err);
  }
}

// ─── Diet — Daily Log ─────────────────────────────────────────────────────────
// The full day object is saved as one doc per date key (e.g., "2026-06-29")

export async function saveDietDay(uid, dateKey, dayData) {
  try {
    await setDoc(
      subDocRef(uid, "dietPlan", dateKey),
      { ...dayData, updatedAt: serverTimestamp() }
    );
  } catch (err) {
    console.error("[Firestore] saveDietDay error:", err);
  }
}

// ─── Diet — Weekly Schedule ───────────────────────────────────────────────────

export async function saveWeeklyDiet(uid, schedule) {
  try {
    await setDoc(
      subDocRef(uid, "docs", "weeklyDiet"),
      { ...schedule, updatedAt: serverTimestamp() }
    );
  } catch (err) {
    console.error("[Firestore] saveWeeklyDiet error:", err);
  }
}

// ─── Settings (routineSchedule, fastingState, anthropicKey) ──────────────────

export async function saveSettings(uid, settings) {
  try {
    await setDoc(
      subDocRef(uid, "docs", "settings"),
      { ...settings, updatedAt: serverTimestamp() },
      { merge: true }
    );
  } catch (err) {
    console.error("[Firestore] saveSettings error:", err);
  }
}

// ─── First-time user bootstrap ────────────────────────────────────────────────
// Called when a brand-new user has no Firestore data yet.
// Pushes all current localStorage state up so nothing is lost.

export async function bootstrapNewUser(uid, gymState) {
  try {
    const {
      profile,
      plans,
      history,
      measurements,
      goals,
      dietPlan,
      weeklyDietSchedule,
      routineSchedule,
      fastingState,
      anthropicKey
    } = gymState;

    const writes = [
      setDoc(userRef(uid), { ...profile, updatedAt: serverTimestamp() }, { merge: true }),
      setDoc(subDocRef(uid, "docs", "weeklyDiet"), {
        ...weeklyDietSchedule,
        updatedAt: serverTimestamp()
      }),
      setDoc(subDocRef(uid, "docs", "settings"), {
        routineSchedule,
        fastingState,
        anthropicKey,
        updatedAt: serverTimestamp()
      })
    ];

    plans.forEach((p) => {
      const { id, ...data } = p;
      writes.push(
        setDoc(subDocRef(uid, "plans", id), { ...data, updatedAt: serverTimestamp() })
      );
    });

    history.forEach((h) => {
      const { id, ...data } = h;
      writes.push(
        setDoc(subDocRef(uid, "history", id), { ...data, savedAt: serverTimestamp() })
      );
    });

    measurements.forEach((m) => {
      const { date, ...data } = m;
      writes.push(
        setDoc(subDocRef(uid, "measurements", date), {
          ...data,
          date,
          savedAt: serverTimestamp()
        })
      );
    });

    goals.forEach((g) => {
      const { id, ...data } = g;
      writes.push(
        setDoc(subDocRef(uid, "goals", id), { ...data, updatedAt: serverTimestamp() })
      );
    });

    Object.entries(dietPlan).forEach(([dateKey, dayData]) => {
      writes.push(
        setDoc(subDocRef(uid, "dietPlan", dateKey), {
          ...dayData,
          updatedAt: serverTimestamp()
        })
      );
    });

    await Promise.all(writes);
    console.log("[Firestore] Bootstrap complete for uid:", uid);
    return true;
  } catch (err) {
    console.error("[Firestore] bootstrapNewUser error:", err);
    return false;
  }
}
