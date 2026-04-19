# 1. Chọn hệ điều hành Linux siêu nhẹ có cài sẵn Node.js
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

# Báo cho hệ thống biết dịch vụ này sẽ chạy ở cổng 3001
EXPOSE 3001

# Khởi động máy chủ khi container bắt đầu chạy
CMD ["node", "server.js"]