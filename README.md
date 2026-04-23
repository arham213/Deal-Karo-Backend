# Deal-Karo-Backend

![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs&logoColor=white&style=flat-square)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white&style=flat-square)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white&style=flat-square)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?logo=socketdotio&logoColor=white&style=flat-square)
![Deployed on Railway](https://img.shields.io/badge/Deployed-Railway-131415?logo=railway&logoColor=white&style=flat-square)

Shared Node.js REST API serving both the Deal Krein web and mobile applications. Handles authentication, property data, user management, and real-time messaging infrastructure via Socket.IO.

**Live:** [backend.dealkroo.com](https://backend.dealkroo.com) &nbsp;|&nbsp;**Web:** [deal-kroo](https://github.com/arham213/deal-kroo) &nbsp;|&nbsp; **Mobile:** [Deal-Karo-Frontend](https://github.com/arham213/Deal-Karo-Frontend)

---

## System Overview

```
Deal Krein
├── deal-kroo              # Next.js web application
├── Deal-Karo-Frontend     # React Native mobile application
└── Deal-Karo-Backend      # Shared Node.js REST API (this repo)
```

---

## Responsibilities

- OTP-based authentication and session management via JWT
- Property CRUD — listings, search, filtering, pagination
- User profiles, notes, and account management
- Real-time messaging infrastructure via Socket.IO
- Shared across web and mobile clients

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| Database | MongoDB, Mongoose |
| Auth | JWT, OTP |
| Real-time | Socket.IO |
| Deployment | Railway |

---

## Local Setup

```bash
git clone https://github.com/arham213/Deal-Karo-Backend.git
cd Deal-Karo-Backend
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=your_port
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=your_frontend_url
```

```bash
npm run dev
```

---

## Author

[LinkedIn](https://linkedin.com/in/arhamasjid) · arhamasjid213@gmail.com
