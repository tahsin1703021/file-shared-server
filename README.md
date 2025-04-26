# File Sharing Server

A Node.js-based file-sharing server that handles file uploads and downloads. The server is protected with rate-limiting and IP-based access control, ensuring security and efficiency. The server is designed to be used in conjunction with an Nginx reverse proxy to control access and rate-limiting for specific routes.

## Features
- **File Uploads**: Upload files to the server using a POST request to `/api/files`.
- **File Downloads**: Download files using a GET request to `/api/files/:publicKey`.
- **Rate Limiting**: Protects routes with rate-limiting, both globally and per IP.
- **IP-Based Access Control**: Only specific IPs can access the API routes.
- **Nginx Reverse Proxy**: Nginx acts as a reverse proxy to route traffic to the Node.js server, handling security and rate-limiting.


# The Node.js server listens for requests on port 3000 and provides two key routes:

- POST /api/files: Uploads a file to the server.

- GET /api/files/:publicKey: Downloads a file using the provided publicKey

# .env File
Ensure you have a .env file with the following variables:

- A sample env example file is present
- You need to add ALLOWED_HOST to the env to successfully upload and read files

# Installation
1. Clone the Repository
2. Set Up Docker Compose
3. Build and start the project using Docker Compose:
- docker-compose up --build
