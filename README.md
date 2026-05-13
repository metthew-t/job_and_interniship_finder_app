# Job & Internship Finder Platform

A production-ready cross-platform mobile application for connecting job seekers with employers.

## Tech Stack

- **Frontend:** Flutter (Dart)
- **Backend:** Node.js (Express)
- **Database:** PostgreSQL
- **AI/Matching:** Custom Rule-based engine
- **Authentication:** JWT, Google OAuth, LinkedIn OAuth

## Project Structure

- `/backend`: Node.js API with Sequelize ORM.
- `/lib`: Flutter mobile application code.
- `/backend/schema.sql`: Database schema definition.

## Getting Started

### Backend Setup
1. Navigate to `/backend`.
2. Run `npm install`.
3. Create a `.env` file based on `.env.example`.
4. Setup your PostgreSQL database and run the `schema.sql`.
5. Run `npm run dev` to start the development server.

### Frontend Setup
1. Ensure Flutter is installed.
2. Run `flutter pub get` in the root directory.
3. Update `lib/services/api_service.dart` with your local IP or backend URL.
4. Run `flutter run`.

## Key Features Implemented
- User Registration & Authentication (JWT based)
- Job Listing & Filtering
- AI Matching Score Service
- Database Schema with PostgreSQL
- Responsive Mobile UI with Flutter
- State Management using Provider
