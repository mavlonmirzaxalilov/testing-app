# Error Handling Examples and Testing Guide

## How to Test Registration Error Handling

### 1. Email Already Exists Error

**Steps to Reproduce**:
1. Go to registration page
2. Fill in form with valid data:
   - First Name: "Ali"
   - Last Name: "Valiyev"
   - Phone: "+998901234567"
   - Email: "test@example.com"
   - Password: "Password123"
   - Confirm Password: "Password123"
3. Click "Ro'yxatdan O'tish"
4. Wait for successful registration
5. Go back to registration page
6. Fill same form again
7. Click "Ro'yxatdan O'tish"

**Expected Result**:
- Error message appears: "Bu elektron pochta manzili allaqachon ro'yxatga olingan..."
- Error is displayed in blue (info severity)
- No retry button is shown (not retryable)
- Helpful tip suggests using existing account or different email

**Error Details**:
```
Category: EMAIL_ALREADY_EXISTS
Severity: INFO (Blue)
Retryable: No
Tip: "Tizimga kirish" sahifasida mavjud akkauntingizdan foydalanib kiring...
```

### 2. Network Error (Simulate)

**Steps to Reproduce**:
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Enable offline mode (button at top of Network tab)
4. Go to registration page
5. Fill in form with valid data
6. Click "Ro'yxatdan O'tish"
7. Error appears immediately

**Expected Result**:
- Error message appears: "Internet aloqasi muammosi..."
- Error is displayed in amber (warning severity)
- **Retry button is visible** and clickable
- Helpful tip: "Maslahat: Internet ulanishini tekshiring va qayta urining."

**To Complete Test**:
1. Disable offline mode in DevTools
2. Click "Qayta urini" button
3. Registration should succeed

**Error Details**:
```
Category: NETWORK_ERROR
Severity: WARNING (Amber)
Retryable: Yes
Tip: "Internet ulanishini tekshiring va qayta urining."
```

### 3. Invalid Email Error

**Steps to Reproduce**:
1. Go to registration page
2. Fill in form:
   - First Name: "Ali"
   - Last Name: "Valiyev"
   - Phone: "+998901234567"
   - Email: "invalid-email" (missing @)
   - Password: "Password123"
   - Confirm Password: "Password123"
3. Click "Ro'yxatdan O'tish"

**Expected Result**:
- Validation error appears: "Email kiritilishi shart" or email validation error
- Error is displayed in red border box
- Form is not submitted

**Note**: This is a client-side validation error, not a registration error.

### 4. Weak Password Error

**Steps to Reproduce**:
1. Go to registration page
2. Fill in form:
   - First Name: "Ali"
   - Last Name: "Valiyev"
   - Phone: "+998901234567"
   - Email: "test@example.com"
   - Password: "123" (less than 6 characters)
   - Confirm Password: "123"
3. Click "Ro'yxatdan O'tish"

**Expected Result**:
- Validation error appears: "Parol kamida 6 ta belgidan iborat bo'lishi kerak"
- Error is displayed in red border box
- Form is not submitted

**Note**: This is a client-side validation error, not a registration error.

### 5. Password Mismatch Error

**Steps to Reproduce**:
1. Go to registration page
2. Fill in form:
   - First Name: "Ali"
   - Last Name: "Valiyev"
   - Phone: "+998901234567"
   - Email: "test@example.com"
   - Password: "Password123"
   - Confirm Password: "Password456" (different)
3. Click "Ro'yxatdan O'tish"

**Expected Result**:
- Validation error appears: "Parollar mos kelmaydi"
- Error is displayed in red border box
- Form is not submitted

### 6. Successful Registration

**Steps to Reproduce**:
1. Go to registration page
2. Fill in form with:
   - First Name: "Ali"
   - Last Name: "Valiyev"
   - Phone: "+998901234567"
   - Email: "newuser@example.com" (unique email)
   - Password: "SecurePass123"
   - Confirm Password: "SecurePass123"
3. Click "Ro'yxatdan O'tish"

**Expected Result**:
- Loading state shows "Ro'yxatdan o'tilyapti..."
- Page redirects to home page
- User is authenticated
- No error message appears

## Testing Retry Mechanism

### Test Case 1: Retry After Network Error

**Steps**:
1. Enable offline mode in DevTools
2. Attempt registration → Network error appears
3. **Form data is preserved**
4. Re-enable network
5. Click "Qayta urini" button
6. Registration should succeed
7. Should redirect to home

**What to Check**:
- ✓ Form data wasn't cleared after error
- ✓ Retry button shows loading state
- ✓ Error cleared after successful retry
- ✓ Redirect happens automatically

### Test Case 2: Retry After Server Error (Simulated)

This would require a server returning a 500 error. Check logs:

1. Open browser console (F12)
2. Look for `[Registration Error]` logs
3. Verify error was categorized as `SERVER_ERROR`
4. Verify `retryable: true`
5. Try retry → Should attempt registration again

## Viewing Error Logs

### In Development Mode

1. Open browser console (F12)
2. Any registration error shows:
```
[Registration Error] {
  timestamp: "2024-03-11T10:35:22.123Z",
  category: "EMAIL_ALREADY_EXISTS",
  message: "Bu elektron pochta manzili allaqachon ro'yxatga olingan...",
  details: "User with email already exists",
  retryable: false,
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  url: "http://localhost:3000/auth/signup"
}
```

### Log Details Explanation

| Field | Purpose | Example |
|-------|---------|---------|
| `timestamp` | When error occurred | "2024-03-11T10:35:22.123Z" |
| `category` | Error type | "EMAIL_ALREADY_EXISTS" |
| `message` | User-friendly message | "Bu elektron pochta manzili..." |
| `details` | Technical details | "User with email already exists" |
| `retryable` | Can user retry | `true` or `false` |
| `userAgent` | Browser info | "Mozilla/5.0..." |
| `url` | Page where error occurred | "http://localhost:3000/auth/signup" |

## Inspecting Error Component

### Using React DevTools

1. Install React DevTools browser extension
2. Go to registration page
3. Trigger an error
4. In DevTools, find `RegistrationErrorDisplay` component
5. Inspect props:
```typescript
{
  error: {
    category: "EMAIL_ALREADY_EXISTS",
    message: "Bu elektron pochta manzili...",
    details: "User email exists",
    timestamp: "2024-03-11...",
    retryable: false,
    originalError: {...}
  },
  onRetry: () => {...},
  isRetrying: false
}
```

## Code Examples

### Example 1: Using Error Handler Directly

```typescript
import { createRegistrationError, logRegistrationError } from '@/lib/error-handler'

async function customRegistration(email: string, password: string) {
  try {
    // Attempt registration
    const user = await registerUser(email, password)
    return user
  } catch (error) {
    // Create structured error
    const registrationError = createRegistrationError(error)
    
    // Log for debugging
    logRegistrationError(registrationError)
    
    // Handle in UI
    throw registrationError
  }
}
```

### Example 2: Displaying Error in Custom Component

```typescript
import { RegistrationErrorDisplay } from '@/components/registration-error'
import type { RegistrationError } from '@/lib/error-handler'
import { useState } from 'react'

export function CustomRegistrationForm() {
  const [error, setError] = useState<RegistrationError | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  const handleSubmit = async (data: FormData) => {
    try {
      setError(null)
      await submitRegistration(data)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'category' in err) {
        setError(err as RegistrationError)
      }
    }
  }

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      await submitRegistration(formData)
    } catch (err: unknown) {
      setError(err as RegistrationError)
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <div>
      <RegistrationErrorDisplay
        error={error}
        onRetry={handleRetry}
        isRetrying={isRetrying}
      />
      {/* Form fields... */}
    </div>
  )
}
```

### Example 3: Checking Retry Status

```typescript
// In your component
if (error && error.retryable) {
  // Show retry button
  <button onClick={handleRetry}>Qayta urini</button>
} else {
  // Show close button only
  <button onClick={() => setError(null)}>Yopish</button>
}
```

## Mobile Testing

### iOS Safari

1. Open signup page on iPhone
2. Trigger an error
3. Verify:
   - Error message is readable
   - Buttons are tap-able (44px minimum)
   - Expandable details work
   - Retry button functions

### Android Chrome

1. Open signup page on Android device
2. Trigger an error
3. Verify:
   - Error message is readable
   - Touch responsiveness
   - Keyboard doesn't overlap
   - Retry button works

## Performance Testing

### Network Throttling

1. Open DevTools → Network tab
2. Select "Slow 3G" throttling
3. Trigger registration error
4. Verify:
   - Error appears within reasonable time
   - Animations are smooth
   - No janky scrolling

### CPU Throttling

1. Open DevTools → Performance tab
2. Select "6x slowdown"
3. Click retry multiple times
4. Verify:
   - UI remains responsive
   - No lag during animations

## Accessibility Testing

### Keyboard Navigation

1. Go to registration page
2. Tab through form elements
3. Use keyboard to:
   - Fill in inputs
   - Click submit button
   - Trigger error
   - Click retry button
4. Verify all interactive elements are reachable

### Screen Reader Testing

1. Enable screen reader (VoiceOver on Mac/iOS, NVDA on Windows)
2. Navigate through form
3. Trigger error
4. Verify screen reader announces:
   - "Alert: Qayta ko'rib chiq ro'yxatdan o'tishda xatolik yuz berdi"
   - Error message
   - Retry button availability
   - Helpful tips

## Troubleshooting Common Issues

### Error Not Displaying

**Problem**: Error occurs but doesn't show in UI
**Solution**:
1. Check browser console for JavaScript errors
2. Verify `RegistrationErrorDisplay` is imported correctly
3. Check that error state is being set: `setError(err)`
4. Verify error object has `category` property

### Retry Not Working

**Problem**: Clicking retry button doesn't attempt registration again
**Solution**:
1. Check that error has `retryable: true`
2. Verify form data is still in state
3. Check console for errors in `handleRetry()` function
4. Ensure validation passes

### Error Details Not Expandable

**Problem**: "Tafsilotlarni ko'rsatish" button doesn't work
**Solution**:
1. Verify error has `details` property populated
2. Check that `showDetails` state is updating
3. Inspect component with React DevTools

### Wrong Error Message

**Problem**: Error showing generic message instead of specific one
**Solution**:
1. Check error categorization in `categorizeError()`
2. Verify error code matches expected patterns
3. Add more specific error detection in error-handler.ts
4. Check console logs for original error details

## Advanced Testing: Error Simulation

### Simulate Email Already Exists

```javascript
// In browser console:
const testError = new Error("User with email already exists");
testError.code = "user_already_exists";
// This would be caught and categorized as EMAIL_ALREADY_EXISTS
```

### Simulate Network Error

```javascript
// In browser console (after enabling offline):
const testError = new Error("Network request failed");
testError.message = "Failed to fetch";
// This would be caught and categorized as NETWORK_ERROR
```

### Simulate Server Error

```javascript
// In browser console:
const testError = new Error("Internal Server Error");
testError.status = 500;
// This would be caught and categorized as SERVER_ERROR
```

## Reporting Issues

When reporting registration error handling issues, include:
1. Steps to reproduce
2. Expected vs actual behavior
3. Browser console logs
4. Screenshot of error message
5. Error category and details from inspection
6. Device/browser information
7. Network conditions if applicable

## Next Steps

After testing error handling:
1. [ ] Test in production environment
2. [ ] Monitor error logs with external service (Sentry)
3. [ ] Gather user feedback on error messages
4. [ ] Optimize error messages based on usage patterns
5. [ ] Add rate limiting for repeated registration attempts
6. [ ] Implement email verification flow
7. [ ] Add analytics tracking for error patterns
