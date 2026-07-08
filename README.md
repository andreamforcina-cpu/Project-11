# Task Management Database

A backend project built with Node.js, Sequelize, and SQLite that models a simple task management system. The application demonstrates relational database design, user-task associations, password hashing, and database seeding using a scalable ORM architecture.

The project includes:

- User and task data models
- One-to-many database relationships
- Secure password hashing
- Database initialization and seeding

## Features

- SQLite database integration
- Sequelize ORM models
- User authentication-ready password hashing
- One-to-many relationship between users and tasks
- Automatic database synchronization
- Bulk database seeding
- Environment variable configuration
- Modular database setup

## Technologies Used

- Node.js
- JavaScript
- Sequelize
- SQLite
- bcryptjs
- dotenv
- Git & GitHub

## 📂 Project Structure

```text
task-management-database
│
├── database
│   ├── setup.js
│   └── seed.js
│
├── node_modules
│
├── .env
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Database Models

### User

- id
- name
- email
- password

### Task

- id
- title
- description
- completed
- priority
- userId

## Relationships

- One User can have multiple Tasks.
- Each Task belongs to one User.

## About

A Node.js backend project built with Sequelize and SQLite that models users and tasks through relational database design. The project demonstrates ORM associations, password hashing, database synchronization, and data seeding.
