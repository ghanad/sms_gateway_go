Target Technology Stack:
Language: Go (Golang)
Web Framework: Gin
Database ORM: GORM with PostgreSQL driver
RabbitMQ Client: amqp091-go
Configuration Manager: godotenv
UUID Generator: google/uuid
Task 1: Project Initialization and Dependency Installation
Goal: To set up the Go project environment and add all necessary libraries.
Actions:
Navigate into the backend-server-b directory.
Initialize the Go module: go mod init sms-gateway/backend-server-b.
Add the following dependencies using go get:
github.com/gin-gonic/gin
github.com/joho/godotenv
github.com/rabbitmq/amqp091-go
github.com/google/uuid
gorm.io/gorm (for the ORM)
gorm.io/driver/postgres (for the PostgreSQL driver)
Task 2: Implement the Configuration Module
Goal: To load application settings, including database credentials and provider API keys.
Actions:
Create a .env.example file in the root of backend-server-b with the following variables:
code
Env
# Server Configuration
LISTEN_ADDR=":8081"

# Database Configuration
DATABASE_URL="postgres://user:password@localhost:5432/sms_gateway_db"

# RabbitMQ Configuration
RABBITMQ_URL="amqp://guest:guest@localhost:5672/"
RABBITMQ_QUEUE_NAME="sms_sending_queue"

# External SMS Provider Configurations (as a JSON string)
PROVIDERS_CONFIG='{
  "Provider-A": {"api_url": "https://provider-a.com/send", "api_key": "key-for-provider-a"},
  "Provider-B": {"api_url": "https://provider-b.com/sms", "api_key": "key-for-provider-b"}
}'
In internal/config, create config.go. Define a Config struct to hold these settings and a LoadConfig() function to load them from the environment.
Task 3: Set Up Database Connection and Models
Goal: To define the database schema using GORM models and establish a connection.
Actions:
In a new directory internal/database, create a file database.go. Write a function ConnectDatabase(dsn string) that initializes a GORM DB instance and returns it.
In a new directory internal/models, create a file models.go. Define the GORM model structs for the database schema described in the architecture document:
Message: To store message details (tracking_id, recipient, status, etc.).
MessageEvent: To store the history of a message's lifecycle.
Client: To store API client information (mirrors the config in Server A, but managed via the UI).
UIUser: For web panel user accounts.
ClientUserAssociation: The many-to-many link table.
In your database.go, add a function AutoMigrate(db *gorm.DB) that runs db.AutoMigrate(...) for all the defined models.
Task 4: Implement the Provider Integration Layer (Adapters)
Goal: To create a modular system for sending SMS through different external providers.
Actions:
In a new directory internal/providers, create an interface file interface.go. Define an interface named SmsProvider:
code
Go
type SmsProvider interface {
    Send(message models.Message) (providerResponse string, err error)
    GetName() string
}
For each provider in your config (e.g., Provider-A), create a corresponding file like provider_a.go.
In each file, create a struct (e.g., ProviderAAdapter) that implements the SmsProvider interface. The Send method will contain the specific logic for calling that provider's HTTP API.
Create a factory.go file in the providers directory. Write a function GetProvider(name string, config ProviderConfig) that returns an instance of the correct provider adapter based on the name.
Task 5: Implement the RabbitMQ Consumer (Worker)
Goal: To listen for incoming messages from RabbitMQ and trigger the processing logic.
Actions:
In a new directory internal/worker, create consumer.go.
Define a Consumer struct that holds dependencies like the RabbitMQ channel and the policy engine service (to be created next).
Write a StartConsumer() method that:
Connects to RabbitMQ and declares the queue.
Starts consuming messages from the queue (channel.Consume).
Runs in a loop, receiving amqp.Delivery messages.
For each message, unmarshal the JSON body into a MessagePayload struct.
Pass the payload to the Sending Policy Engine for processing.
Handle message acknowledgements: msg.Ack(false) on success, msg.Nack(false, true) on a temporary failure to requeue.
Run this consumer in a separate goroutine from the main function.
Task 6: Implement the State Management Layer (Repository)
Goal: To create a dedicated layer for all database interactions, abstracting GORM calls.
Actions:
In a new directory internal/repository, create message_repository.go.
Define a MessageRepository struct that holds the *gorm.DB instance.
Implement methods for all required database operations:
CreateInitialMessage(trackingID, recipient, text): Inserts a new message with QUEUED status.
UpdateMessageStatus(trackingID, newStatus, providerRef): Updates the status of a message.
GetMessageByTrackingID(trackingID): Retrieves a message and its events.
FindMessageByProviderRef(providerRef): Finds a message using the ID returned by the provider (essential for webhooks).
CreateMessageEvent(trackingID, eventDescription): Adds a new event to the message history.
Task 7: Implement the Sending Policy Engine
Goal: To orchestrate the core logic of selecting a provider and handling failovers.
Actions:
In a new directory internal/services, create policy_engine.go.
Define a PolicyEngine struct that holds the MessageRepository and a map of all available SmsProvider adapters.
Create a method ProcessMessage(payload MessagePayload). This is the main function.
Inside ProcessMessage, implement the logic described in the architecture document:
a. Use the repository to update the message status to PROCESSING.
b. Analyze the payload.Providers list.
c. Smart Selection: If the list is empty, choose a default provider.
d. Exclusive Choice: If the list has one item, try sending only through that provider.
e. Prioritized Failover: If the list has multiple items, iterate through them, trying each one until a send is successful.
f. For each attempt, call the Send() method of the corresponding provider adapter.
g. Upon success, update the message status to SENT using the repository and store the provider's reference ID.
h. Upon final failure (after all retries and failovers), update the status to FAILED.
Task 8: Implement the External API Endpoints (Handlers)
Goal: To expose the status-check and delivery-report webhook APIs.
Actions:
In a new directory internal/api, create handlers.go.
GetStatusHandler:
Takes {tracking_id} from the URL path.
Calls the MessageRepository.GetMessageByTrackingID method.
Returns the message details as JSON or a 404 Not Found error.
DeliveryWebhookHandler:
Takes {provider} from the URL path to identify the sender.
Parses the provider-specific webhook payload from the request body.
Extracts the provider's message ID.
Uses MessageRepository.FindMessageByProviderRef to find the corresponding message in your DB.
Updates the message status to DELIVERED or FAILED_DELIVERY based on the webhook content.
Returns a 200 OK response to the provider.
Task 9: Connect All Components in main.go
Goal: To initialize all modules and start the consumer and web server.
Actions:
In cmd/api/main.go:
Load the configuration.
Connect to the database and run auto-migrations.
Initialize the MessageRepository.
Initialize all configured SmsProvider adapters.
Initialize the PolicyEngine with the repository and providers.
Initialize the Consumer with the policy engine.
Start the Consumer in a new goroutine: go myConsumer.StartConsumer().
Set up the Gin router and register the API routes (GET /api/status/:tracking_id and POST /webhooks/delivery-report/:provider), injecting the repository into the handlers.
Start the Gin web server.
Task 10: Create a Dockerfile for Deployment
Goal: To build an optimized and production-ready Docker image for the service.
Actions:
Create a Dockerfile in the root of backend-server-b.
Use the same multi-stage build pattern as Server A:
Stage 1 (build): Use a golang image to compile the application into a static binary.
Stage 2 (final): Use a minimal alpine image, copy the binary from the build stage, and also copy any necessary static assets if required.
EXPOSE the application's port and set the CMD to run the binary.