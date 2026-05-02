# SocialNest – Full Stack Social Media App
SocialNest is a full-stack social media web application built using Django REST Framework and React JS. It allows users to create accounts, share posts, and interact with content through likes.

---

## 🚀 Features

### 🔐 Authentication
- User registration & login
- JWT-based authentication (Access & Refresh tokens)
- Secure backend authentication using Django REST Framework

### 🏠 Home
- Landing page after login
- (Planned improvements for better UI and features)

### 📰 Feed
- View posts from multiple users
- Like / Unlike posts
- Comment System
- Real-time data fetched from backend APIs

### 👤 Profile
- View profile (photo, name, bio)
- Edit Bio & Image (profile)
- Create new posts
- View posts created by the logged-in user

### 🔄 Multi-Account Support
- Switch between logged-in accounts
- Add new accounts
- Logout functionality with session handling

---

## 🛠 Tech Stack

### Frontend
- React JS
- Axios
- HTML, CSS

### Backend
- Django
- Django REST Framework
- JWT Authentication

### Database
- SQLite (default Django DB)

---

## 📂 Project Structure

frontend/   → React application
backend/    → Django REST API
README.md
---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository
git clone https://github.com/Amulya-TG/socialnest.git
cd project-folder


### 2️⃣ Backend Setup

cd backend
pip install requirements
python manage.py migrate
python manage.py runserver

### 3️⃣ Frontend Setup
cd Frontend
npm install
npm run dev

---

## 🔗 API Integration
- Frontend communicates with backend using Axios
- JWT tokens used for secure API requests

---

## 🚧 Future Improvements
- Follow/Unfollow users
- Better UI/UX design
- Notifications system
- Deployment (AWS / Vercel / Render)

---

## 📌 Project Status
This project is in the development stage with core features implemented and more improvements planned.

---

## 🙌 Author
Amulya T G
