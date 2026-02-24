# Testing Guide

Server must be running at http://localhost:3000 before testing.

Start it with:
```
npm run start:dev
```

Swagger UI is available at http://localhost:3000/docs

---

## Step 1 - Login as Manager

POST /auth/login

Body:
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

Expected: 200 with access_token



## Step 2 - Create a Support user

POST /users (need manager token)

Body:
```json
{
  "name": "Alice Support",
  "email": "alice@example.com",
  "password": "pass1234",
  "role_id": 2
}
```

Expected: 201 with user object

Role IDs: 1 = MANAGER, 2 = SUPPORT, 3 = USER

---

## Step 3 - Create a regular User

POST /users (need manager token)

Body:
```json
{
  "name": "Bob User",
  "email": "bob@example.com",
  "password": "pass1234",
  "role_id": 3
}
```

Expected: 201

---

## Step 4 - Login as the User

POST /auth/login

Body:
```json
{
  "email": "bob@example.com",
  "password": "pass1234"
}
```

Copy the token for use in next steps.

---

## Step 5 - Create a Ticket (as User)

POST /tickets (need user token)

Body:
```json
{
  "title": "Cannot login",
  "description": "Getting an error when I try to log into the app",
  "priority": "HIGH"
}
```

Expected: 201 with ticket id

---

## Step 6 - Assign the Ticket (as Manager)

PATCH /tickets/1/assign (need manager token)

Body:
```json
{
  "assigned_to_id": 2
}
```

Expected: 200

---

## Step 7 - Update Ticket Status (as Manager or Support)

PATCH /tickets/1/status

Body:
```json
{
  "status": "IN_PROGRESS"
}
```

Expected: 200

---
