# JourniQ AI

JourniQ AI is an AI-powered Sri Lankan tourism platform for tourists, hotel owners, activity providers, and admins. It combines a modern travel website, role-based dashboards, booking workflows, real-time chat, email notifications, Cloudinary image uploads, and a Python machine-learning pipeline for tourism recommendation and demand analysis.

## System Overview

The project is split into three main applications:

| Part | Location | Purpose |
|---|---|---|
| Frontend | `frontend/` | Next.js tourist website, dashboards, authentication screens, AI pages, booking UI, chat UI, and profile pages |
| Backend | `backend/` | Express API, MongoDB models, JWT authentication, role authorization, emails, uploads, bookings, approvals, and Socket.IO chat |
| AI / ML | `AI-Model-Train-main/` | Python model training, tourism dataset processing, SVM/XGBoost/Random Forest/KNN/AdaBoost/LSTM scripts, and result outputs |

## Main Features

- Tourist-facing Sri Lankan travel website
- Destination discovery and admin-managed destination blog pages
- Hotel search, hotel detail pages, room data, booking requests, and photo galleries
- Experience search, experience detail pages, provider information, and booking requests
- Tourist registration with preference onboarding
- Personalized recommendation pages using saved preferences and model-backed signals
- AI trip planner input tracking
- Tourist profile, AI profile, booking history, and message pages
- Hotel owner dashboard for hotel profile, rooms, bookings, messages, revenue, availability, and insights
- Activity provider dashboard for experiences, bookings, calendar, messages, revenue, community profile, and insights
- Admin dashboard for users, approvals, hotels, experiences, destinations, reports, analytics, AI monitoring, and help
- Gmail-based email verification, password reset, provider approval emails, and booking notifications
- Cloudinary image upload support for hotels, rooms, and experiences
- Real-time chat between tourists and providers after inquiries/bookings

## Technology Stack

### Frontend

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Axios
- React Hook Form
- Zod
- Framer Motion
- Recharts
- Lucide React
- Socket.IO Client

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- Bcrypt password hashing
- Nodemailer with Gmail app password
- Cloudinary
- Multer
- Socket.IO

### AI / ML

- Python
- Pandas / NumPy
- Scikit-learn
- XGBoost
- TensorFlow / Keras
- Pickle model artifacts
- CSV result outputs

## Required Software

Install these before running the project:

- Node.js 20 or newer
- npm
- MongoDB local server or MongoDB Atlas database
- Python 3.10 or newer
- pip

## Project Structure

```text
research/
├── backend/
│   ├── server.js
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── utils/
│   ├── scripts/
│   └── seeds/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── context/
│   ├── lib/
│   ├── public/
│   └── package.json
├── AI-Model-Train-main/
│   ├── data/
│   ├── src/
│   ├── models/
│   ├── results/
│   └── requirements.txt
├── README.txt
├── USER_MANUAL.txt
└── README.md
```

## Environment Setup

### Backend `.env`

Create `backend/.env`:

```env
PORT=5008
MONGO_URI=mongodb://localhost:27017/journiq
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:3000
FRONTEND_URL=http://localhost:3000

GMAIL_USER=yourgmail@gmail.com
GMAIL_APP_PASSWORD=your-google-app-password
EMAIL_FROM=JourniQ AI <yourgmail@gmail.com>
ADMIN_NOTIFY_EMAIL=your-admin-email@gmail.com

CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
CLOUDINARY_URL=cloudinary://your-key:your-secret@your-cloud-name
```

Important:

- Do not commit `backend/.env`.
- Use a Gmail app password, not your normal Gmail password.
- After changing `.env`, restart the backend server.

### Frontend `.env.local`

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5008/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5008
```

After changing `.env.local`, restart the frontend server.

## Installation

### Backend

```bash
cd /Users/yasiru_nisal/Desktop/research/backend
npm install
```

### Frontend

```bash
cd /Users/yasiru_nisal/Desktop/research/frontend
npm install
```

### AI / ML

```bash
cd /Users/yasiru_nisal/Desktop/research/AI-Model-Train-main
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

On Windows PowerShell:

```powershell
cd AI-Model-Train-main
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Running The Full Project

### 1. Start MongoDB

Use local MongoDB or make sure your MongoDB Atlas connection string is configured in `backend/.env`.

### 2. Start Backend

```bash
cd /Users/yasiru_nisal/Desktop/research/backend
npm run dev
```

Backend runs at:

```text
http://localhost:5008
```

Health check:

```text
http://localhost:5008/api/health
```

### 3. Start Frontend

Open a second terminal:

```bash
cd /Users/yasiru_nisal/Desktop/research/frontend
npm run dev
```

Frontend runs at:

```text
http://localhost:3000
```

## Login And Registration URLs

| Role | Login | Register |
|---|---|---|
| Tourist | `http://localhost:3000/login` | `http://localhost:3000/register/tourist` |
| Hotel Owner | `http://localhost:3000/login/hotel-owner` | `http://localhost:3000/register/hotel-owner` |
| Activity Provider | `http://localhost:3000/login/activity-provider` | `http://localhost:3000/register/activity-provider` |
| Admin | `http://localhost:3000/login/admin` | Not public |

## Create Admin User

After backend `.env` is configured:

```bash
cd /Users/yasiru_nisal/Desktop/research/backend
npm run seed:admin
```

Then login from:

```text
http://localhost:3000/login/admin
```

## Main Tourist Pages

| Page | URL |
|---|---|
| Home | `http://localhost:3000` |
| Destinations | `http://localhost:3000/destinations` |
| Hotels | `http://localhost:3000/hotels` |
| Experiences | `http://localhost:3000/experiences` |
| Recommendations | `http://localhost:3000/recommendations` |
| AI Trip Planner | `http://localhost:3000/ai-trip-planner` |
| AI Assistant | `http://localhost:3000/ai-assistant` |
| Help | `http://localhost:3000/help` |
| Tourist Profile | `http://localhost:3000/dashboard` |
| AI Profile | `http://localhost:3000/dashboard/ai-profile` |
| Messages | `http://localhost:3000/dashboard/messages` |

## Role Dashboards

### Tourist

Tourists can:

- Register and verify email
- Complete preference onboarding
- Browse destinations, hotels, and experiences
- View personalized recommendations
- Use the AI trip planner
- Send booking requests
- Chat with providers
- Edit profile and review saved data

### Hotel Owner

Hotel owners can:

- Register and wait for admin approval
- Manage hotel profile
- Upload hotel images
- Add and update rooms
- Upload room images
- Manage amenities and facilities
- View hotel bookings
- Message tourists
- Review revenue and market insights

### Activity Provider

Activity providers can:

- Register and wait for admin approval
- Create and manage experiences
- Upload experience images
- Manage availability and calendar
- View experience bookings
- Message tourists
- Review revenue and AI insights

### Admin

Admins can:

- Approve or reject providers
- Approve or reject hotels and experiences
- Manage users
- Add and manage destinations
- Add destination blog content
- Review bookings
- View reports, analytics, commission, and AI monitoring pages
- Manage help requests

## Email Features

The backend sends emails for:

- Tourist email verification
- Resend verification email
- Forgot password
- Password reset
- Hotel owner registration confirmation
- Activity provider registration confirmation
- Admin notification for new provider registrations
- Provider account approval and rejection
- Hotel listing approval and rejection
- Experience listing approval and rejection
- Hotel booking request notification
- Experience booking request notification
- Booking status updates

Test email sending:

```bash
cd /Users/yasiru_nisal/Desktop/research/backend
npm run test:email -- your-email@gmail.com
```

Successful output should include:

```json
{
  "sent": true
}
```

## Cloudinary Uploads

Cloudinary is used to store uploaded images instead of saving large image files in MongoDB.

Current upload use cases:

- Hotel gallery images
- Room images
- Experience images

Make sure the Cloudinary variables exist in `backend/.env`, then restart the backend.

## AI / ML Workflow

Go to the model project:

```bash
cd /Users/yasiru_nisal/Desktop/research/AI-Model-Train-main
source .venv/bin/activate
```

Prepare data:

```bash
python src/prepare_data.py
```

Train models:

```bash
python src/train_svm.py
python src/train_xgboost.py
python src/train_random_forest.py
python src/train_knn.py
python src/train_adaboost.py
python src/train_lstm.py
```

Compare models:

```bash
python src/compare_models.py
```

Generate LSTM actual vs predicted tourism demand:

```bash
python src/lstm_actual_vs_predicted.py
```

Important output files:

```text
AI-Model-Train-main/results/model_comparison.csv
AI-Model-Train-main/results/lstm_actual_vs_predicted.csv
AI-Model-Train-main/models/
```

The strongest current classification model documented in the ML project is SVM. The LSTM model is used for tourism demand prediction, not direct recommendation classification.

## Useful Commands

### Backend

```bash
cd /Users/yasiru_nisal/Desktop/research/backend
npm run dev
npm run start
npm run seed:admin
npm run test:email -- your-email@gmail.com
```

### Frontend

```bash
cd /Users/yasiru_nisal/Desktop/research/frontend
npm run dev
npm run lint
npm run build
npm run start
```

### AI / ML

```bash
cd /Users/yasiru_nisal/Desktop/research/AI-Model-Train-main
source .venv/bin/activate
python src/prepare_data.py
python src/compare_models.py
python src/lstm_actual_vs_predicted.py
```

## Production Build Check

Before submitting or presenting the project:

```bash
cd /Users/yasiru_nisal/Desktop/research/frontend
npm run lint
npm run build
```

For backend:

```bash
cd /Users/yasiru_nisal/Desktop/research/backend
npm run start
```

## Common Problems

### Frontend cannot connect to backend

Check `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5008/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5008
```

Restart the frontend.

### Backend cannot connect to MongoDB

Check `backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/journiq
```

Make sure MongoDB is running.

### Emails are not sending

Check:

- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`
- `EMAIL_FROM`
- Spam folder
- Backend restart after `.env` changes

Then run:

```bash
npm run test:email -- your-email@gmail.com
```

### Image upload does not work

Check:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_URL`

Restart the backend after changes.

### Next.js image host error

If local uploaded images use backend URLs like `http://localhost:5008/uploads/...`, configure that hostname in `frontend/next.config.ts`. Cloudinary image URLs should also be allowed by the image configuration.

### XGBoost fails on macOS

If `train_xgboost.py` fails because `libomp.dylib` is missing, install OpenMP:

```bash
brew install libomp
```

Then rerun:

```bash
python src/train_xgboost.py
```

## Security Notes

- Never commit `.env` or `.env.local`.
- Never expose Gmail app passwords, JWT secrets, MongoDB credentials, or Cloudinary secrets in frontend code.
- Only `NEXT_PUBLIC_*` variables are safe for the browser.
- Booking creation should require logged-in tourist authentication.
- Admin actions should stay protected by role-based authorization.

## Stopping The Project

In each running backend or frontend terminal, press:

```text
Ctrl + C
```

## Documentation

Additional local documentation:

- `README.txt` - plain text run instructions
- `USER_MANUAL.txt` - user manual for tourist, provider, and admin workflows
- `AI-Model-Train-main/README.md` - machine learning pipeline documentation
