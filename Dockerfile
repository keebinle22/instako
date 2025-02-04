# Stage 1: Build the SSR frontend (e.g., Next.js)
FROM node:20 AS frontend

# Set working directory for frontend
WORKDIR /app/frontend

# Copy package.json and install dependencies
COPY ./frontend/instaApp/package*.json ./
RUN npm install

# Copy frontend source code
COPY ./frontend/instaApp/ .

# Build the SSR app
RUN npm run build

# Stage 2: Build the Spring Boot backend
FROM openjdk:11-jre-slim AS backend

# Set working directory for backend
WORKDIR /app/backend

# Copy Spring Boot JAR file (you should have already built it)
COPY ./server/target/instako-0.0.1.jar  instako-0.0.1.jar

# Stage 3: Final container combining frontend and backend
FROM openjdk:11-jre AS final

# Set working directory for both frontend and backend
WORKDIR /app

# Copy frontend from previous build stage
COPY --from=frontend /app/frontend /app/frontend

# Copy backend from previous build stage
COPY --from=backend /app/backend/instako-0.0.1.jar /app/backend/instako-0.0.1.jar

# Install necessary packages (e.g., for running both services)
RUN apt-get update && apt-get install -y \
    curl \
    bash\
    openjdk-11-jdk && apt-get clean
RUN echo "Checking Java installation..." && java -version || echo "Java not found"
RUN java -version
# Expose necessary ports
EXPOSE 5173 8080

# Start both services using a script (this is the key)
CMD ["sh", "-c", "node /app/frontend/server.js & java -jar /app/backend/instako-0.0.1.jar"]
