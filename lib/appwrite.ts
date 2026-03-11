import {
  getAppwriteAccount,
  getAppwriteDatabases,
  getAppwriteStorage,
  getAppwriteConfig,
} from './appwrite-client'
import { ID } from 'appwrite'

// Types
export interface User {
  uid: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
  displayName?: string
  role: 'admin' | 'user'
  createdAt: string
}

export interface Question {
  text: string
  options: string[]
  correctIndex: number
  explanation: string
  videoAnswer?: string
  imageAnswer?: string
}

export interface Test {
  id: string
  title: string
  description: string
  durationMinutes: number
  createdAt: string
  questions: Record<string, Question>
}

export interface Progress {
  userId: string
  testId: string
  startAt: string
  lastUpdated: string
  answers: Record<string, Answer>
}

export interface Answer {
  status: 'answered' | 'skipped'
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

// Authentication functions
export const createUserWithEmailAndPasswordExtended = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phoneNumber: string
): Promise<User> => {
  try {
    const account = await getAppwriteAccount()
    const databases = await getAppwriteDatabases()
    const config = getAppwriteConfig()

    // Create user in Appwrite Auth
    const appwriteUser = await account.create(ID.unique(), email, password)

    const userData: User = {
      uid: appwriteUser.$id,
      email: appwriteUser.email,
      firstName,
      lastName,
      phoneNumber,
      displayName: `${firstName} ${lastName}`,
      role: 'user',
      createdAt: new Date().toISOString(),
    }

    // Save additional user data to database
    await databases.createDocument(
      config.databaseId,
      'users',
      appwriteUser.$id,
      userData
    )

    return userData
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export const signInWithEmailAndPasswordExtended = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const account = await getAppwriteAccount()
    const databases = await getAppwriteDatabases()
    const config = getAppwriteConfig()

    // Create session in Appwrite Auth
    await account.createEmailPasswordSession(email, password)

    // Get current user
    const appwriteUser = await account.get()

    // Get user data from database
    const userDoc = await databases.getDocument(
      config.databaseId,
      'users',
      appwriteUser.$id
    )

    return userDoc as User
  } catch (error) {
    console.error('Error signing in:', error)
    throw error
  }
}

export const getUserData = async (uid: string): Promise<User | null> => {
  try {
    const databases = await getAppwriteDatabases()
    const config = getAppwriteConfig()

    const userDoc = await databases.getDocument(
      config.databaseId,
      'users',
      uid
    )

    return userDoc as User
  } catch (error) {
    console.error('Error getting user data:', error)
    return null
  }
}

export const signOutUser = async (): Promise<void> => {
  try {
    const account = await getAppwriteAccount()
    await account.deleteSession('current')
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

// Test management functions
export const getTests = async (): Promise<Test[]> => {
  try {
    const databases = await getAppwriteDatabases()
    const config = getAppwriteConfig()

    const response = await databases.listDocuments(config.databaseId, 'tests')

    return response.documents.map((doc) => ({
      id: doc.$id,
      ...doc,
    })) as Test[]
  } catch (error) {
    console.error('Error getting tests:', error)
    return []
  }
}

export const getTest = async (id: string): Promise<Test | null> => {
  try {
    const databases = await getAppwriteDatabases()
    const config = getAppwriteConfig()

    const testDoc = await databases.getDocument(
      config.databaseId,
      'tests',
      id
    )

    return {
      id: testDoc.$id,
      ...testDoc,
    } as Test
  } catch (error) {
    console.error('Error getting test:', error)
    return null
  }
}

export const createTest = async (test: Omit<Test, 'id'>): Promise<string> => {
  try {
    const databases = await getAppwriteDatabases()
    const config = getAppwriteConfig()

    const docRef = await databases.createDocument(
      config.databaseId,
      'tests',
      ID.unique(),
      test
    )

    return docRef.$id
  } catch (error) {
    console.error('Error creating test:', error)
    throw error
  }
}

export const updateTest = async (id: string, test: Partial<Test>): Promise<void> => {
  try {
    const databases = await getAppwriteDatabases()
    const config = getAppwriteConfig()

    await databases.updateDocument(config.databaseId, 'tests', id, test)
  } catch (error) {
    console.error('Error updating test:', error)
    throw error
  }
}

export const deleteTest = async (id: string): Promise<void> => {
  try {
    const databases = await getAppwriteDatabases()
    const config = getAppwriteConfig()

    await databases.deleteDocument(config.databaseId, 'tests', id)
  } catch (error) {
    console.error('Error deleting test:', error)
    throw error
  }
}

// Progress and Results functions
export const saveProgress = async (progressData: Progress): Promise<void> => {
  try {
    const databases = await getAppwriteDatabases()
    const config = getAppwriteConfig()

    const progressId = `${progressData.userId}_${progressData.testId}`

    // Check if progress already exists
    try {
      await databases.getDocument(config.databaseId, 'progress', progressId)
      // Update existing
      await databases.updateDocument(
        config.databaseId,
        'progress',
        progressId,
        progressData
      )
    } catch {
      // Create new
      await databases.createDocument(
        config.databaseId,
        'progress',
        progressId,
        progressData
      )
    }
  } catch (error) {
    console.error('Error saving progress:', error)
    throw error
  }
}

export const getProgress = async (
  userId: string,
  testId: string
): Promise<Progress | null> => {
  try {
    const databases = await getAppwriteDatabases()
    const config = getAppwriteConfig()

    const progressId = `${userId}_${testId}`
    const progressDoc = await databases.getDocument(
      config.databaseId,
      'progress',
      progressId
    )

    return progressDoc as Progress
  } catch (error) {
    console.error('Error getting progress:', error)
    return null
  }
}

export const saveResult = async (resultData: Result): Promise<void> => {
  try {
    const databases = await getAppwriteDatabases()
    const config = getAppwriteConfig()

    await databases.createDocument(
      config.databaseId,
      'results',
      ID.unique(),
      resultData
    )
  } catch (error) {
    console.error('Error saving result:', error)
    throw error
  }
}

export const getResults = async (userId?: string): Promise<Result[]> => {
  try {
    const databases = await getAppwriteDatabases()
    const config = getAppwriteConfig()

    let response

    if (userId) {
      response = await databases.listDocuments(
        config.databaseId,
        'results',
        [
          // Add query filter for userId if Appwrite supports it
        ]
      )
      // Filter results manually
      return response.documents.filter((doc) => doc.userId === userId) as Result[]
    }

    response = await databases.listDocuments(config.databaseId, 'results')
    return response.documents as Result[]
  } catch (error) {
    console.error('Error getting results:', error)
    return []
  }
}

// Image upload function for answer images
export const uploadAnswerImage = async (file: File): Promise<string> => {
  try {
    const storage = await getAppwriteStorage()
    const config = getAppwriteConfig()

    const fileId = ID.unique()
    const response = await storage.createFile(config.bucketId, fileId, file)

    // Return the URL to access the file
    return `${config.endpoint}/storage/buckets/${config.bucketId}/files/${response.$id}/preview?project=${config.projectId}`
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

// Get current authenticated user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const account = await getAppwriteAccount()
    const appwriteUser = await account.get()
    return await getUserData(appwriteUser.$id)
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}
