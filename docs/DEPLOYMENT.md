# EC2 Docker Compose Deployment

This guide deploys InterviewMate to a single EC2 instance with Docker Compose.

Current target architecture:

```text
User
  -> EC2:80
  -> frontend Nginx container
     -> Vue static files
     -> /api/v1/* proxy
  -> backend NestJS container
  -> postgres container
```

This guide does not include GitLab CI/CD, Route 53, HTTPS, RDS, Terraform, or ECS yet.

## Files

```text
frontend/Dockerfile
frontend/nginx.conf
backend/Dockerfile
docker-compose.prod.yml
.env.production.example
docs/DEPLOYMENT.md
```

## Prerequisites

On EC2:

- Docker installed
- Docker Compose plugin installed
- Project directory created at `/home/ubuntu/interviewmate`
- Security Group allows inbound TCP `80`
- Security Group allows inbound TCP `22` from your IP

## 1. Upload or clone the project

On EC2:

```bash
cd /home/ubuntu/interviewmate
```

Place the project files in this directory. The compose file should exist here:

```bash
ls docker-compose.prod.yml
```

## 2. Create the production env file

```bash
cd /home/ubuntu/interviewmate
cp .env.production.example .env.production
nano .env.production
```

Fill real values in `.env.production`.

Important:

- Do not commit `.env.production`.
- Keep `DB_HOST=postgres` for Docker Compose.
- Use the same values for `DB_USERNAME` and `POSTGRES_USER`.
- Use the same values for `DB_PASSWORD` and `POSTGRES_PASSWORD`.
- Use the same values for `DB_DATABASE` and `POSTGRES_DB`.
- Set `CORS_ORIGIN` to the real browser origin, for example `http://YOUR_EC2_PUBLIC_IP`.
- Keep `AI_MODE=mock` for the first infrastructure test. Change it to `openai` after the service is reachable.

## 3. Build and start

```bash
cd /home/ubuntu/interviewmate
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

Check containers:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production ps
```

Check logs:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f frontend
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f backend
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f postgres
```

## 4. Verify

Open:

```text
http://YOUR_EC2_PUBLIC_IP
```

The frontend container serves the Vue app through Nginx.

API requests use this path:

```text
http://YOUR_EC2_PUBLIC_IP/api/v1
```

Nginx proxies `/api/v1/*` to the backend container:

```text
backend:3000/api/v1/*
```

## 5. Stop, restart, update

Stop:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production down
```

Restart:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

Rebuild after code changes:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

## 6. Database data

PostgreSQL data is stored in a Docker named volume:

```text
postgres_data
```

Uploaded resume files are stored in:

```text
backend_uploads
```

List volumes:

```bash
docker volume ls
```

Connect to PostgreSQL:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production exec postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
```

## 7. Schema note

The backend currently disables TypeORM `synchronize` when `NODE_ENV=production`.

That is the safer production default, but it means the PostgreSQL schema must exist before production traffic. If this project does not have migrations yet, prepare the schema before using real data. Options:

- add proper TypeORM migrations and run them during deployment
- initialize the schema manually from a trusted schema dump
- for a temporary test-only environment, run with development synchronization once, then switch back to production

Do not use automatic schema synchronization for real production data.

## 8. Useful troubleshooting

Check backend environment inside the container:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production exec backend env
```

Check Nginx config:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production exec frontend nginx -t
```

Restart only one service:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production restart backend
```

View recent backend logs:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production logs --tail=100 backend
```

## 9. Next steps

After Docker Compose deployment works:

1. Add GitLab CI/CD for automated EC2 deploys.
2. Connect a Route 53 domain.
3. Add HTTPS with Nginx and Certbot.
4. Move PostgreSQL from Docker Compose to RDS.
5. Code VPC, EC2, and RDS with Terraform.
6. Move containers to ECS Fargate with ALB.
7. Code ECS, ALB, ACM, and Route 53 with Terraform.
