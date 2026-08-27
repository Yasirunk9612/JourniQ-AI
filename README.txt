JOURNIQ AI - FULL PROJECT RUN INSTRUCTIONS
=========================================

Project location:
/Users/yasiru_nisal/Desktop/research

This project has three main parts:

1. backend
   Express.js API, MongoDB, JWT authentication, Cloudinary uploads, Gmail emails,
   Socket.IO chat, public booking APIs, admin APIs, hotel owner APIs, and activity
   provider APIs.

2. frontend
   Next.js App Router, React, TypeScript, Tailwind CSS, tourist website, admin
   dashboard, hotel owner dashboard, activity provider dashboard, AI pages, auth,
   profile, booking, chat, and email verification pages.

3. AI-Model-Train-main
   Python machine learning training scripts, dataset, trained models, model
   comparison results, and LSTM actual-vs-predicted output.


REQUIRED SOFTWARE
=================

Install these before running the project:

- Node.js 20 or newer
- npm
- MongoDB running locally or MongoDB Atlas connection string
- Python 3.10 or newer
- pip


BACKEND SETUP
=============

Open a terminal:

cd /Users/yasiru_nisal/Desktop/research/backend
npm install

Create or update backend/.env:

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

Important:
- Do not commit backend/.env.
- Gmail app passwords may be shown with spaces. The backend removes spaces
  automatically before sending emails.
- For Gmail app password, enable 2-Step Verification in Google Account settings,
  then create an App Password.


RUN BACKEND
===========

Development:

cd /Users/yasiru_nisal/Desktop/research/backend
npm run dev

Production-style:

cd /Users/yasiru_nisal/Desktop/research/backend
npm run start

Backend URL:
http://localhost:5008

Health check:
http://localhost:5008/api/health


CREATE ADMIN USER
=================

Run this after backend .env is configured:

cd /Users/yasiru_nisal/Desktop/research/backend
npm run seed:admin

Then login from:
http://localhost:3000/login/admin


TEST EMAIL SENDING
==================

Use this to confirm Gmail SMTP works:

cd /Users/yasiru_nisal/Desktop/research/backend
npm run test:email -- your-email@gmail.com

If successful, terminal output should include:

{
  "sent": true
}


FRONTEND SETUP
==============

Open another terminal:

cd /Users/yasiru_nisal/Desktop/research/frontend
npm install

Create or update frontend/.env.local:

NEXT_PUBLIC_API_URL=http://localhost:5008/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5008


RUN FRONTEND
============

Development:

cd /Users/yasiru_nisal/Desktop/research/frontend
npm run dev

Frontend URL:
http://localhost:3000

Production build test:

cd /Users/yasiru_nisal/Desktop/research/frontend
npm run build
npm run start

Lint:

cd /Users/yasiru_nisal/Desktop/research/frontend
npm run lint


LOGIN URLS
==========

Tourist login:
http://localhost:3000/login

Tourist registration:
http://localhost:3000/register/tourist

Hotel owner login:
http://localhost:3000/login/hotel-owner

Hotel owner registration:
http://localhost:3000/register/hotel-owner

Activity provider login:
http://localhost:3000/login/activity-provider

Activity provider registration:
http://localhost:3000/register/activity-provider

Admin login:
http://localhost:3000/login/admin


MAIN USER PAGES
===============

Home:
http://localhost:3000

Destinations:
http://localhost:3000/destinations

Hotels:
http://localhost:3000/hotels

Experiences:
http://localhost:3000/experiences

Recommendations:
http://localhost:3000/recommendations

AI Trip Planner:
http://localhost:3000/ai-trip-planner

AI Assistant:
http://localhost:3000/ai-assistant

Help:
http://localhost:3000/help

Tourist profile:
http://localhost:3000/dashboard


EMAIL FEATURES
==============

The backend sends emails for:

- Tourist email verification
- Resend verification email
- Forgot password
- Reset password
- Hotel owner registration confirmation
- Activity provider registration confirmation
- Admin notification when a provider registers
- Provider account approval or rejection
- Hotel listing approval or rejection
- Experience listing approval or rejection
- Hotel booking request notification
- Experience booking request notification
- Booking status updates

Email-related frontend pages:

http://localhost:3000/verify-email
http://localhost:3000/forgot-password
http://localhost:3000/reset-password


CLOUDINARY IMAGE UPLOADS
========================

Cloudinary is used by backend upload middleware for hotel, room, and experience
images.

Make sure these values exist in backend/.env:

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_URL=...

After changing .env, restart the backend.


AI / ML MODEL SETUP
===================

Open a terminal:

cd /Users/yasiru_nisal/Desktop/research/AI-Model-Train-main

Create virtual environment:

python3 -m venv .venv

Activate it:

source .venv/bin/activate

Install Python dependencies:

pip install -r requirements.txt


RUN AI MODEL TRAINING
=====================

Prepare data:

cd /Users/yasiru_nisal/Desktop/research/AI-Model-Train-main
source .venv/bin/activate
python src/prepare_data.py

Train SVM:

python src/train_svm.py

Train XGBoost:

python src/train_xgboost.py

Train Random Forest:

python src/train_random_forest.py

Train KNN:

python src/train_knn.py

Train AdaBoost:

python src/train_adaboost.py

Train LSTM:

python src/train_lstm.py

Compare models:

python src/compare_models.py

Generate LSTM actual vs predicted tourism demand:

python src/lstm_actual_vs_predicted.py


AI OUTPUT FILES
===============

Model comparison CSV:

/Users/yasiru_nisal/Desktop/research/AI-Model-Train-main/results/model_comparison.csv

LSTM actual vs predicted CSV:

/Users/yasiru_nisal/Desktop/research/AI-Model-Train-main/results/lstm_actual_vs_predicted.csv

Trained models:

/Users/yasiru_nisal/Desktop/research/AI-Model-Train-main/models

Dataset:

/Users/yasiru_nisal/Desktop/research/AI-Model-Train-main/data/tourism_ai_master_dataset_v2_full.csv


RECOMMENDED RUN ORDER
=====================

1. Start MongoDB.
2. Start backend:

   cd /Users/yasiru_nisal/Desktop/research/backend
   npm run dev

3. Start frontend in a second terminal:

   cd /Users/yasiru_nisal/Desktop/research/frontend
   npm run dev

4. Open:

   http://localhost:3000

5. Seed admin if needed:

   cd /Users/yasiru_nisal/Desktop/research/backend
   npm run seed:admin

6. Test email if needed:

   cd /Users/yasiru_nisal/Desktop/research/backend
   npm run test:email -- your-email@gmail.com


COMMON PROBLEMS
===============

1. Frontend cannot connect to backend

Check frontend/.env.local:

NEXT_PUBLIC_API_URL=http://localhost:5008/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5008

Restart frontend after changing .env.local.

2. Backend cannot connect to MongoDB

Check backend/.env:

MONGO_URI=mongodb://localhost:27017/journiq

Make sure MongoDB is running.

3. Emails are not sending

Check backend/.env:

GMAIL_USER=yourgmail@gmail.com
GMAIL_APP_PASSWORD=your-google-app-password
EMAIL_FROM=JourniQ AI <yourgmail@gmail.com>

Then run:

npm run test:email -- your-email@gmail.com

Restart backend after changing .env.

4. Admin approval email not received

Make sure:

- backend server was restarted after code changes
- provider user has a real email
- Gmail test email works
- email is not in spam

5. Image upload does not work

Check Cloudinary variables in backend/.env and restart backend.

6. Next.js image localhost error

Check frontend/next.config.ts and make sure localhost backend image host is
configured if local uploads are used.


STOPPING THE PROJECT
====================

In each terminal running backend or frontend, press:

Ctrl + C


QUICK COMMAND SUMMARY
=====================

Backend:

cd /Users/yasiru_nisal/Desktop/research/backend
npm install
npm run dev

Frontend:

cd /Users/yasiru_nisal/Desktop/research/frontend
npm install
npm run dev

ML:

cd /Users/yasiru_nisal/Desktop/research/AI-Model-Train-main
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python src/compare_models.py
python src/lstm_actual_vs_predicted.py

