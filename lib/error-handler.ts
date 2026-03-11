export enum ErrorCategory {
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  INVALID_EMAIL = 'INVALID_EMAIL',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface RegistrationError {
  category: ErrorCategory
  message: string
  details: string
  timestamp: string
  retryable: boolean
  originalError?: unknown
}

const UZBEK_ERROR_MESSAGES: Record<ErrorCategory, string> = {
  [ErrorCategory.EMAIL_ALREADY_EXISTS]:
    'Bu elektron pochta manzili allaqachon ro\'yxatga olingan. Boshqa elektron pochta manzilidan foydalaning yoki "Kirish" tugmasini bosing.',
  [ErrorCategory.INVALID_EMAIL]:
    'Elektron pochta manzili noto\'g\'ri formatda. Iltimos, haqiqiy elektron pochta manzilini kiriting.',
  [ErrorCategory.WEAK_PASSWORD]:
    'Parol juda oson. Iltimos, kamida 8 ta belgi, raqam va maxsus belgini o\'z ichiga olgan parol kiriting.',
  [ErrorCategory.NETWORK_ERROR]:
    'Internet aloqasi muammosi. Iltimos, internet ulanishini tekshiring va qayta urinib ko\'ring.',
  [ErrorCategory.SERVER_ERROR]:
    'Server muammosi yuz berdi. Iltimos, bir necha daqiqadan keyin qayta urinib ko\'ring.',
  [ErrorCategory.UNKNOWN_ERROR]:
    'Ro\'yxatdan o\'tishda noma\'lum xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.',
}

export function categorizeError(error: unknown): ErrorCategory {
  const errorStr = String(error).toLowerCase()
  const message = (error as any)?.message?.toLowerCase() || ''
  const code = (error as any)?.code || ''

  // Email already exists
  if (
    errorStr.includes('email') &&
    (errorStr.includes('already') ||
      errorStr.includes('exists') ||
      errorStr.includes('unique') ||
      code.includes('user_exists'))
  ) {
    return ErrorCategory.EMAIL_ALREADY_EXISTS
  }

  // Invalid email format
  if (
    errorStr.includes('invalid') &&
    errorStr.includes('email') &&
    !errorStr.includes('already')
  ) {
    return ErrorCategory.INVALID_EMAIL
  }

  // Weak password
  if (
    errorStr.includes('password') &&
    (errorStr.includes('weak') ||
      errorStr.includes('strong') ||
      errorStr.includes('requirements') ||
      code.includes('password_'))
  ) {
    return ErrorCategory.WEAK_PASSWORD
  }

  // Network errors
  if (
    errorStr.includes('network') ||
    errorStr.includes('timeout') ||
    errorStr.includes('connection') ||
    errorStr.includes('econnrefused') ||
    message.includes('fetch')
  ) {
    return ErrorCategory.NETWORK_ERROR
  }

  // Server errors (5xx)
  if (
    (error as any)?.status >= 500 ||
    errorStr.includes('server') ||
    errorStr.includes('internal')
  ) {
    return ErrorCategory.SERVER_ERROR
  }

  return ErrorCategory.UNKNOWN_ERROR
}

export function createRegistrationError(
  error: unknown,
  category?: ErrorCategory
): RegistrationError {
  const determinedCategory = category || categorizeError(error)
  const userFriendlyMessage = UZBEK_ERROR_MESSAGES[determinedCategory]

  const details = extractErrorDetails(error)

  return {
    category: determinedCategory,
    message: userFriendlyMessage,
    details,
    timestamp: new Date().toISOString(),
    retryable: isRetryable(determinedCategory),
    originalError: error,
  }
}

function extractErrorDetails(error: unknown): string {
  if (!error) return 'No error details available'

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'object') {
    const appwriteError = error as any
    if (appwriteError.message) {
      return appwriteError.message
    }
    if (appwriteError.response?.message) {
      return appwriteError.response.message
    }
  }

  return String(error)
}

export function isRetryable(category: ErrorCategory): boolean {
  return [
    ErrorCategory.NETWORK_ERROR,
    ErrorCategory.SERVER_ERROR,
    ErrorCategory.UNKNOWN_ERROR,
  ].includes(category)
}

export function logRegistrationError(error: RegistrationError): void {
  const logEntry = {
    timestamp: error.timestamp,
    category: error.category,
    message: error.message,
    details: error.details,
    retryable: error.retryable,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[Registration Error]', logEntry)
  }

  // You can add additional logging services here (e.g., Sentry, LogRocket, etc.)
  // Example: logToExternalService(logEntry)
}

export function getErrorSeverity(
  category: ErrorCategory
): 'error' | 'warning' | 'info' {
  if (
    category === ErrorCategory.NETWORK_ERROR ||
    category === ErrorCategory.SERVER_ERROR
  ) {
    return 'warning'
  }
  if (category === ErrorCategory.EMAIL_ALREADY_EXISTS) {
    return 'info'
  }
  return 'error'
}
