# Smart Farm System

## Overview
Smart Farm System is a full-stack application for managing farm operations. The repository is split into a Node.js/Express backend and a React + Vite frontend.

## Project Structure
- **backend/** – REST API built with Express and MongoDB
- **frontend/** – React client powered by Vite and Tailwind CSS

## Backend Setup
1. `cd backend`
2. `npm install`
3. Create a `.env` file with the variables listed below
4. `npm run dev` to start the development server

### Backend Environment Variables
| Variable | Description |
| --- | --- |
| `PORT` | Port for the API (default 5001) |
| `CLIENT_URL` | URL allowed for CORS |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | JWT expiration (optional) |
| `STRIPE_SECRET_KEY` | Stripe API secret |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `NODE_ENV` | Node environment (optional) |

## Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev` to launch the Vite dev server

### Frontend Environment Variables
| Variable | Description |
| --- | --- |
| `VITE_API_BASE_URL` | Base URL of the backend API |

## Common Commands
| Location | Command | Description |
| --- | --- | --- |
| backend | `npm run dev` | Start backend in development mode |
| backend | `npm start` | Start backend (same as dev) |
| backend | `npm test` | Run backend tests |
| frontend | `npm run dev` | Start frontend dev server |
| frontend | `npm run build` | Build production assets |
| frontend | `npm run lint` | Lint frontend code |
| frontend | `npm test` | Run frontend tests |

## Additional Documentation
- [Architecture Guide](docs/ARCHITECTURE.md) *(coming soon)*
- [Contribution Guide](CONTRIBUTING.md) *(coming soon)*

