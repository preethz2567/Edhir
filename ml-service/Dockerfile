FROM python:3.10-slim
WORKDIR /app
COPY pyproject.toml .
COPY ml_service ./ml_service
RUN pip install --no-cache-dir .
EXPOSE 8000
CMD ["uvicorn", "ml_service.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
