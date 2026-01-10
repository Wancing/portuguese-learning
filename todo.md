# Portuguese Learning App TODO

## Database & Backend
- [x] Design database schema for categories, phrases, and user recordings
- [x] Implement tRPC procedures for fetching categories and phrases
- [x] Implement audio upload to S3 storage
- [x] Implement audio transcription using Whisper API
- [x] Implement AI pronunciation feedback using LLM

## Frontend UI
- [x] Set up Memphis-inspired design system (colors, fonts, geometric decorations)
- [x] Build home page with category browsing
- [x] Build phrase list page with search and filter
- [x] Build phrase detail page with audio playback
- [x] Implement audio recording interface
- [x] Implement side-by-side audio comparison
- [x] Display transcription and pronunciation feedback
- [x] Ensure responsive design for mobile and desktop

## Testing & Deployment
- [x] Seed database with sample phrases across categories
- [x] Write unit tests for core functionality
- [x] Create checkpoint for deployment

## Admin Features
- [x] Create admin page for managing phrases
- [x] Implement audio file upload for native speaker recordings
- [x] Add ability to update phrase audio URLs
- [x] Test audio upload and playback

## Authentication Improvements
- [x] Implement email/password authentication system
- [x] Create simple registration form (name, surname, email, password)
- [x] Add password hashing and security
- [x] Allow guest access for practice without login
- [x] Create login/registration UI pages
- [x] Test authentication flows

## Contributor System
- [x] Add contributor role to user schema
- [x] Create contributor approval workflow
- [x] Build contributor dashboard for managing recordings
- [ ] Implement live conversation scheduling system
- [ ] Add contributor earnings/credits system

## Flashcard System
- [x] Design flashcard database schema
- [x] Implement flashcard CRUD operations
- [x] Create flashcard study modes (flip, multiple choice, typing)
- [x] Add spaced repetition algorithm for review scheduling
- [x] Build flashcard UI with progress tracking
- [x] Implement flashcard deck management

## Progress Tracking Dashboard
- [ ] Add study session tracking to database
- [ ] Implement progress analytics backend procedures
- [ ] Build dashboard UI with charts and visualizations
- [ ] Add category performance tracking
- [ ] Implement learning streak calculation
- [ ] Create personalized insights and recommendations

## Bug Fixes
- [x] Fix "How It Works" button to navigate to info page
- [x] Create "How It Works" informational page
- [x] Fix authentication for non-admin users to access recording features
- [x] Ensure all users can record and practice regardless of role

## Achievement Badges System
- [x] Design badge types and unlock conditions
- [x] Add badges table to database schema
- [x] Implement badge unlock logic and tracking
- [x] Create badge UI components and display in student profile
- [x] Add badge notifications when earned

## Bulk Audio Upload
- [x] Create bulk upload interface for admin
- [x] Implement CSV/JSON mapping for phrase IDs to audio files
- [x] Add batch processing for multiple file uploads
- [x] Show upload progress and status

## Conversation Practice Mode
- [x] Design conversation dialogue structure
- [x] Implement AI prompt generation for conversations
- [x] Add student response recording and analysis
- [x] Build conversation UI with turn-by-turn dialogue
- [x] Implement real-time pronunciation feedback for conversations

## Critical Bug Fixes
- [x] Restrict admin panel access to owner/admin users only
- [x] Fix native speaker audio playback so students can hear reference pronunciation
- [x] Clarify where users upload their audio recordings with better UI labels


## User Requirements Updates
- [x] Enable all authenticated users to contribute audio recordings
- [x] Remove contributor role restrictions for audio uploads
- [x] Verify flashcard records persist in database permanently
- [x] Make AI analysis optional with skip button
- [x] Allow users to view recordings without AI feedback


## Critical Bugs - Urgent Fixes
- [x] Restore audio recording functionality
- [x] Fix login system authentication
- [x] Assign admin access to lxj1634629917@gmail.com
- [x] Verify admin role assignment works correctly


## Audio Upload & Playback Bug
- [x] Fix recorded audio file upload to S3
- [x] Fix audio file URL generation for playback
- [x] Verify audio files are accessible after upload


## Admin Audio Visibility Bug
- [ ] Debug why admin uploaded audio not showing to public
- [ ] Fix audio URL retrieval from database
- [ ] Ensure all users can see admin uploaded audio
