# Frontend Application

This directory contains the frontend application for the SMS Gateway project. It is a React application built with Vite.

The interface uses [Tailwind CSS](https://tailwindcss.com/) via the CDN script included in `index.html`, allowing rapid UI prototyping without additional build steps.

## Dockerization

To build and run the frontend application using Docker, follow these steps:

1.  **Build the Docker image:**
    Navigate to the `sms-gateway-project/frontend/` directory in your terminal and run the following command:
    ```bash
    docker build -t sms-gateway-frontend .
    ```

2.  **Run the Docker container:**
    After building the image, you can run the container:
    ```bash
    docker run -p 80:80 sms-gateway-frontend
    ```
This will map port 80 of the container to port 80 on your host machine. You can then access the application in your browser at `http://localhost`.

## Toast Notifications

The frontend includes a simple toast notification system located in `src/context/ToastContext.jsx`. It is already wired into `App.jsx` so that any component can trigger toasts.

To display a toast message from a component:

```jsx
import { useToast } from '../context/ToastContext.jsx';

function Example() {
  const { addToast } = useToast();

  return (
    <button onClick={() => addToast('Saved!', 'success')}>
      Save
    </button>
  );
}
```

Supported toast types are `success`, `error`, `warning`, and `info` (default).