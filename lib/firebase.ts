export interface User {
  uid: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
  displayName?: string
  role: "admin" | "user"
  createdAt: string
}

export interface Test {
  id: string
  title: string
  description: string
  durationMinutes: number
  createdAt: string
  questions: Record<string, Question>
}

export interface Question {
  text: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface Progress {
  userId: string
  testId: string
  startAt: string
  lastUpdated: string
  answers: Record<string, Answer>
}

export interface Answer {
  status: "answered" | "skipped"
  selectedIndex?: number
  answeredAt: string | null
}

export interface Result {
  userId: string
  testId: string
  score: number
  correctCount: number
  wrongCount: number
  skipped: string[]
  completedAt: string
}

export function getAuthInstance() {
  if (typeof window === "undefined") {
    throw new Error("Auth can only be used on the client side")
  }

  const { getFirebaseAuth } = require("@/lib/firebase-client")
  return getFirebaseAuth()  // bu yerda Auth obyekt qaytadi
}


export const getDbInstance = async () => {
  if (typeof window === "undefined") {
    throw new Error("Firestore can only be used on the client side")
  }

  const { getFirebaseDb } = await import("@/lib/firebase-client")
  return await getFirebaseDb()
}

export const createUserWithEmailAndPasswordExtended = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phoneNumber: string,
): Promise<User> => {
  const authInstance = await getAuthInstance()
  const dbInstance = await getDbInstance()
  const { createUserWithEmailAndPassword } = await import("firebase/auth")
  const { doc, setDoc } = await import("firebase/firestore")

  const userCredential = await createUserWithEmailAndPassword(authInstance, email, password)
  const firebaseUser = userCredential.user

  const userData: User = {
    uid: firebaseUser.uid,
    email: firebaseUser.email!,
    firstName,
    lastName,
    phoneNumber,
    displayName: `${firstName} ${lastName}`,
    role: "user",
    createdAt: new Date().toISOString(),
  }

  // Save additional user data to Firestore
  await setDoc(doc(dbInstance, "users", firebaseUser.uid), userData)

  return userData
}

export const signInWithEmailAndPasswordExtended = async (email: string, password: string): Promise<User> => {
  const authInstance = await getAuthInstance()
  const dbInstance = await getDbInstance()
  const { signInWithEmailAndPassword } = await import("firebase/auth")
  const { doc, getDoc } = await import("firebase/firestore")

  const userCredential = await signInWithEmailAndPassword(authInstance, email, password)
  const firebaseUser = userCredential.user

  // Get user data from Firestore
  const userDoc = await getDoc(doc(dbInstance, "users", firebaseUser.uid))
  if (userDoc.exists()) {
    return userDoc.data() as User
  } else {
    throw new Error("User data not found")
  }
}

export const getUserData = async (uid: string): Promise<User | null> => {
  const dbInstance = await getDbInstance()
  const { doc, getDoc } = await import("firebase/firestore")
  const userDoc = await getDoc(doc(dbInstance, "users", uid))
  return userDoc.exists() ? (userDoc.data() as User) : null
}

export const signOutUser = async (): Promise<void> => {
  const authInstance = await getAuthInstance()
  const { signOut } = await import("firebase/auth")
  await signOut(authInstance)
}

// Test management functions
export const getTests = async (): Promise<Test[]> => {
  const dbInstance = await getDbInstance()
  const { collection, getDocs } = await import("firebase/firestore")
  const testsCollection = collection(dbInstance, "tests")
  const testsSnapshot = await getDocs(testsCollection)
  return testsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Test)
}

export const getTest = async (id: string): Promise<Test | null> => {
  const dbInstance = await getDbInstance()
  const { doc, getDoc } = await import("firebase/firestore")
  const testDoc = await getDoc(doc(dbInstance, "tests", id))
  return testDoc.exists() ? ({ id: testDoc.id, ...testDoc.data() } as Test) : null
}

export const createTest = async (test: Omit<Test, "id">): Promise<string> => {
  const dbInstance = await getDbInstance()
  const { collection, addDoc } = await import("firebase/firestore")
  const docRef = await addDoc(collection(dbInstance, "tests"), test)
  return docRef.id
}

export const updateTest = async (id: string, test: Partial<Test>): Promise<void> => {
  const dbInstance = await getDbInstance()
  const { doc, updateDoc } = await import("firebase/firestore")
  await updateDoc(doc(dbInstance, "tests", id), test)
}

export const deleteTest = async (id: string): Promise<void> => {
  const dbInstance = await getDbInstance()
  const { doc, deleteDoc } = await import("firebase/firestore")
  await deleteDoc(doc(dbInstance, "tests", id))
}

// Progress and Results functions
export const saveProgress = async (progressData: Progress): Promise<void> => {
  const dbInstance = await getDbInstance()
  const { doc, setDoc } = await import("firebase/firestore")
  const progressId = `${progressData.userId}_${progressData.testId}`
  await setDoc(doc(dbInstance, "progress", progressId), progressData)
}

export const getProgress = async (userId: string, testId: string): Promise<Progress | null> => {
  const dbInstance = await getDbInstance()
  const { doc, getDoc } = await import("firebase/firestore")
  const progressId = `${userId}_${testId}`
  const progressDoc = await getDoc(doc(dbInstance, "progress", progressId))
  return progressDoc.exists() ? (progressDoc.data() as Progress) : null
}

export const saveResult = async (resultData: Result): Promise<void> => {
  const dbInstance = await getDbInstance()
  const { collection, addDoc } = await import("firebase/firestore")
  await addDoc(collection(dbInstance, "results"), resultData)
}

export const getResults = async (userId?: string): Promise<Result[]> => {
  const dbInstance = await getDbInstance()
  const { collection, getDocs, query, where } = await import("firebase/firestore")
  const resultsCollection = collection(dbInstance, "results")
  let resultsQuery = resultsCollection

  if (userId) {
    resultsQuery = query(resultsCollection, where("userId", "==", userId))
  }

  const resultsSnapshot = await getDocs(resultsQuery)
  return resultsSnapshot.docs.map((doc) => doc.data() as Result)
}
