# Team Task Manager

A full-stack web application for managing teams and tasks efficiently. Built as part of a Full Stack Development Assessment.

## 🚀 Features
- **Secure Authentication**: Register and login using PassportJS with persistent sessions in PostgreSQL.
- **Team Management**: Create teams and add members.
- **Task Management**: Create, assign, update, and delete tasks within teams.
- **Advanced Filtering**: Filter tasks by team or assigned member.
- **Real-time Reminders**: Dashboard notifications for overdue or due tasks.
- **Responsive UI**: Built with React, Tailwind CSS, and Lucide icons for a premium experience.

## 🛠️ Technology Stack
- **Frontend**: React, Vite, Tailwind CSS, Axios, Lucide React.
- **Backend**: Node.js, Express, PassportJS, Joi, Bcrypt.
- **Database**: PostgreSQL (Neon/GCP).
- **Authentication**: Passport Local Strategy + Express Session + PG Session Store.

## 📦 Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd team-task-manager
```

### 2. Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory and add the following:
   ```env
   PORT=5000
   DATABASE_URL=your_postgresql_connection_string
   SESSION_SECRET=your_random_secret
   ```
4. Initialize the database schema:
   Run the SQL commands from `server/schema.sql` in your PostgreSQL instance.
5. Start the backend:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the root directory:
   ```bash
   cd ..
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```
4. Open your browser at `http://localhost:5173`.

## 🔒 Security Practices
- **Password Hashing**: Using Bcrypt for all user passwords.
- **Input Validation**: All API requests are validated using Joi schemas.
- **Authentication**: Protected routes via `isAuthenticated` middleware.
- **Secure Sessions**: HTTP-only cookies and persistent session storage.

## 📝 License
This project is licensed under the ISC License.
