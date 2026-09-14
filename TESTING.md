# JourniQ AI Testing

This project now has a practical full-system smoke test runner. It does not replace manual QA, but it checks the most important wiring across the frontend, backend, local images, and Python SVM recommender.

## Offline checks

Run from the repository root:

```bash
node scripts/full-system-check.mjs
```

This checks:
- required local Sri Lankan images exist
- home page mood cards are wired to local images
- backend routes are mounted
- Python SVM recommender runs and returns valid JSON shape
- backend JavaScript files pass syntax checks

## Frontend checks

```bash
cd frontend
npm run test:smoke
npm run lint
npm run build
```

`npm run test:smoke` checks public image/card wiring.

## Live end-to-end smoke checks

Start backend and frontend first, then run:

```bash
RUN_LIVE=1 \
API_BASE_URL=http://localhost:5008 \
FRONTEND_BASE_URL=http://localhost:3000 \
node scripts/full-system-check.mjs
```

This adds checks for:
- `/api/health`
- public destinations, hotels, experiences APIs
- recommendations API
- public frontend pages

## Optional tourist auth check

If you have a verified tourist account:

```bash
RUN_LIVE=1 \
TEST_TOURIST_EMAIL='tourist@example.com' \
TEST_TOURIST_PASSWORD='password' \
node scripts/full-system-check.mjs
```

This checks login and `/api/auth/me`.

## Manual QA still required

Because this app uses MongoDB Atlas, Cloudinary, Gmail, Socket.IO, and protected role dashboards, these flows should still be manually verified before submission:
- register tourist, hotel owner, activity provider
- verify email and login
- admin approve hotels/providers
- Cloudinary upload from admin destinations, hotel profile, rooms, and experiences
- Gmail verification/reset emails
- Socket.IO chat between tourist and provider/owner
- create hotel and experience booking requests
