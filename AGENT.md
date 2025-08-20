# Agent Guide for SMS Gateway Project

This document serves as a guide for AI agents (such as Codex) working on the SMS Gateway project. The goal of this project is to provide a scalable and reliable system for sending and receiving SMS messages.

## Project Structure

The project consists of two main backend services and a frontend (currently empty):

1.  **`sms-gateway-project/backend-server-a`**:
    *   **Purpose**: Responsible for sending SMS messages.
    *   **Technologies**: Go, RabbitMQ (for message queuing), Redis (for caching or rate limiting).
    *   **Responsibilities**: Receiving SMS sending requests, validation, queuing messages for dispatch, and managing dispatch status.

2.  **`sms-gateway-project/backend-server-b`**:
    *   **Purpose**: Responsible for receiving and processing incoming SMS messages and managing providers.
    *   **Technologies**: Go, PostgreSQL (for storing messages and provider information), RabbitMQ (for consuming incoming messages).
    *   **Responsibilities**: Receiving incoming SMS messages from various providers, storage, applying policies (Policy Engine), and managing communication with SMS providers.

3.  **`sms-gateway-project/frontend`**:
    *   **Purpose**: User interface (currently empty).
    *   **Technologies**: (To be determined in the future, but likely to include web frameworks like React/Vue/Angular).

## Instructions for the Agent

When working on this project, please consider the following points:

*   **Understand the Architecture**: Before making any changes, thoroughly understand the overall system architecture and the role of each service.
*   **Separation of Concerns**: Ensure that your changes are consistent with the separation of responsibilities for each service (sending in `backend-server-a` and receiving/processing in `backend-server-b`).
*   **Tool Usage**: Utilize available tools (such as `read_file`, `search_files`, `list_code_definition_names`, `apply_diff`, `write_to_file`, `execute_command`, `browser_action`) to gather information, apply changes, and verify functionality.
*   **Testing and Validation**: After applying changes, always test and validate the functionality.
*   **Unit Testing**: For any changes made to the main codebase, ensure that corresponding unit tests are written to cover the new or modified functionality.
*   **Documentation**: Update relevant documentation (e.g., README.md or code comments) as needed.
*   **Language**: Provide responses and explanations in English, unless specific instructions are given for another language.

By following these guidelines, the agent can effectively and efficiently contribute to the development and maintenance of the SMS Gateway project.