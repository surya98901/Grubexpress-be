# GrubExpress — Backend

A backend service for **GrubExpress**, a full-stack food delivery application designed around the core workflows of a modern food delivery platform.

The backend is built with **Node.js, Express.js, MongoDB, and JWT-based authentication**, with a focus on clean REST APIs, modular architecture, authentication, validation, and scalable backend design.

> 🚧 **Project Status:** Under active development. Core authentication and user profile APIs are currently implemented, with restaurant, menu, cart, order, and delivery workflows planned.

---

## Tech Stack

* **Node.js** — JavaScript runtime
* **Express.js** — REST API framework
* **MongoDB** — Database
* **Mongoose** — MongoDB ODM
* **JWT** — Authentication
* **bcrypt** — Password hashing
* **dotenv** — Environment configuration

---

## Current Features

### Authentication

* User registration
* User login
* Password hashing with bcrypt
* JWT-based authentication
* Protected API routes
* Authentication middleware

### User Profile

* View authenticated user profile
* Edit profile details
* Change password
* User input validation

---

## Planned Features

* Restaurant discovery and management
* Restaurant menus
* Food item management
* Cart management
* Address management
* Order creation and tracking
* Order history
* Delivery workflow
* User reviews and ratings
* Admin APIs
* Payment integration
* AWS deployment

---

## Project Structure

```text
src/
├── config/
│   └── database.js
├── middleware/
│   ├── auth.js
│   └── errorHandler.js
├── models/
│   └── User.js
├── routes/
│   ├── auth.js
│   └── user.js
├── controllers/
├── app.js
└── server.js
```

The project follows a modular structure so that new domains such as restaurants, menus, carts, and orders can be added without turning the application into a monolithic route file.

---

## API Overview

### Authentication

| Method | Endpoint           | Description                     | Auth |
| ------ | ------------------ | ------------------------------- | ---- |
| `POST` | `/api/auth/signup` | Register a new user             | No   |
| `POST` | `/api/auth/login`  | Authenticate user and issue JWT | No   |

### User

| Method  | Endpoint                 | Description                      | Auth |
| ------- | ------------------------ | -------------------------------- | ---- |
| `GET`   | `/api/user/profile`      | Get authenticated user's profile | Yes  |
| `PATCH` | `/api/user/profile/edit` | Update profile details           | Yes  |
| `PATCH` | `/api/user/password`     | Change account password          | Yes  |

> API documentation will expand as additional food-delivery modules are implemented.

---

## Authentication

Protected routes use a JWT supplied through the `Authorization` header.

```http
Authorization: Bearer <JWT_TOKEN>
```

The authentication middleware:

1. Extracts the token from the request.
2. Verifies the JWT.
3. Identifies the authenticated user.
4. Attaches the user information to the request.
5. Allows the request to continue to the protected route.

---

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Never commit `.env` or other secrets to the repository.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/surya98901/Grubexpress-be.git
cd Grubexpress-be
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file and add the required configuration.

### 4. Start the development server

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:3000
```

---

## Development Roadmap

```text
[x] Project setup
[x] Express server
[x] MongoDB connection
[x] Middleware foundation
[x] User schema
[x] JWT authentication
[x] Authentication middleware
[x] Profile view API
[x] Profile edit API
[x] Password edit API

[ ] Restaurant APIs
[ ] Menu APIs
[ ] Cart APIs
[ ] Address APIs
[ ] Order APIs
[ ] Delivery APIs
[ ] Reviews & ratings
[ ] Admin APIs
[ ] Payment integration
[ ] AWS deployment
```

---

## Project Goals

GrubExpress is being developed as a portfolio-grade full-stack application with an emphasis on:

* REST API design
* Authentication and authorization
* MongoDB data modeling
* Middleware architecture
* Input validation
* Error handling
* Scalable API organization
* Real-world food delivery workflows
* Clean separation between frontend and backend

The goal is not just to build a CRUD application, but to model the backend architecture and workflows of a real-world food delivery platform.

---

## License

This project is currently under active development.
