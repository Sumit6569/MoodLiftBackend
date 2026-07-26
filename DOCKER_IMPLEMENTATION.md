# Docker Containerization Implementation Details

This document outlines the implementation of Docker and Docker Compose for the MoodLift Backend services. The goal was to containerize each microservice individually and orchestrate them using Docker Compose for a consistent local development environment.

## 1. Dockerfile Implementation

We utilized a **Multi-Stage Build** process for each service (User, Session, Chat, Payment, AI, Feedback). This approach ensures that our final production images are lightweight and secure, containing only the necessary artifacts to run the application, without the full development toolchain.

### Key Features of the Dockerfile:

*   **Base Image**: `node:20-alpine`
    *   **Why**: Alpine Linux is extremely lightweight (checking in at roughly 5MB for the base OS), which significantly reduces the final image size and attack surface.
*   **Stage 1: Builder**:
    *   Installs ALL dependencies (including `devDependencies`).
    *   Runs the build script (`npm run build`) to transpile code (optional for pure JS, but good practice for future TypeScript logic).
    *   Runs `npm prune --omit=dev` to remove development dependencies before copying to the final image.
*   **Stage 2: Runner**:
    *   Starts fresh from `node:20-alpine`.
    *   Copies only the `package.json`, production `node_modules`, and the built `dist/` folder from the Builder stage.
    *   Sets `NODE_ENV=production` for performance optimizations.
    *   Exposes the specific service port (e.g., 3001 for User Service).

### Example Dockerfile Structure (User Service):

```dockerfile
# --- Builder Stage ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci                  # Clean install based on lockfile
COPY . .
RUN npm run build           # Build the application
RUN npm prune --omit=dev    # Remove devDeps

# --- Runner Stage ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3001
CMD ["node", "dist/index.cjs"] # Assumes commonjs output
```

## 2. Docker Compose Implementation

The `docker-compose.yml` file orchestrates all microservices, allowing them to run simultaneously with a single command.

### Key Configuration Details:

*   **Services**: Defined a service block for each microservice (`user-service`, `session-service`, etc.).
*   **Build Context**: Each service is built from its respective directory (`./user-service`, etc.) using its own `Dockerfile`.
*   **Port Mapping**:
    *   Maps the container port to the host port (e.g., `"3001:3001"`).
    *   This allows you to access the API locally via `localhost:3001` while the services communicate internally.
*   **Environment Variables**:
    *   Uses `env_file` directive (e.g., `- ./user-service/.env`) to inject environment variables securely.
    *   This ensures that secrets (like DB URIs, API Keys) are not hardcoded in the Compose file.
*   **Restart Policy**: `restart: unless-stopped` ensures services automatically recover if they crash.

### Service Definition Example:

```yaml
  user-service:
    build:
      context: ./user-service
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    env_file:
      - ./user-service/.env
    restart: unless-stopped
```

## 3. Notable Changes & Improvements

1.  **Consistent Environment**: By using Docker, we eliminated "it works on my machine" issues. Everyone running `docker-compose up` gets the same Node.js version and dependencies.
2.  **Network Isolation**: Services run in their own containers but share a default Docker network, facilitating easy communication if needed (though currently, they are accessed via mapped ports).
3.  **Optimized Image Sizes**: The move to multi-stage Alpine builds reduced image sizes significantly compared to standard Node images.
4.  **Simplified Startup**: Instead of running 6 separate terminal commands (`npm run dev` in each folder), the entire backend stack is launched with `docker-compose up --build`.

## 4. How to Run

1.  Ensure Docker Desktop is running.
2.  Navigate to the `MoodLiftBackend` directory.
3.  Run:
    ```bash
    docker-compose up --build
    ```
4.  The services will handle their own MongoDB connections as defined in their respective `.env` files.
