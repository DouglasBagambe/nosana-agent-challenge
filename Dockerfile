FROM ollama/ollama:0.7.0

# Groq API Configuration
ENV API_BASE_URL=https://api.groq.com/openai/v1
ENV MODEL_NAME_AT_ENDPOINT=llama-3.1-8b-instant
ENV GROQ_API_KEY=

# Install system dependencies and Node.js
RUN apt-get update && apt-get install -y \
  curl \
  && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get install -y nodejs \
  && rm -rf /var/lib/apt/lists/* \
  && npm install -g pnpm

# Create app directory
WORKDIR /app

# Copy package files
COPY .env.docker package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy the rest of the application
COPY . .

# Build the project
RUN pnpm run build

# Override the default entrypoint
ENTRYPOINT ["/bin/sh", "-c"]

# Directly run the application
CMD ["node .mastra/output/index.mjs"]
