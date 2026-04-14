# Youth Football Team Management System

---

## 1. Purpose

This application is designed to manage youth football teams, players, and coaches.  
It provides a full-stack web solution that allows users to create, update, and manage data efficiently.

---

## 2. Features

### Player Management
- Create, read, update, and delete players
- Automatic age calculation from date of birth
- Jersey number validation (1–99, unique per team)
- Guardian contact validation (at least one contact method required)
- Optional additional contact information

### Team Management
- Create and manage teams
- Automatic team naming (e.g., U10, U12)
- Assign training days
- Assign coaches

### Coach Management
- Create, edit, and delete coaches
- View assigned teams and training schedules

### Advanced Features
- Search, filtering, and sorting
- Pagination
- Authentication (JWT-based login and registration)
- Coach scheduling conflict prevention (cannot assign overlapping training days)

---

## 3. Technologies

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

### Frontend
- React (Vite)
- Mantine UI

### Other
- JWT Authentication
- PM2 (process manager)
- Caddy (reverse proxy)

---

## 4. Project Structure

```text
.
├── LICENCE
├── Caddyfile
├── client/        # Frontend (React)
├── server/        # Backend (Express)
└── README.md

```
## 5. Installation

### Backend Setup

cd server  
npm install  
npm run dev  

Server will run on:  
http://localhost:3000  

### Frontend Setup

cd client  
npm install  
npm run dev  

Frontend will run on:  
http://localhost:5173  

---

## 6. API Usage

All API endpoints are available under:  
/api/*  

Example endpoints:  

GET /api/players  
POST /api/players  
PUT /api/players/:id  
DELETE /api/players/:id  

GET /api/teams  
POST /api/teams  

GET /api/coaches  
POST /api/coaches  

An API collection is provided in:  
server/API-collection.json  

---

## 7. Deployment

The application is deployed on a remote server using:  

- PM2 for backend process management  
- Caddy as a reverse proxy server  

Example routing:  

/api/* → backend server (Node.js)  
/a02/* → frontend static files  

The frontend is built using:  

npm run build  

and served as static files.  

---

## 8. Validation Rules

- Guardian must provide at least one contact (email or phone)  
- Jersey numbers must be unique within a team  
- Players are assigned to teams based on age  
- Coaches cannot be assigned to teams with overlapping training days  

---

## 9. Notes

- The system supports dynamic data creation  
- No initial database data is required  
- Data can be created via UI or API during runtime  

---

## 10. Author

This project was developed as part of the IFN666 assessment.

