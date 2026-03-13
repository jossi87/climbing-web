FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN HUSKY=0 npm install --force --legacy-peer-deps

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]