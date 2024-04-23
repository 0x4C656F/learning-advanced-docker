FROM node:18-alpine as build

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npm run build


FROM node:18-alpine as production

WORKDIR /usr/src/app

EXPOSE 8000

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/prisma ./prisma/

CMD ["npm", "run", "start:migrate:prod"]