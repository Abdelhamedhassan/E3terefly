# E3terefly

E3terefly is a Node.js RESTful API server built with Express and MongoDB, designed for user authentication, messaging, and file uploads. The project demonstrates modular architecture, secure authentication, and integration with cloud services.

## Features

- **User Authentication:**

  - Signup, login, and email confirmation
  - Google OAuth2 login/signup
  - Password reset with OTP via email
  - JWT-based access and refresh tokens
  - Role-based authorization (user/admin)

- **User Management:**

  - Profile viewing and updating
  - Freeze, restore, and hard-delete accounts
  - Profile image and cover image uploads (Cloudinary support)

- **Messaging:**

  - Send messages with optional attachments
  - Message validation and file type restrictions

- **File Uploads:**

  - Local and cloud (Cloudinary) storage options
  - Multer-based file validation

- **Security:**

  - Password hashing (bcryptjs)
  - Data encryption (crypto-js)
  - Token revocation and blacklist
  - Environment-based configuration

- **Email Integration:**
  - Nodemailer for sending OTP and notifications
  - HTML email templates

## Project Structure

```
## Project Structure

```
E3terefly/
│
├── src/
│   ├── app.controller.js         # Main app controller and routing
│   ├── index.js                  # Application entry point
│   ├── config/                   # Environment and app configuration files
│   ├── DB/                       # Database models and connection logic
│   ├── middleware/               # Authentication, validation, and utility middleware
│   ├── modules/
│   │   ├── auth/                 # Authentication controllers, services, and validation
│   │   ├── message/              # Messaging logic and controllers
│   │   └── users/                # User management controllers and services
│   ├── uploads/                  # Uploaded files (local storage)
│   └── utils/                    # Helper utilities (email, response, security, etc.)
│
├── package.json
├── .env.dev                      # Development environment variables
├── .env.prod                     # Production environment variables
└── README.md
```
