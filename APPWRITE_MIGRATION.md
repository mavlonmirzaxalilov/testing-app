# Firebase to Appwrite Migration & Educational Feedback Feature

## Overview
This document outlines the complete migration from Firebase to Appwrite, along with the implementation of video and image answer feedback features for tests.

## Changes Made

### 1. Appwrite Configuration Files

#### `/lib/appwrite-client.ts` (NEW)
- Initializes Appwrite client, Account, Databases, and Storage services
- Manages singleton instances to prevent re-initialization
- Exports configuration with endpoint, project, database, and bucket IDs
- Uses environment variables: `NEXT_PUBLIC_APPWRITE_ENDPOINT`, `NEXT_PUBLIC_APPWRITE_PROJECT_ID`, `NEXT_PUBLIC_APPWRITE_DATABASE_ID`, `NEXT_PUBLIC_APPWRITE_BUCKET_ID`

#### `/lib/appwrite.ts` (NEW)
- Complete replacement for Firebase operations
- Implements all authentication functions: `createUserWithEmailAndPasswordExtended`, `signInWithEmailAndPasswordExtended`, `signOutUser`, `getUserData`, `getCurrentUser`
- Database operations: `getTests`, `getTest`, `createTest`, `updateTest`, `deleteTest`
- Progress tracking: `saveProgress`, `getProgress`
- Results management: `saveResult`, `getResults`
- Image upload: `uploadAnswerImage` (stores images in Appwrite Storage)
- Updated `Question` interface with optional `videoAnswer` and `imageAnswer` fields

#### `/env.local` (NEW)
- Added Appwrite environment variables
- Users must fill in: `NEXT_PUBLIC_APPWRITE_ENDPOINT`, `NEXT_PUBLIC_APPWRITE_PROJECT_ID`, `NEXT_PUBLIC_APPWRITE_DATABASE_ID`, `NEXT_PUBLIC_APPWRITE_BUCKET_ID`

### 2. Authentication Updates

#### `contexts/auth-context.tsx`
- Updated imports from Firebase to Appwrite
- Changed initialization to use `getAppwriteAccount()` instead of Firebase Auth
- Modified auth state listener to use Appwrite's `account.get()` method
- Maintained all public API - no breaking changes for components using the context

#### `app/auth/signin/page.tsx`
- No changes needed (uses `useAuth()` context)

#### `app/auth/signup/page.tsx`
- No changes needed (uses `useAuth()` context)

#### `app/auth/admin/signin/page.tsx`
- Updated import from `@/lib/firebase` to `@/lib/appwrite`

### 3. Educational Feedback Features

#### `components/image-answer-modal.tsx` (NEW)
- Modal dialog component for displaying answer images
- Triggered when user clicks "Rasmli Javob" (Image Answer) button
- Displays image URL with question text context
- Clean close button implementation

#### `app/admin/tests/create/page.tsx`
- Updated imports to use Appwrite functions
- Extended `QuestionForm` interface with:
  - `videoAnswer?: string` (YouTube URL)
  - `imageAnswer?: string` (stored image URL)
  - `imageFile?: File | null` (for upload)
- Added UI sections for each question:
  - YouTube video URL input field
  - Image file upload field with visual feedback
- Modified `handleSubmit` to:
  - Upload images to Appwrite Storage before test creation
  - Store image URLs in question objects
  - Include video and image URLs in test data

#### `app/tests/[id]/review/page.tsx`
- Updated imports to use Appwrite functions
- Added image modal state management:
  - `imageModalOpen`: controls modal visibility
  - `selectedImageUrl`: stores URL for modal display
  - `selectedQuestionText`: shows context in modal
- Added handlers:
  - `handleVideoAnswer`: opens YouTube link in new tab
  - `handleImageAnswer`: opens image in modal on same page
- Enhanced wrong answers section with feedback buttons:
  - Video answer button (▶️) - only shows if `videoAnswer` exists
  - Image answer button (🖼️) - only shows if `imageAnswer` exists
- Added `ImageAnswerModal` component at bottom of page

### 4. Data Model Updates

#### Question Interface
```typescript
interface Question {
  text: string
  options: string[]
  correctIndex: number
  explanation: string
  videoAnswer?: string        // YouTube URL
  imageAnswer?: string        // Appwrite Storage URL
}
```

### 5. All Files Updated to Use Appwrite

| File | Changes |
|------|---------|
| `app/tests/page.tsx` | Import from `@/lib/appwrite` |
| `app/tests/[id]/page.tsx` | Import from `@/lib/appwrite` |
| `app/results/page.tsx` | Import `getTests`, `getResults` from Appwrite |
| `app/admin/page.tsx` | Import from `@/lib/appwrite` |
| `app/admin/tests/[id]/edit/page.tsx` | Import from `@/lib/appwrite`, added `uploadAnswerImage` |
| `app/admin/results/page.tsx` | Import from `@/lib/appwrite` |
| `components/question-card.tsx` | Import types from `@/lib/appwrite` |

## Database Schema Requirements

When setting up Appwrite, create the following collections:

### `users` Collection
- Fields: uid, email, firstName, lastName, phoneNumber, displayName, role, createdAt

### `tests` Collection
- Fields: title, description, durationMinutes, createdAt, questions (object with video/image fields)

### `progress` Collection
- Document ID: `{userId}_{testId}`
- Fields: userId, testId, startAt, lastUpdated, answers

### `results` Collection
- Fields: userId, testId, score, correctCount, wrongCount, skipped, completedAt

### Storage Setup
- Create a bucket for answer images (store bucket ID in `NEXT_PUBLIC_APPWRITE_BUCKET_ID`)

## User Workflow

### For Admins (Creating Tests)
1. Navigate to admin test creation page
2. Enter test details (title, description, duration)
3. For each question, optionally add:
   - YouTube video answer URL
   - Image explanation (uploaded to Appwrite Storage)
4. Save test - images are automatically uploaded

### For Users (Taking Tests)
1. Complete test as normal
2. View results and review page
3. For wrong answers with feedback:
   - Click "Video Javob" to watch explanation video in new tab
   - Click "Rasmli Javob" to see explanation image in modal

## Environment Variables Required

```
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
NEXT_PUBLIC_APPWRITE_BUCKET_ID=your_bucket_id
```

## Testing Checklist

- [ ] User registration and login work with Appwrite
- [ ] Admin can create tests with video and image answers
- [ ] Video answers open in new tab
- [ ] Image answers display in modal
- [ ] Progress saving works correctly
- [ ] Results are calculated and stored
- [ ] All existing functionality preserved (no Firebase references remain)

## Notes

- All data is preserved during migration (structure remains identical)
- No breaking changes to component APIs
- Storage of images is handled automatically via Appwrite Storage SDK
- Video answers use YouTube embed URLs (store full watch URLs)
- Image answers are stored as Appwrite file URLs in the database
