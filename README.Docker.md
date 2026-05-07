# Guardian Landing Docker

## Build image
```bash
docker build -t guardian-landing .
```

## Run container
```bash
docker run --rm -p 8080:80 guardian-landing
```

Landing will be available at: `http://localhost:8080`

## Health check
```bash
curl http://localhost:8080/health
```
