# Base Image
FROM node:20-alpine

WORKDIR /usr/app
# install dependencies
COPY ./package.json ./
RUN yarn install
COPY ./ ./

# Default command
RUN curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc \
    | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null \
    && echo "deb https://ngrok-agent.s3.amazonaws.com buster main" \
    | sudo tee /etc/apt/sources.list.d/ngrok.list \
    && sudo apt update \
    && sudo apt install ngrok

RUN ngrok config add-authtoken 2i5LxFqYgAlz3eybFsMZoUU5lFL_6isNBjSD4K4inkkQhpK18
RUN ngrok http http://localhost:8080 > /dev/null

RUN yarn build
CMD ["yarn", "start"]