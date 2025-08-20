Target Technology Stack:
Framework: React
Build Tool: Vite
UI Library: MUI (Material-UI)
HTTP Client: Axios
Routing: React Router DOM
Date Handling: date-fns (for formatting timestamps)
Task 1: Project Initialization and Dependency Installation
Goal: To set up a modern React project environment with all necessary libraries.
Actions:
Navigate to the project's root directory (sms-gateway-project).
Create the React project using Vite: npm create vite@latest frontend -- --template react.
Navigate into the new frontend directory: cd frontend.
Install the core dependencies: npm install.
Install the required libraries for the project:
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
npm install react-router-dom
npm install axios
npm install date-fns
npm install @mui/x-data-grid (For data tables)
npm install @mui/x-date-pickers (For date filtering)
Task 2: Project Structure, Routing, and Basic Layout
Goal: To establish a clean folder structure and a persistent layout (like a sidebar and top bar) for the application.
Actions:
Inside the src/ directory, create the following folders: pages, components, services, context, hooks.
In App.jsx, set up the main application router using react-router-dom.
Create a components/Layout.jsx component. This component should render a persistent MUI AppBar (top bar) and a Drawer (sidebar), with an <Outlet /> from React Router to render the current page's content.
Define the main routes in App.jsx, wrapping the protected pages inside the Layout component. Example routes: /login, / (dashboard), /messages, /messages/:trackingId, /admin/clients.
Task 3: Create a Centralized API Service Module
Goal: To manage all communications with backend-server-b in one place.
Actions:
In services/apiService.js, create an Axios instance with a baseURL pointing to the Server B API.
Implement an Axios request interceptor. This interceptor will read an auth token (JWT) from local storage and attach it as an Authorization: Bearer <token> header to every outgoing request.
Create and export functions for each API endpoint that the UI will need:
login(username, password)
getDashboardStats()
getMessages(filters) (filters can be an object with page, pageSize, recipient, status, etc.)
getMessageDetails(trackingId)
getClients() (for admins)
createClient(clientData) (for admins)
updateClient(clientId, clientData) (for admins)
Task 4: Implement Authentication and Global State
Goal: To manage user login status globally and protect routes that require authentication.
Actions:
In context/AuthContext.jsx, create a React Context to manage authentication state (user, token, isAuthenticated).
The AuthProvider component should provide login and logout functions.
The login function will call apiService.login, store the returned token and user info in local storage, and update the context state.
The logout function will clear local storage and reset the state.
Create a components/ProtectedRoute.jsx component. It will check the isAuthenticated value from the AuthContext. If the user is not authenticated, it will redirect them to the /login page.
Wrap all protected routes in App.jsx with this ProtectedRoute component.
Task 5: Build the Login Page
Goal: To create a form for users to authenticate with the system.
Actions:
Create the pages/LoginPage.jsx component.
Use MUI components like Card, TextField, and Button to build the login form.
Use useState to manage the username and password inputs.
On form submission, call the login function from the AuthContext.
Upon a successful login, the user should be automatically redirected to the dashboard (/).
Display any error messages received from the API during a failed login attempt.
Task 6: Build the Dashboard Page
Goal: To provide an at-a-glance overview of the system's status.
Actions:
Create the pages/DashboardPage.jsx component.
Use a useEffect hook to call apiService.getDashboardStats() when the component mounts.
Use MUI components like Grid, Card, Typography, and CircularProgress (for loading state) to display the statistics (e.g., total messages sent, daily quota usage, provider statuses).
Handle loading and error states gracefully.
Task 7: Build the Message History Page
Goal: To display a searchable and filterable list of all sent messages.
Actions:
Create the pages/MessageHistoryPage.jsx component.
Add filter controls at the top using MUI components: TextField (for tracking ID/recipient), Select (for status), and DatePicker (for a date range).
Use the MUI DataGrid component to display the list of messages. Configure its columns (tracking_id, recipient, status, provider, created_at).
Manage the component's state (filters, messages, rowCount, paginationModel, loading) with useState and useEffect.
The useEffect hook should re-fetch data from apiService.getMessages(filters) whenever the filters or paginationModel state changes. The DataGrid component is designed to work with server-side pagination.
Make each tracking_id in the table a link that navigates the user to the corresponding message detail page.
Task 8: Build the Message Detail Page
Goal: To show the complete history and details for a single message.
Actions:
Create the pages/MessageDetailPage.jsx component.
Use the useParams hook from React Router to get the trackingId from the URL.
In a useEffect, call apiService.getMessageDetails(trackingId) to fetch the message data.
Display the primary message information (recipient, text, current status) in a Card or Paper component.
Display the message's event history (MessageEvent records) in a clear, chronological order. The MUI Timeline component is an excellent choice for this.
Task 9: Build the Admin Client Management Page
Goal: To allow administrators to create and manage API clients.
Actions:
Create an AdminRoute.jsx component, similar to ProtectedRoute, that also checks if user.isAdmin is true.
Create the pages/admin/ClientManagementPage.jsx and protect it with the AdminRoute.
Use a DataGrid to list all existing clients, fetched from apiService.getClients(). Columns should include name, api_key, daily_quota, is_active.
Add a "Create New Client" button that opens an MUI Modal containing a form.
The form should allow an admin to set the client's name and daily_quota. The api_key should be generated by the backend and displayed to the admin once upon successful creation.
Implement functionality to edit existing clients (e.g., change quota, deactivate).
Task 10: Configure Environment Variables
Goal: To manage the API URL without hardcoding it.
Actions:
In the frontend root directory, create a .env file.
Add the base URL for backend-server-b: VITE_API_BASE_URL=http://localhost:8081.
Update the Axios instance in services/apiService.js to use import.meta.env.VITE_API_BASE_URL.
Provide the command to build the application for production: npm run build.