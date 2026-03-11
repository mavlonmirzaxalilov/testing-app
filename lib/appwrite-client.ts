import { Client, Account, Databases, Storage } from 'appwrite'

let client: Client | null = null
let account: Account | null = null
let databases: Databases | null = null
let storage: Storage | null = null

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || ''
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || ''
const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || ''
const APPWRITE_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || ''

export const initializeAppwrite = async () => {
  if (typeof window === 'undefined') {
    throw new Error('Appwrite can only be initialized on the client side')
  }

  if (!client) {
    client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID)

    account = new Account(client)
    databases = new Databases(client)
    storage = new Storage(client)
  }

  return { client, account, databases, storage }
}

export const getAppwriteAccount = async () => {
  const { account } = await initializeAppwrite()
  return account
}

export const getAppwriteDatabases = async () => {
  const { databases } = await initializeAppwrite()
  return databases
}

export const getAppwriteStorage = async () => {
  const { storage } = await initializeAppwrite()
  return storage
}

export const getAppwriteConfig = () => ({
  endpoint: APPWRITE_ENDPOINT,
  projectId: APPWRITE_PROJECT_ID,
  databaseId: APPWRITE_DATABASE_ID,
  bucketId: APPWRITE_BUCKET_ID,
})
