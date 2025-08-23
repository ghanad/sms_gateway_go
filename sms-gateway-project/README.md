# SMS Gateway Project

This repository contains the SMS Gateway system with backend services and a React frontend.

## Frontend

The React application lives in `frontend/` and was bootstrapped with Vite.

### Development

```bash
cd frontend
npm install
npm run gen:api
npm run dev
```

### Production Build

```bash
npm run build
```

The frontend relies on Material UI, React Router, Axios, and date-fns for its UI and data handling.

### Dockerization

The frontend application can be built and run using Docker. Refer to the `frontend/README.md` for detailed instructions.
