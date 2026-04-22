import { Client, Account, Databases, Storage } from 'appwrite'

export const appwriteConfig = {
	endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT as string,
	projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string,
	databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
	usersCollectionId: process.env
		.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID as string,
	testsCollectionId: process.env
		.NEXT_PUBLIC_APPWRITE_TESTS_COLLECTION_ID as string,
	progressCollectionId: process.env
		.NEXT_PUBLIC_APPWRITE_PROGRESS_COLLECTION_ID as string,
	resultsCollectionId: process.env
		.NEXT_PUBLIC_APPWRITE_RESULTS_COLLECTION_ID as string,
	storageBucketId: process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID as string,
}

// appwrite-client.ts ga qo'shing
export const getFilePreviewUrl = (fileId: string): string => {
	return `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.storageBucketId}/files/${fileId}/view?project=${appwriteConfig.projectId}`
}
const createClient = () => {
	const client = new Client()
	client
		.setEndpoint(appwriteConfig.endpoint)
		.setProject(appwriteConfig.projectId)

	return client
}

// Singleton pattern: Har safar yangidan yaratmaslik uchun
class AppwriteService {
	public client: Client
	public account: Account
	public databases: Databases
	public storage: Storage

	constructor() {
		this.client = createClient()
		this.account = new Account(this.client)
		this.databases = new Databases(this.client)
		this.storage = new Storage(this.client)
	}
}

const appwriteService = new AppwriteService()

export const account = appwriteService.account
export const databases = appwriteService.databases
export const storage = appwriteService.storage
export const client = appwriteService.client
