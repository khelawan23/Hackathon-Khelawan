# **App Name**: WhisperNet

## Core Features:

- Google OAuth Sign-In: Enable user authentication and authorization via Google OAuth 2.0, storing basic profile data (UID, display name, email, photo URL, creation timestamp) in Firestore on first login.
- Home Feed: Display a feed of text-only posts from the current user and all other users, showing the text content, author display name, timestamp, and author photo (if available).
- Explore Feed: Show a global feed of all text-only posts from all users, sorted newest first.
- Text-Only Posting: Allow users to create and post text-only content. Each post includes an ID, UID, text, and timestamp. Posts are displayed with the profile name.
- User Model: Store user data, including UID, display name, email, photo URL, and creation timestamp, in Firestore for future lookups.
- Firestore Integration: Utilize Firestore collections for storing user and post data, following security rules for data access control (users: read-own only; posts: read-all; posts: create requires auth).

## Style Guidelines:

- Primary color: Vibrant blue (#007BFF) to create a modern and engaging feel.
- Secondary color: Energetic orange (#FF9800) to add a playful and attention-grabbing element.
- Background color: Light gray (#F5F5F5), providing a clean backdrop for the vibrant primary and secondary colors.
- Body and headline font: 'Roboto' for a clear and readable text experience.
- Simple, minimalist icons with a touch of radiant effect for visual appeal.
- Clean, card-based layouts for posts, with clear separation between elements, enhanced with subtle radiant effects.
- Subtle animations for loading and transitions, incorporating radiant effects to highlight interactive elements.