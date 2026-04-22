import { ID, Query, Permission, Role } from 'appwrite'
import { account, appwriteConfig, databases, storage } from './appwrite-client'

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

export interface Test {
	id?: string
	title: string
	description: string
	durationMinutes: number
	createdAt: string
	questions: Record<string, Question> | string
}

export interface Question {
	text: string
	options: string[]
	correctIndex: number
	explanation: string
	explanationImageId?: string
	youtubeUrl?: string
}

export interface Progress {
	userId: string
	testId: string
	startAt: string
	lastUpdated: string
	answers: string
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

// --- YORDAMCHI FUNKSIYA: Rasm URL olish ---
// Bu funksiyani review.tsx va boshqa joylarda ham ishlating
export const getFileUrl = (fileId: string): string => {
	return `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.storageBucketId}/files/${fileId}/view?project=${appwriteConfig.projectId}`
}

// --- RASM YUKLASH ---
// Bu funksiyani create-test.tsx da chaqiring
export const uploadImage = async (file: File): Promise<string> => {
	const uploaded = await storage.createFile(
		appwriteConfig.storageBucketId,
		ID.unique(),
		file,
		[Permission.read(Role.any())], // ✅ Barcha userlar o'qiy olsin
	)
	return uploaded.$id
}

// --- AUTHENTICATION ---

export const createUserWithEmailAndPasswordExtended = async (
	email: string,
	password: string,
	firstName: string,
	lastName: string,
	phoneNumber: string,
): Promise<User> => {
	const userAccount = await account.create(
		ID.unique(),
		email,
		password,
		`${firstName} ${lastName}`,
	)

	const userData: User = {
		uid: userAccount.$id,
		email,
		firstName,
		lastName,
		phoneNumber,
		displayName: `${firstName} ${lastName}`,
		role: 'user',
		createdAt: new Date().toISOString(),
	}

	await databases.createDocument(
		appwriteConfig.databaseId,
		appwriteConfig.usersCollectionId,
		userAccount.$id,
		userData,
	)

	await account.createEmailPasswordSession(email, password)

	return userData
}

export const signInWithEmailAndPasswordExtended = async (
	email: string,
	password: string,
): Promise<User> => {
	try {
		await account.createEmailPasswordSession(email, password)
	} catch (error: any) {
		if (error.message.includes('session')) {
			// sessiya mavjud, davom etaveradi
		} else {
			throw error
		}
	}

	const currentUser = await account.get()

	const userDoc = await databases.getDocument(
		appwriteConfig.databaseId,
		appwriteConfig.usersCollectionId,
		currentUser.$id,
	)

	return {
		uid: userDoc.$id,
		email: userDoc.email,
		firstName: userDoc.firstName,
		lastName: userDoc.lastName,
		phoneNumber: userDoc.phoneNumber,
		displayName: userDoc.displayName,
		role: userDoc.role,
		createdAt: userDoc.createdAt,
	}
}

export const getUserData = async (uid: string): Promise<User | null> => {
	try {
		const userDoc = await databases.getDocument(
			appwriteConfig.databaseId,
			appwriteConfig.usersCollectionId,
			uid,
		)
		return userDoc as unknown as User
	} catch (error) {
		return null
	}
}

// ✅ TUZATILDI: xato bo'lsa ham silent o'tadi
export const signOutUser = async (): Promise<void> => {
	try {
		await account.deleteSession('current')
	} catch (error) {
		// Sessiya allaqachon yo'q bo'lsa ham davom etaversin
		console.warn('Sessiya allaqachon tugagan:', error)
	}
}

// --- TEST MANAGEMENT ---

export const getTests = async (): Promise<Test[]> => {
	const response = await databases.listDocuments(
		appwriteConfig.databaseId,
		appwriteConfig.testsCollectionId,
	)

	return response.documents.map(doc => ({
		id: doc.$id,
		title: doc.title,
		description: doc.description,
		durationMinutes: doc.durationMinutes,
		createdAt: doc.createdAt,
		questions:
			typeof doc.questions === 'string'
				? JSON.parse(doc.questions)
				: doc.questions,
	}))
}

export const getTest = async (id: string): Promise<Test | null> => {
	try {
		const doc = await databases.getDocument(
			appwriteConfig.databaseId,
			appwriteConfig.testsCollectionId,
			id,
		)
		return {
			id: doc.$id,
			title: doc.title,
			description: doc.description,
			durationMinutes: doc.durationMinutes,
			createdAt: doc.createdAt,
			questions:
				typeof doc.questions === 'string'
					? JSON.parse(doc.questions)
					: doc.questions,
		}
	} catch (error) {
		return null
	}
}

export const createTest = async (test: Omit<Test, 'id'>): Promise<string> => {
	const docRef = await databases.createDocument(
		appwriteConfig.databaseId,
		appwriteConfig.testsCollectionId,
		ID.unique(),
		{
			...test,
			questions: JSON.stringify(test.questions),
		},
	)
	return docRef.$id
}

export const updateTest = async (
	id: string,
	test: Partial<Test>,
): Promise<void> => {
	const updateData = { ...test }
	if (updateData.questions && typeof updateData.questions !== 'string') {
		updateData.questions = JSON.stringify(updateData.questions)
	}

	await databases.updateDocument(
		appwriteConfig.databaseId,
		appwriteConfig.testsCollectionId,
		id,
		updateData,
	)
}

export const deleteTest = async (id: string): Promise<void> => {
	await databases.deleteDocument(
		appwriteConfig.databaseId,
		appwriteConfig.testsCollectionId,
		id,
	)
}

// --- PROGRESS AND RESULTS ---

export const saveProgress = async (progressData: Progress): Promise<void> => {
	try {
		const existing = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.progressCollectionId,
			[
				Query.equal('userId', progressData.userId),
				Query.equal('testId', progressData.testId),
			],
		)

		const dataToSave = {
			...progressData,
			answers:
				typeof progressData.answers === 'object'
					? JSON.stringify(progressData.answers)
					: progressData.answers,
		}

		if (existing.total > 0) {
			await databases.updateDocument(
				appwriteConfig.databaseId,
				appwriteConfig.progressCollectionId,
				existing.documents[0].$id,
				dataToSave,
			)
		} else {
			await databases.createDocument(
				appwriteConfig.databaseId,
				appwriteConfig.progressCollectionId,
				ID.unique(),
				dataToSave,
			)
		}
	} catch (error) {
		console.error('SaveProgress Error:', error)
		throw error
	}
}

export const getProgress = async (
	userId: string,
	testId: string,
): Promise<Progress | null> => {
	try {
		const response = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.progressCollectionId,
			[Query.equal('userId', userId), Query.equal('testId', testId)],
		)

		if (response.total === 0) return null

		const doc = response.documents[0]
		return {
			userId: doc.userId,
			testId: doc.testId,
			startAt: doc.startAt,
			lastUpdated: doc.lastUpdated,
			answers:
				typeof doc.answers === 'string' ? JSON.parse(doc.answers) : doc.answers,
		} as Progress
	} catch (error) {
		return null
	}
}

export const saveResult = async (resultData: Result): Promise<void> => {
	try {
		await databases.createDocument(
			appwriteConfig.databaseId,
			appwriteConfig.resultsCollectionId,
			ID.unique(),
			resultData,
		)
	} catch (error: any) {
		console.error('Natijani saqlashda xato:', error)
		throw error
	}
}

export const getResults = async (userId?: string): Promise<Result[]> => {
	const queries = []
	if (userId) {
		queries.push(Query.equal('userId', userId))
	}

	const response = await databases.listDocuments(
		appwriteConfig.databaseId,
		appwriteConfig.resultsCollectionId,
		queries,
	)
	return response.documents as unknown as Result[]
}
