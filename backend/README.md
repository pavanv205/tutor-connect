# TutorConnect Backend

This backend serves the Tutor registration API using Node.js, Express and MongoDB (Mongoose).

Setup

1. Copy `.env.example` to `.env` and set `MONGODB_URI` to your MongoDB Atlas connection string.

2. Install dependencies and run the server:

```bash
cd backend
npm install
npm run dev
```

APIs

- `POST /api/tutors` - create a tutor (multipart/form-data, `resume` field optional)
- `GET /api/tutors` - list tutors
- `GET /api/tutors/:id` - get tutor
- `PUT /api/tutors/:id` - update tutor (supports resume upload)
- `DELETE /api/tutors/:id` - delete tutor

Uploaded resumes are stored in `backend/uploads` and served at `/uploads/<filename>`.
