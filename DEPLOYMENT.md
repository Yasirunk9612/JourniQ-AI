# JourniQ AI Free Docker Deployment

## Best Option

Use one Docker web service on Render for the university/demo deployment.

This project has a frontend, backend, Socket.IO, and a Python SVM script that depends on files beside the backend. A single container keeps this structure:

```text
/app/backend
/app/AI-Model-Train-main
```

Nginx exposes one public URL, sends `/` to Next.js, and sends `/api`, `/socket.io`, and `/uploads` to Express.

Render still has a free web service tier as of September 10, 2026, but it has demo-level limits: 512 MB RAM, monthly usage limits, idle spin-down after 15 minutes, no persistent disk, and outbound SMTP ports `25`, `465`, and `587` are blocked on free services. Use Gmail SMTP for local testing; for deployed email on Render free, prefer an HTTP email API provider or expect SMTP to fail.

## One Image Or Separate Services

Use one image for the demo:

- One Render free web service gives one public URL.
- No separate frontend/backend domains are needed.
- Socket.IO works through `/socket.io` on the same host.
- CORS can be locked to the same public URL.
- The backend can keep loading models from `../AI-Model-Train-main`.

Use separate services only for a more production-like setup. That is cleaner long term, but it usually needs two public URLs or a paid/private network setup.

## What Is Included

- `Dockerfile`: builds Next.js, installs backend dependencies, installs Python SVM packages, copies AI model files.
- `docker/nginx.conf.template`: reverse proxy for frontend, API, uploads, and Socket.IO.
- `docker/supervisord.conf`: runs backend, frontend, and Nginx in the same container.
- `docker/start.sh`: renders Nginx config using Render's `PORT`.
- `docker-compose.yml`: local Docker test setup.
- `render.yaml`: Render blueprint for GitHub deployment.
- `AI-Model-Train-main/requirements-docker.txt`: small Python runtime dependency list for live SVM inference.

## TensorFlow

TensorFlow is not needed for the current live recommendation feature.

The deployed recommender runs `backend/ml/svm_recommend.py`, which loads:

- `svm_model.pkl`
- `tfidf_vectorizer.pkl`
- `numeric_scaler.pkl`
- `numeric_columns.pkl`
- `prepared_master_dataframe.pkl`

Those files use `pandas`, `numpy`, `scipy`, `scikit-learn`, and `joblib`. The LSTM `.keras` file is kept in the image for your project record, but it is not used by the live SVM recommendation endpoint. Installing TensorFlow would make the image much larger and may exceed free-tier memory/build limits.

## Required Environment Variables

Set secrets only in Render's Environment tab. Do not commit real values to GitHub.

```env
NODE_ENV=production
BACKEND_PORT=5008
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL=/api
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<database>?retryWrites=true&w=majority
JWT_SECRET=<long-random-secret>
JWT_EXPIRES_IN=7d
CORS_ORIGINS=https://journiq-ai.onrender.com
FRONTEND_URL=https://journiq-ai.onrender.com
PUBLIC_URL=https://journiq-ai.onrender.com
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
GMAIL_USER=<gmail-address>
GMAIL_APP_PASSWORD=<gmail-app-password>
EMAIL_FROM=JourniQ AI <gmail-address>
ADMIN_NOTIFY_EMAIL=<admin-email>
```

After Render creates the URL, update `CORS_ORIGINS`, `FRONTEND_URL`, and `PUBLIC_URL` to the exact `https://...onrender.com` URL.

## MongoDB Atlas

1. Create a free Atlas M0 cluster.
2. Create a database user with a strong password.
3. Add Render outbound access in Network Access. For a demo, `0.0.0.0/0` is easiest, but restrict it later if you move beyond demo use.
4. Copy the connection string into `MONGO_URI`.
5. Use Cloudinary for uploads because Render free local files are ephemeral.

## Deploy From GitHub On Render

1. Push this repository to GitHub.
2. Go to Render Dashboard.
3. Choose `New` then `Blueprint`.
4. Connect the GitHub repository.
5. Render reads `render.yaml`.
6. Choose the free instance type if prompted.
7. Add all secret environment variables marked `sync: false`.
8. Deploy.
9. Open `https://<your-service>.onrender.com/api/health`.

Alternative manual setup:

1. Choose `New` then `Web Service`.
2. Connect the GitHub repository.
3. Runtime: `Docker`.
4. Dockerfile path: `./Dockerfile`.
5. Health check path: `/api/health`.
6. Add the environment variables.
7. Deploy.

## Local Docker Test

From the repository root:

```bash
docker compose up --build
```

Open:

```text
http://localhost:10000
http://localhost:10000/api/health
```

## Deployment Tests

Use your deployed URL as `BASE_URL`.

Health:

```bash
curl "$BASE_URL/api/health"
```

Login:

```bash
curl -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-password"}'
```

AI recommendations:

```bash
curl -X POST "$BASE_URL/api/public/recommendations" \
  -H "Content-Type: application/json" \
  -d '{"preferences":"beach culture food","country":"India","budget":"medium","type":"all","district":"Galle","limit":6}'
```

Cloudinary uploads:

- Log in as a hotel owner or activity provider.
- Create or edit a listing with an image.
- Confirm the saved image URL starts with `https://res.cloudinary.com/...`.
- Restart or redeploy the service and confirm the image still loads.

Published image checks:

- Open `/hotels`, `/experiences`, and `/destinations`.
- Right-click a broken image and open it in a new tab.
- If the URL contains `localhost`, `127.0.0.1`, or `/uploads`, redeploy with `PUBLIC_URL` set to your Render URL.
- New uploaded images should use Cloudinary URLs. Old local `/uploads/...` images only work if those files are present in `backend/uploads` when the Docker image is built.

Email:

```bash
cd backend
npm run test:email -- your-email@example.com
```

For Render free, Gmail SMTP may fail because outbound SMTP ports are blocked. If email is required in the deployed demo, switch the backend to an HTTP email provider API.

Socket.IO:

- Log in to two accounts in two browsers.
- Open the chat UI.
- Send a message.
- Confirm the second browser receives it without refreshing.
- In browser devtools, check that `/socket.io/` connects to the same Render domain.

## Notes For Free Hosting

- Render free services sleep after idle time, so the first request can be slow.
- Do not store user uploads on local disk.
- Keep TensorFlow out of the runtime image unless you add a live LSTM endpoint.
- Keep model and CSV files committed if they are small enough for GitHub. If they become too large, use Git LFS or download them during build from a trusted storage location.
