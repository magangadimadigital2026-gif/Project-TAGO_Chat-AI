FROM node:22-alpine
WORKDIR /app

COPY package.json ./
RUN corepack enable && pnpm install --no-frozen-lockfile --ignore-scripts

COPY tsconfig.json drizzle.config.ts ./
COPY src ./src
COPY public ./public
RUN ./node_modules/.bin/tsc

ENV NODE_ENV=production
EXPOSE 3000
CMD ["sh", "-c", "pnpm db:push && node dist/src/index.js"]
