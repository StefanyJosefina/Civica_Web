FROM python:3.10

WORKDIR /app

COPY . /app

COPY backend/requirements.txt /app/requirements.txt

ENV PORT=8000

CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port $PORT"]
