# build
FROM node:22-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY ./package*.json ./
COPY ./bin ./bin
COPY ./config ./config

RUN npm config set loglevel verbose
RUN npm ci

RUN mkdir -p tmp public

# deploy
FROM gcr.io/distroless/nodejs22-debian12:latest
WORKDIR /app

COPY --from=builder --chown=nonroot:nonroot /app/ .

USER nonroot
EXPOSE 5570

CMD ["./bin/where-server.js", "./config"]
