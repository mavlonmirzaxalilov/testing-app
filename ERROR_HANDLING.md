# Comprehensive Registration Error Handling

## Overview

This document describes the comprehensive error handling system implemented for the user registration process. The system provides user-friendly error messages in Uzbek, detailed error logging for debugging, and a seamless retry mechanism without requiring page refresh.

## Components

### 1. Error Handler Utility (`lib/error-handler.ts`)

The core utility module that manages all error-related operations.

**Key Features:**
- **Error Categorization**: Automatically categorizes errors into 6 types:
  - `EMAIL_ALREADY_EXISTS`: User tries to register with an existing email
  - `INVALID_EMAIL`: Email format is incorrect
  - `WEAK_PASSWORD`: Password doesn't meet requirements
  - `NETWORK_ERROR`: Connection/timeout issues
  - `SERVER_ERROR`: 5xx server errors
  - `UNKNOWN_ERROR`: Unclassified errors

- **User-Friendly Messages**: All error messages are in Uzbek language with helpful guidance

- **Error Logging**: Structured logging with timestamps, error details, and user agent information

- **Retry Determination**: Automatically determines if an error is retryable

**Main Functions:**
```typescript
categorizeError(error: unknown): ErrorCategory
createRegistrationError(error: unknown, category?: ErrorCategory): RegistrationError
logRegistrationError(error: RegistrationError): void
isRetryable(category: ErrorCategory): boolean
getErrorSeverity(category: ErrorCategory): 'error' | 'warning' | 'info'
```

### 2. Registration Error Component (`components/registration-error.tsx`)

A React component that displays registration errors with a professional UI.

**Features:**
- **Main Error Display**: Shows prominent error message "Qayta ko'rib chiq ro'yxatdan o'tishda xatolik yuz berdi"
- **Expandable Details**: Users can expand to see technical error details
- **Color-Coded Severity**: Different colors for error, warning, and info severity levels
- **Retry Button**: One-click retry mechanism for retryable errors
- **Helpful Tips**: Context-specific suggestions (e.g., "Check your internet connection")
- **Accessible**: Proper ARIA labels and semantic HTML

**Props:**
```typescript
interface RegistrationErrorProps {
  error: RegistrationError | null
  onRetry: () => void
  isRetrying?: boolean
}
```

### 3. Updated Signup Page (`app/auth/signup/page.tsx`)

Enhanced registration page with comprehensive error handling.

**Features:**
- **Validation Errors**: Separate handling for client-side validation errors
- **Registration Errors**: Detailed Appwrite-specific error handling
- **Retry Mechanism**: Users can retry failed registrations without page refresh
- **Error State Management**: Proper state management for errors and loading states
- **Form Preservation**: Form data is preserved during retry attempts

**Key Methods:**
```typescript
validateForm(): boolean  // Client-side validation
handleSubmit(e: React.FormEvent): Promise<void>  // Submit handler
handleRetry(): Promise<void>  // Retry handler
```

### 4. Enhanced Appwrite Functions (`lib/appwrite.ts`)

Updated authentication functions with structured error handling.

**Changes:**
- Wrapped error handling with `createRegistrationError()`
- Structured error logging with detailed information
- Re-throws errors as `RegistrationError` objects for UI consumption

```typescript
createUserWithEmailAndPasswordExtended(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phoneNumber: string
): Promise<User>

createRegistrationErrorFromAppwrite(error: unknown): RegistrationError
```

## Error Flow Diagram

```
User Submits Form
    ↓
Validate Form (Client-Side)
    ├─ Invalid → Show Validation Error
    └─ Valid → Send to Appwrite
    ↓
Appwrite Registration
    ├─ Success → Redirect to Home
    └─ Error → Categorize & Create RegistrationError
    ↓
Log Error Details (Development Only)
    ↓
Display RegistrationErrorDisplay Component
    ├─ Show Main Error Message
    ├─ Show Error Details (Expandable)
    ├─ Show Helpful Tips
    └─ Show Retry Button (if retryable)
    ↓
User Clicks Retry
    └─ Attempt Registration Again
```

## Error Message Examples

### Email Already Exists
```
Title: "Qayta ko'rib chiq ro'yxatdan o'tishda xatolik yuz berdi"
Message: "Bu elektron pochta manzili allaqachon ro'yxatga olingan. Boshqa elektron pochta manzilidan foydalaning yoki "Kirish" tugmasini bosing."
Severity: INFO (Blue)
Retryable: No
Tip: "Tizimga kirish" sahifasida mavjud akkauntingizdan foydalanib kiring..."
```

### Network Error
```
Title: "Qayta ko'rib chiq ro'yxatdan o'tishda xatolik yuz berdi"
Message: "Internet aloqasi muammosi. Iltimos, internet ulanishini tekshiring va qayta urinib ko'ring."
Severity: WARNING (Amber)
Retryable: Yes
Tip: "Internet ulanishini tekshiring va qayta urining."
```

### Weak Password
```
Title: "Qayta ko'rib chiq ro'yxatdan o'tishda xatolik yuz berdi"
Message: "Parol juda oson. Iltimos, kamita 8 ta belgi, raqam va maxsus belgini o'z ichiga olgan parol kiriting."
Severity: ERROR (Red)
Retryable: No
```

## Retry Mechanism

The retry mechanism allows users to attempt registration again without:
- **Page refresh**: Form state is preserved
- **Data loss**: All entered information remains in the form
- **Re-validation**: Form validation runs before each retry attempt
- **Loading states**: Loading spinner shows during retry

### Retry Flow
```
Initial Error
    ↓
Display Error Component with Retry Button
    ↓
User Clicks Retry Button
    ↓
Clear Error State
    ↓
Validate Form Again
    ↓
Attempt Registration
    ├─ Success → Redirect to Home
    └─ Error → Display New Error & Allow Retry Again
```

## Error Logging

### Development Environment
Errors are logged to the browser console with:
- Timestamp
- Error category
- User message
- Technical details
- User agent
- Current page URL

### Example Console Output
```
[Registration Error] {
  timestamp: "2024-03-11T10:30:45.123Z",
  category: "EMAIL_ALREADY_EXISTS",
  message: "Bu elektron pochta manzili allaqachon ro'yxatga olingan...",
  details: "User with email already exists",
  retryable: false,
  userAgent: "Mozilla/5.0...",
  url: "https://example.com/auth/signup"
}
```

### Production Environment
- Logs are stored locally in development mode
- Can be extended to send to external services (Sentry, LogRocket, etc.)
- See `createRegistrationError()` for integration points

## Usage Examples

### Basic Registration
```typescript
try {
  await signUp(email, password, firstName, lastName, phoneNumber)
  // User is authenticated and redirected
} catch (err) {
  // Error is automatically caught and displayed
  // User can retry without page refresh
}
```

### Manual Error Handling
```typescript
import { createRegistrationError, logRegistrationError } from '@/lib/error-handler'

try {
  // Some operation
} catch (err) {
  const registrationError = createRegistrationError(err)
  logRegistrationError(registrationError)
  // Handle error in UI
}
```

## Error Categories Reference

| Category | Message | Retryable | Severity | Common Causes |
|----------|---------|-----------|----------|---------------|
| EMAIL_ALREADY_EXISTS | "Bu elektron pochta..." | No | Info | User already registered |
| INVALID_EMAIL | "Elektron pochta manzili..." | No | Error | Email format incorrect |
| WEAK_PASSWORD | "Parol juda oson..." | No | Error | Password too short/weak |
| NETWORK_ERROR | "Internet aloqasi..." | Yes | Warning | Network timeout/failure |
| SERVER_ERROR | "Server muammosi..." | Yes | Warning | 5xx server errors |
| UNKNOWN_ERROR | "Ro'yxatdan o'tishda..." | Yes | Error | Unclassified errors |

## Styling & Design

### Color System
- **Error (Red)**: For validation and permanent errors
- **Warning (Amber)**: For transient errors (network, server)
- **Info (Blue)**: For non-blocking errors (email exists)

### Typography
- **Header**: Bold, 14px, error-colored
- **Message**: Regular, 14px, error-colored
- **Details**: Monospace, 12px, subtle styling
- **Tips**: Italic, 12px, slightly faded

### Animations
- Fade-in animation when error appears
- Spinning icon during retry
- Smooth transitions between states

## Testing

### Test Scenarios

1. **Email Already Exists**
   - Register with one email → Success
   - Try same email again → Should show info error with tip

2. **Network Error**
   - Disconnect internet → Register → Error with retry
   - Reconnect → Retry → Should succeed

3. **Weak Password**
   - Enter password < 6 chars → Should show validation error
   - Fix password → Should clear error

4. **Retry Mechanism**
   - Register with network error → Click retry → Should attempt again
   - Form data should be preserved between retries

## Future Enhancements

- [ ] Rate limiting to prevent brute force attempts
- [ ] Email verification before account creation
- [ ] Password strength indicator
- [ ] Integration with external error logging services
- [ ] Analytics tracking for error patterns
- [ ] Auto-retry with exponential backoff for network errors
- [ ] Support for additional languages

## API Reference

### RegistrationError Interface
```typescript
interface RegistrationError {
  category: ErrorCategory
  message: string
  details: string
  timestamp: string
  retryable: boolean
  originalError?: unknown
}
```

### ErrorCategory Enum
```typescript
enum ErrorCategory {
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  INVALID_EMAIL = 'INVALID_EMAIL',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}
```

## Troubleshooting

### Error Not Displaying
- Check that `RegistrationErrorDisplay` component is imported
- Verify error state is being set correctly
- Check browser console for any component errors

### Retry Not Working
- Ensure form validation passes
- Check that error's `retryable` property is `true`
- Verify network connection

### Custom Error Messages Not Showing
- Verify error category is correctly identified
- Check that error message is in `UZBEK_ERROR_MESSAGES` map
- Fall back to `UNKNOWN_ERROR` category if needed

## Support & Feedback

For issues or feature requests related to error handling, please contact the development team or create an issue in the project repository.
