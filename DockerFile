# Grab the latest alpine image
FROM ubuntu:20.10

# Install python, pip & node, npm
RUN apt-get update && \
    apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y \
    make gcc g++ \
    python3 python3-pip nodejs && \
    rm -rf /var/lib/apt/lists/*

RUN npm install -g npm@7.19.1 \
    npm audit fix

# Copy the application
ADD ./web /opt/webapp

# Install dependencies
RUN cd /opt/webapp && npm ci && npm run build

ENV NODE_ENV="production"
WORKDIR /opt/webapp