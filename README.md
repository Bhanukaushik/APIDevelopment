# User API - RESTful API for Managing Users

## Overview

This project implements a RESTful API for managing user accounts and profiles. It provides endpoints for creating, reading, updating, and deleting user data. The API incorporates authentication using JWT (JSON Web Tokens), performance optimizations like caching and pagination, robust error handling, and comprehensive documentation using Swagger.

## Features

*   **User Account Management:**
    *   Registration: Create new user accounts.
    *   Login: Authenticate users and issue JWT tokens.
*   **User Profile Management:**
    *   Create: Create user profiles with detailed information.
    *   Read: Retrieve user profiles individually or in paginated lists.
    *   Update: Modify existing user profile data.
    *   Delete: Remove user profiles.
*   **Authentication:**
    *   Secure endpoints using JWT tokens.
*   **Performance Optimization:**
    *   Caching of frequently accessed data.
    *   Pagination for efficient retrieval of large datasets.
*   **Error Handling:**
    *   Comprehensive error handling with appropriate HTTP status codes and informative error messages.
*   **Documentation:**
    *   Interactive API documentation using Swagger UI.
*   **Security:**
    *   HTTPS enforcement
    *   Rate limiting to prevent abuse
    *   Security headers to protect against common web vulnerabilities

## Technologies Used

*   Node.js
*   Express.js
*   MongoDB with Mongoose
*   JSON Web Tokens (JWT)
*   bcrypt
*   memory-cache
*   dotenv
*   swagger-ui-express
*   swagger-jsdoc
*   helmet
*   cors
*   express-rate-limit
*   express-validator

## Setup Instructions

1.  **Clone the repository:**
    ```
    git clone https://github.com/Bhanukaushik/APIDevelopment.git
    cd <project_directory>
    ```

2.  **Install dependencies:**
    ```
    npm install
    ```

3.  **Configure environment variables:**
    *   Create a `.env` file in the root of the project.
    *   Add the following environment variables:

        ```
        PORT=3000                  # Optional, default is 3000
        MONGODB_URI=<your_mongodb_connection_string>  # Replace with your MongoDB connection string
        JWT_SECRET_KEY=<your_secret_key>       # Replace with a strong, random secret key
        ```

        **Important:** Replace `<your_mongodb_connection_string>` and `<your_secret_key>` with your actual values.  The secret key should be a long, random string.
4.  **Run the application:**
    ```
    npm start
    ```

5.  **Access the API:**
    *   The API will be running at `http://localhost:3000` (or the port you specified in your `.env` file).

6.  **View the Swagger UI:**
    *   Open your web browser and navigate to `http://localhost:3000/api-docs` to view the interactive API documentation.

## API Endpoints

### Authentication Endpoints

*   **`POST /auth/register`**: Register a new user account.

    *   **Request Body Example:**

        ```
        {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "securepassword"
        }
        ```

    *   **Response Codes:**
        *   `201 Created`: User registered successfully.
        *   `400 Bad Request`: Username already exists or invalid input data.
        *   `500 Internal Server Error`: Registration failed.
*   **`POST /auth/login`**: Authenticate a user and issue a JWT token.

    *   **Request Body Example:**

        ```
        {
            "username": "existinguser",
            "password": "correctpassword"
        }
        ```

    *   **Response Codes:**
        *   `200 OK`: JWT token issued successfully.
        *   `400 Bad Request`: Invalid credentials.
        *   `401 Unauthorized`: Invalid credentials.
        *   `500 Internal Server Error`: Login failed.

### User Profile Endpoints

*   **`POST /users`**: Create a new user profile (requires authentication).

    *   **Request Body Example:**

        ```
        {
            "name": "John Doe",
            "email": "john.doe@example.com",
            "phone": "555-123-4567"
        }
        ```

    *   **Headers:**
        *   `Authorization`: `Bearer <JWT_TOKEN>`
    *   **Response Codes:**
        *   `201 Created`: User profile created successfully.
        *   `401 Unauthorized`: Missing or invalid JWT token.
        *   `500 Internal Server Error`: Failed to create user profile.
*   **`GET /users`**: Retrieve a list of user profiles (requires authentication, supports pagination, sorting, and filtering).

    *   **Query Parameters:**
        *   `page`: Page number (optional, default: 1).
        *   `limit`: Number of results per page (optional, default: 10).
        *   `sortBy`: Field to sort by (optional, default: `createdAt`).
        *   `sortOrder`: Sort order (`asc` or `desc`, optional, default: `asc`).
    *   **Headers:**
        *   `Authorization`: `Bearer <JWT_TOKEN>`
    *   **Response Codes:**
        *   `200 OK`: List of user profiles retrieved successfully.
        *   `401 Unauthorized`: Missing or invalid JWT token.
        *   `500 Internal Server Error`: Failed to retrieve user profiles.
*   **`GET /users/:id`**: Retrieve a specific user profile by ID (requires authentication).

    *   **Parameters:**
        *   `id`: The ID of the user profile to retrieve.
    *   **Headers:**
        *   `Authorization`: `Bearer <JWT_TOKEN>`
    *   **Response Codes:**
        *   `200 OK`: User profile retrieved successfully.
        *   `401 Unauthorized`: Missing or invalid JWT token.
        *   `404 Not Found`: User profile not found.
        *   `500 Internal Server Error`: Failed to retrieve user profile.
*   **`PUT /users/:id`**: Update a specific user profile by ID (requires authentication).

    *   **Parameters:**
        *   `id`: The ID of the user profile to update.
    *   **Request Body Example:**

        ```
        {
            "name": "Updated Name",
            "email": "updated.email@example.com",
            "phone": "555-987-6543"
        }
        ```
    *   **Headers:**
        *   `Authorization`: `Bearer <JWT_TOKEN>`
    *   **Response Codes:**
        *   `200 OK`: User profile updated successfully.
        *   `401 Unauthorized`: Missing or invalid JWT token.
        *   `404 Not Found`: User profile not found.
        *   `500 Internal Server Error`: Failed to update user profile.
*   **`DELETE /users/:id`**: Delete a specific user profile by ID (requires authentication).

    *   **Parameters:**
        *   `id`: The ID of the user profile to delete.
    *   **Headers:**
        *   `Authorization`: `Bearer <JWT_TOKEN>`
    *   **Response Codes:**
        *   `204 No Content`: User profile deleted successfully.
        *   `401 Unauthorized`: Missing or invalid JWT token.
        *   `404 Not Found`: User profile not found.
        *   `500 Internal Server Error`: Failed to delete user profile.

## Usage Examples

Here are a few examples of how to use the API with `curl`:

*   **Register a new user:**

    ```
    curl -X POST http://localhost:3000/auth/register \
      -H "Content-Type: application/json" \
      -d '{
            "username": "testuser",
            "email": "test@example.com",
            "password": "password123"
        }'
    ```

*   **Login and obtain a JWT token:**

    ```
    curl -X POST http://localhost:3000/auth/login \
      -H "Content-Type: application/json" \
      -d '{
            "username": "testuser",
            "password": "password123"
        }'
    ```

*   **Create a new user profile (requires JWT token):**

    ```
    curl -X POST http://localhost:3000/users \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
      -d '{
            "name": "John Doe",
            "email": "john.doe@example.com",
            "phone": "555-123-4567"
        }'
    ```

*   **Get all user profiles (requires JWT token):**

    ```
    curl -X GET http://localhost:3000/users \
      -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
    ```

## Security Considerations

*   **HTTPS:** This API should always be served over HTTPS to encrypt communication between the client and server.
*   **JWT Security:** JWT tokens should be stored securely (e.g., using cookies with `httpOnly` and `secure` flags) to prevent XSS attacks. Refresh tokens can be used to reduce the lifespan of access tokens.
*   **Input Validation:** All user input should be validated to prevent injection attacks and data integrity issues.
*   **Rate Limiting:** Rate limiting is implemented to protect against abuse and denial-of-service attacks.
*   **Security Headers:** Security headers are used to protect against common web vulnerabilities.
*   **Dependencies:** Regularly review and update dependencies to patch security vulnerabilities.

## Performance Optimizations

*   **Caching:** The `GET /users` endpoint is cached to improve response times. The cache is invalidated when user profiles are created, updated, or deleted.
*   **Pagination:** The `GET /users` endpoint supports pagination to efficiently retrieve large datasets.
*   **Database Indexing:** Ensure that appropriate indexes are created in your MongoDB database to optimize query performance.

## Error Handling

The API implements comprehensive error handling to provide informative error messages and appropriate HTTP status codes for different error scenarios:

*   `400 Bad Request`: Invalid request data, validation errors.
*   `401 Unauthorized`: Missing or invalid authentication credentials.
*   `404 Not Found`: Resource not found.
*   `500 Internal Server Error`: Unexpected server error.

Error responses include a `message` field that describes the error and an `error` field (optional) with more detailed information.

## Contributing

Contributions to this project are welcome! Please follow these guidelines:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with clear, descriptive commit messages.
4.  Submit a pull request.

## License

[Choose a license for your project, e.g., MIT License]
