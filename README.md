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
<userPrompt>
Provide the fully rewritten file, incorporating the suggested code change. You must produce the complete file.
</userPrompt>
```
