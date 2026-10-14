FROM php:8.2-cli

WORKDIR /app

# 只複製 src 資料夾內的內容到 /app
COPY src/ /app

EXPOSE 80

CMD ["php", "-S", "0.0.0.0:80"]