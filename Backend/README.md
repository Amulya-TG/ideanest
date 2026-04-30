# 🚀 SocialNest Backend

Backend API for SocialNest – a social media application built using Django REST Framework.

## 🛠️ Tech Stack
- Python
- Django REST Framework
- JWT Authentication

## ✨ Features
- User Registration & Login (JWT Auth)
- Create Post (Image & Video)
- Like / Unlike Posts
- Comment System
- User Profile (Edit Bio & Profile Image)
- Fetch Feed & User Posts

## 📂 API Endpoints

### 🔐 Auth
- POST /api/users/register/
- POST /api/users/login/
- POST /api/users/refresh/

### 👤 Profile
- GET /api/users/profile/
- PUT /api/users/profile/update/

### 📸 Posts
- GET /api/posts/
- POST /api/posts/create/
- GET /api/posts/<id>/
- GET /api/posts/my-posts/

### ❤️ Likes
- POST /api/posts/like/<post_id>/

### 💬 Comments
- GET /api/posts/<id>/comments/
- POST /api/posts/<id>/comment/

## ⚙️ Setup

```bash
git clone https://github.com/Amulya-TG/socialnest.git
cd backend

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

python manage.py migrate
python manage.py runserver