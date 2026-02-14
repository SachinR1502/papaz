# Vehical Project Backend

This is the backend server for the Vehical Project, handling both **REST API** requests for authentication/data and **WebSocket** connections for real-time signaling (WebRTC).

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Real-time**: Socket.io
- **Security**: Helmet, Rate Limiting, JWT Authentication

## Setup

1.  Navigate to `backend/` directory.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file (or use the one provided):
    ```env
    MONGO_URI=mongodb://localhost:27017/vehical_project
    JWT_SECRET=your_secret_key
    PORT=3000
    ```
4.  Start the server:
    ```bash
    npm run dev
    # or
    node server.js
    ```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/send-otp` | Send OTP to mobile number | `{ "phoneNumber": "9876543210", "role": "customer" }` |
| `POST` | `/api/auth/verify-otp` | Verify OTP and Login | `{ "phoneNumber": "9876543210", "otp": "1234" }` |
| `POST` | `/api/auth/profile` | Create/Update Profile (Protected) | `{ "fullName": "John Doe", "address": "...", ... }` |
| `GET` | `/api/auth/me` | Get Current User Info (Protected) | - |

## Socket.io Events

- `register`: Register user socket with User ID.
- `call_offer`: Send WebRTC offer.
- `call_answer`: Send WebRTC answer.
- `ice_candidate`: Send ICE candidate.
- `send_message`: Send chat message.
