# SlotSwapper

SlotSwapper is a full-stack scheduling and slot swap application. Users can register, log in, create events, and propose event swaps with others. The project uses a React + Material UI frontend and a Python backend deployed on Vercel and Render.

## Overview

- Modern, responsive UI using React and MUI (Material UI)
- Backend RESTful API (Python, FastAPI/Flask/Django)
- JWT authentication for security
- Cloud deployment with easy setup

## Setup & Installation

### Prerequisites
- Node.js & npm (for frontend)
- Python 3.10+ (for backend)
- Git

### Steps

1. **Clone the repo:**
git clone https://github.com/dhawalsarode/slotswapper.git
cd slotswapper

text

2. **Backend:**
- Enter the backend folder (if present) or use root for monorepo.
- Install dependencies:
  ```
  pip install -r requirements.txt
  ```
- Copy `.env.example` to `.env`. Set environment variables as needed.
- Start backend:
  ```
  python app.py
  ```

3. **Frontend:**
- Change to the frontend folder:
  ```
  cd frontend
  ```
- Install dependencies:
  ```
  npm install
  ```
- Copy `.env.example` to `.env` and set backend URL.
- Start frontend:
  ```
  npm start
  ```
- Browse to `http://localhost:3000`

## API Endpoints

| Endpoint                | Method | Description           | Auth | Payload                          |
|-------------------------|--------|-----------------------|------|-----------------------------------|
| /api/auth/register      | POST   | Register user         | No   | { name, email, password }         |
| /api/auth/login         | POST   | User login            | No   | { email, password }               |
| /api/events             | GET    | List all events       | Yes  | N/A                               |
| /api/events             | POST   | Create new event      | Yes  | { title, start_time, end_time }   |
| /api/swaps              | POST   | Propose swap          | Yes  | { myEventId, otherEventId }       |

## Live Application

- [Frontend on Vercel](https://slotswapper-theta.vercel.app/)
- [Backend on Render](https://slot-swapper-backend-zdkg.onrender.com)

## Assumptions & Challenges

- Name is required on registration due to backend validation.
- Free-tier hosting may introduce cold-start delays of up to 60s.
- Main design challenge: seamless API/env var integration across cloud deploys.
- JWT authentication and CORS handled as per SaaS best practices.


## Authors

- Dhawal Sarode (https://github.com/dhawalsarode)


## License

MIT

## Support

Raise an issue or PR for contributions/feedback.
