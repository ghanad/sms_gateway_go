Task 1: Add Required Dependencies
Goal: To install the necessary libraries for password hashing and JWT handling.
Actions:
Navigate into the backend-server-b directory.
Add the following dependencies using go get:
golang.org/x/crypto/bcrypt (for securely hashing passwords)
github.com/golang-jwt/jwt/v5 (the standard library for working with JWTs)
Task 2: Create a Default Admin User (User Seeding)
Goal: To ensure at least one user exists in the system on the first run for initial login.
Actions:
In your .env.example (and .env) file, add the following variables for the default admin user:
code
Env
# Default Admin User (for initial setup)
DEFAULT_ADMIN_USERNAME="admin"
DEFAULT_ADMIN_PASSWORD="supersecretpassword"
JWT_SECRET_KEY="a-very-strong-and-long-secret-key"
In internal/repository, create a new file user_repository.go. Implement the methods GetUserByUsername(username string) and CreateUser(user *models.UIUser).
In internal/services, create a new file user_seeder.go.
Write a function SeedAdminUser that:
Reads the admin username and password from the application configuration.
Checks if a user with that username already exists in the database.
If the user does not exist, it should hash the default password using bcrypt.GenerateFromPassword and create the new admin user in the database.
Call this SeedAdminUser function in cmd/api/main.go immediately after connecting to the database and running the migrations.
Task 3: Implement the JWT Service
Goal: To create a centralized module for generating and validating JWTs.
Actions:
In internal/services, create a new file jwt_service.go.
Write a function GenerateToken(username string, userID uint, isAdmin bool) that:
Creates JWT claims, including username, userID, isAdmin, and an expiration time (exp).
Signs the token using the JWT_SECRET_KEY read from the configuration.
Returns the signed token string.
Write a function ValidateToken(tokenString string) that parses and validates a token string. If valid, it should return the token's claims; otherwise, return an error.
Task 4: Implement the Login Handler
Goal: To create an endpoint for authenticating users and issuing a token.
Actions:
In internal/api/handlers.go, create a new handler named LoginHandler.
Define a new struct for the login request body named LoginRequest, containing Username and Password fields.
The logic for the LoginHandler must be as follows:
a. Bind the incoming JSON request body to the LoginRequest struct.
b. Find the user in the database using userRepository.GetUserByUsername. If not found, return a 401 Unauthorized error.
c. Compare the provided password with the stored hash using bcrypt.CompareHashAndPassword. If they do not match, return a 401 Unauthorized error.
d. If authentication is successful, generate a new token using jwtService.GenerateToken.
e. Return the token in a JSON response (e.g., {"token": "..."}).
Task 5: Implement the Authentication Middleware
Goal: To protect API endpoints so that only authenticated users can access them.
Actions:
In internal/api, create a new file middleware.go.
Write a Gin middleware function named AuthMiddleware that:
Extracts the Authorization header from the request.
Validates that the header is in the format Bearer <token>.
Validates the token string using jwtService.ValidateToken.
If the token is invalid, it should abort the request with a 401 Unauthorized error.
If valid, it should extract user information from the token's claims (e.g., username, userID) and set it in the gin.Context for use in subsequent handlers, then call c.Next().
Task 6: Connect Routes and Middleware in main.go
Goal: To register the new login endpoint and apply the protective middleware to existing routes.
Actions:
Return to the cmd/api/main.go file.
Initialize the new services (UserRepository, JWTService).
Create a public route group for authentication:
code
Go
authRoutes := router.Group("/api/auth")
authRoutes.POST("/login", handlers.LoginHandler) // Pass necessary dependencies
```    4.  Create a protected route group for the main application API:
```go
apiRoutes := router.Group("/api")
apiRoutes.Use(api.AuthMiddleware()) // Apply the middleware
Move all previously existing routes (like GET /status/:tracking_id, POST /webhooks/..., etc.) to be under the apiRoutes group. This will automatically protect them and require a valid JWT.
Summary
By completing these tasks, your backend-server-b will have the following capabilities:
An admin user, with credentials defined in the .env file, will be automatically created on the first run.
A public endpoint at POST /api/auth/login will be available for users to log in.
All other API endpoints (for viewing message history, etc.) will be protected and will require a valid JWT to be sent in the Authorization header.
This is exactly what the frontend application needs to function correctly.