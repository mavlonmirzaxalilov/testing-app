# Error Handling Quick Reference Guide

## 🚀 Quick Start

### Main Error Message (Always Shown)
```
"Qayta ko'rib chiq ro'yxatdan o'tishda xatolik yuz berdi"
(Please review - an error occurred during registration)
```

### Key Files
- **Error Logic**: `/lib/error-handler.ts`
- **Error Display**: `/components/registration-error.tsx`
- **Registration Page**: `/app/auth/signup/page.tsx`
- **Backend Auth**: `/lib/appwrite.ts`

## 📊 Error Types Cheat Sheet

| Error | Icon | Color | Retryable | User Message |
|-------|------|-------|-----------|--------------|
| Email Already Exists | ⚠️ | Blue | ❌ | "Bu elektron pochta manzili allaqachon ro'yxatga olingan..." |
| Invalid Email | ❌ | Red | ❌ | "Elektron pochta manzili noto'g'ri formatda..." |
| Weak Password | ❌ | Red | ❌ | "Parol juda oson..." |
| Network Error | ⚠️ | Amber | ✅ | "Internet aloqasi muammosi..." |
| Server Error | ⚠️ | Amber | ✅ | "Server muammosi yuz berdi..." |
| Unknown Error | ❌ | Red | ✅ | "Ro'yxatdan o'tishda noma'lum xatolik..." |

## 🎯 Component Usage

### Display Error in UI
```tsx
import { RegistrationErrorDisplay } from '@/components/registration-error'
import type { RegistrationError } from '@/lib/error-handler'

const [error, setError] = useState<RegistrationError | null>(null)

<RegistrationErrorDisplay
  error={error}
  onRetry={handleRetry}
  isRetrying={isRetrying}
/>
```

### Handle Registration Error
```tsx
try {
  await signUp(email, password, firstName, lastName, phoneNumber)
} catch (err: unknown) {
  if (err && typeof err === 'object' && 'category' in err) {
    setError(err as RegistrationError)
  }
}
```

### Retry Registration
```tsx
const handleRetry = async () => {
  setIsRetrying(true)
  try {
    await signUp(email, password, firstName, lastName, phoneNumber)
  } catch (err) {
    setError(err as RegistrationError)
  } finally {
    setIsRetrying(false)
  }
}
```

## 🔍 Error Properties

```typescript
interface RegistrationError {
  category: ErrorCategory          // Error type
  message: string                 // User-friendly message (Uzbek)
  details: string                 // Technical details
  timestamp: string               // ISO timestamp
  retryable: boolean             // Can user retry?
  originalError?: unknown        // Original error object
}
```

## 📝 Error Categories

```typescript
enum ErrorCategory {
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS'
  INVALID_EMAIL = 'INVALID_EMAIL'
  WEAK_PASSWORD = 'WEAK_PASSWORD'
  NETWORK_ERROR = 'NETWORK_ERROR'
  SERVER_ERROR = 'SERVER_ERROR'
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}
```

## 🛠️ Utility Functions

### Categorize Error Automatically
```typescript
import { categorizeError } from '@/lib/error-handler'

const category = categorizeError(error)
// Returns: EmailCategory
```

### Create Structured Error
```typescript
import { createRegistrationError } from '@/lib/error-handler'

const regError = createRegistrationError(error)
// Returns: RegistrationError object
```

### Log Error Details
```typescript
import { logRegistrationError } from '@/lib/error-handler'

logRegistrationError(regError)
// Logs to console in development
```

### Check If Retryable
```typescript
import { isRetryable } from '@/lib/error-handler'

if (isRetryable(error.category)) {
  // Show retry button
}
```

### Get UI Severity
```typescript
import { getErrorSeverity } from '@/lib/error-handler'

const severity = getErrorSeverity(error.category)
// Returns: 'error' | 'warning' | 'info'
```

## 🎨 Styling

### Color Scheme
```css
/* Error (Red) */
border: 1px solid rgb(220, 38, 38)
background: rgb(254, 242, 242)

/* Warning (Amber) */
border: 1px solid rgb(217, 119, 6)
background: rgb(254, 243, 235)

/* Info (Blue) */
border: 1px solid rgb(191, 219, 254)
background: rgb(239, 246, 255)
```

### Icon Components
- AlertCircle (error/warning indicator)
- ChevronDown/Up (expand/collapse details)
- RotateCcw (retry button icon)

## 📋 Form Validation Messages

```typescript
if (!firstName.trim()) 
  setValidationError('Ism kiritilishi shart')

if (!lastName.trim()) 
  setValidationError('Familiya kiritilishi shart')

if (!phoneNumber.trim()) 
  setValidationError('Telefon raqam kiritilishi shart')

if (password !== confirmPassword) 
  setValidationError('Parollar mos kelmaydi')

if (password.length < 6) 
  setValidationError("Parol kamida 6 ta belgidan iborat bo'lishi kerak")

if (!email.trim()) 
  setValidationError('Email kiritilishi shart')
```

## 🧪 Quick Testing

### Test Email Already Exists
1. Register with email: `test@example.com`
2. Try same email again → Blue error with no retry

### Test Network Error
1. Enable offline mode (DevTools)
2. Attempt registration → Amber error with retry button
3. Disable offline mode
4. Click "Qayta urini" → Should succeed

### Test Retry Mechanism
1. Trigger any retryable error
2. Fix the issue (e.g., reconnect internet)
3. Click retry button
4. Form data should be preserved

## 📱 Mobile Testing Checklist

- [ ] Error message readable on small screens
- [ ] Buttons are 44px+ tall (tap-able)
- [ ] Expandable details work
- [ ] Retry button functions
- [ ] No horizontal scroll needed
- [ ] Keyboard doesn't overlap error

## 🔐 Security Notes

✅ **Safe**: Error messages don't expose sensitive info
✅ **Safe**: Passwords never logged
✅ **Safe**: Tokens never logged
✅ **Safe**: Server details hidden from users
⚠️ **Note**: Technical details visible in expandable section (dev only)

## 🚨 Common Errors & Fixes

### Error Not Showing
**Check**: Is component imported?
```tsx
import { RegistrationErrorDisplay } from '@/components/registration-error'
```

### Retry Not Working
**Check**: Is error.retryable === true?
**Check**: Is handleRetry defined?
```tsx
const handleRetry = async () => { ... }
```

### Wrong Error Message
**Check**: Is error.category correct?
**Check**: Is error.message populated?
```tsx
console.log(error.category, error.message)
```

### Details Not Expandable
**Check**: Is error.details populated?
```tsx
console.log(error.details)
```

## 📊 Error Flow Diagram

```
User submits form
    ↓
Client validation
├─ Invalid → Show validation error
└─ Valid → Send to Appwrite
    ↓
Appwrite.register()
├─ Success → Redirect
└─ Error → Categorize & wrap
    ↓
createRegistrationError()
    ↓
logRegistrationError()
    ↓
Re-throw RegistrationError
    ↓
Signup page catches
    ↓
Display RegistrationErrorDisplay
    ├─ Show main message
    ├─ Show specific user message
    ├─ Show expandable details
    └─ Show retry button (if retryable)
```

## 🔗 Related Files

- **Auth Context**: `/contexts/auth-context.tsx`
- **UI Components**: `/components/ui/`
- **Appwrite Setup**: `/lib/appwrite-client.ts`
- **Documentation**: `/ERROR_HANDLING.md`
- **Examples**: `/ERROR_HANDLING_EXAMPLES.md`

## 💡 Pro Tips

1. **Check Category First**: Look at `error.category` to understand error type
2. **Read Details**: Click "Tafsilotlarni ko'rsatish" for technical info
3. **Test Offline**: Use DevTools to simulate network errors
4. **Inspect Component**: Use React DevTools to inspect error object
5. **Check Logs**: Open console (F12) to see structured error logs
6. **Preserve Data**: Form data is automatically preserved during retry
7. **Mobile First**: Test on mobile to ensure good UX

## 📞 Need Help?

- **Error Logs**: Open browser console (F12) to see detailed logs
- **Component Inspection**: Use React DevTools to inspect props
- **Documentation**: Read `/ERROR_HANDLING.md` for full details
- **Examples**: Check `/ERROR_HANDLING_EXAMPLES.md` for test cases

## 🎯 Success Criteria

✅ Registration error shows "Qayta ko'rib chiq ro'yxatdan o'tishda xatolik yuz berdi"
✅ Error message is specific and helpful
✅ User can expand technical details
✅ Retry button works for transient errors
✅ Form data preserved during retry
✅ Error logs appear in console (dev mode)
✅ Color-coded by severity
✅ Mobile responsive

---

**Last Updated**: 2024-03-11
**Version**: 1.0.0
