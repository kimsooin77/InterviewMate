# EC2 Deployment with GitLab Container Registry

This guide deploys InterviewMate to a single EC2 instance with Docker Compose, but Docker images are built in GitLab CI/CD and pushed to GitLab Container Registry.

EC2 does not run `npm build` or `docker build`.

## Target Architecture

```text
Developer pushes to main
  -> GitLab CI/CD
     -> build frontend Docker image
     -> build backend Docker image
     -> push images to GitLab Container Registry
     -> SSH into EC2
        -> git pull
        -> docker login
        -> docker compose pull
        -> docker compose up -d

User
  -> EC2:80
  -> frontend Nginx container
     -> Vue static files
     -> /api/v1/* proxy
  -> backend NestJS container
  -> postgres container
```

This stage does not include Route 53, HTTPS, RDS, Terraform, or ECS.

## Changed Files

```text
docker-compose.prod.yml
.gitlab-ci.yml
docs/DEPLOYMENT.md
```

Existing Dockerfiles are still used by GitLab CI/CD:

```text
frontend/Dockerfile
backend/Dockerfile
```

## Docker Compose Behavior

`docker-compose.prod.yml` no longer has `build:` sections for `frontend` or `backend`.

It uses images from GitLab Container Registry:

```yaml
backend:
  image: ${CI_REGISTRY_IMAGE}/backend:${IMAGE_TAG:-latest}

frontend:
  image: ${CI_REGISTRY_IMAGE}/frontend:${IMAGE_TAG:-latest}
```

The `postgres` service still runs from the official PostgreSQL image.

## GitLab CI/CD Variables

Set these variables in:

```text
GitLab project -> Settings -> CI/CD -> Variables
```

Required variables:

```text
EC2_HOST
EC2_USER
EC2_SSH_PRIVATE_KEY
EC2_APP_DIR
```

Recommended values:

```text
EC2_HOST=YOUR_EC2_PUBLIC_IP
EC2_USER=ubuntu
EC2_APP_DIR=/home/ubuntu/interviewmate
```

`EC2_SSH_PRIVATE_KEY` must be the private key that can SSH into the EC2 instance.

GitLab automatically provides these registry variables:

```text
CI_REGISTRY
CI_REGISTRY_IMAGE
CI_REGISTRY_USER
CI_REGISTRY_PASSWORD
CI_COMMIT_SHORT_SHA
```

Optional variable:

```text
VITE_API_BASE_URL=/api/v1
```

If omitted, `.gitlab-ci.yml` uses `/api/v1`.

## EC2 Environment File

The real environment file remains on EC2:

```text
/home/ubuntu/interviewmate/.env.production
```

Do not commit this file.

Add these image-related values to `.env.production`:

```env
CI_REGISTRY_IMAGE=registry.gitlab.com/YOUR_GROUP/YOUR_PROJECT
IMAGE_TAG=latest
```

Keep the application values in the same file:

```env
NODE_ENV=production
PORT=3000
HTTP_PORT=80

CORS_ORIGIN=http://YOUR_EC2_PUBLIC_IP

DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=interviewmate
DB_PASSWORD=CHANGE_ME
DB_DATABASE=interview_mate

POSTGRES_USER=interviewmate
POSTGRES_PASSWORD=CHANGE_ME
POSTGRES_DB=interview_mate

JWT_SECRET=CHANGE_ME_LONG_RANDOM_SECRET
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

AI_MODE=mock
USE_MOCK_AI=false
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=2000

UPLOAD_MAX_FILE_SIZE=10485760
```

Important:

- `DB_HOST` must stay `postgres` while PostgreSQL runs in Docker Compose.
- `DB_USERNAME` and `POSTGRES_USER` should match.
- `DB_PASSWORD` and `POSTGRES_PASSWORD` should match.
- `DB_DATABASE` and `POSTGRES_DB` should match.
- Keep `AI_MODE=mock` for the first infrastructure test.

## First-Time EC2 Setup

On EC2:

```bash
cd /home/ubuntu
git clone <YOUR_REPOSITORY_URL> interviewmate
cd /home/ubuntu/interviewmate
git checkout main
```

Create the production env file:

```bash
cp .env.production.example .env.production
nano .env.production
```

Make sure `.env.production` includes:

```env
CI_REGISTRY_IMAGE=registry.gitlab.com/YOUR_GROUP/YOUR_PROJECT
IMAGE_TAG=latest
```

## Manual Pull and Start on EC2

If you want to test manually after the images have been pushed:

```bash
cd /home/ubuntu/interviewmate
docker login registry.gitlab.com
docker compose -f docker-compose.prod.yml --env-file .env.production pull
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

Do not use:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

That command would build on EC2, which this deployment flow intentionally avoids.

## Automatic Deployment

Push to `main`:

```bash
git push origin main
```

GitLab CI/CD runs:

```text
build_backend
build_frontend
deploy_production
```

The deploy job connects to EC2 and runs:

```bash
cd /home/ubuntu/interviewmate
git fetch origin
git checkout main
git pull origin main
docker login registry.gitlab.com
docker compose -f docker-compose.prod.yml --env-file .env.production pull
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

## Verify on EC2

Check containers:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production ps
```

Check logs:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production logs --tail=100 backend
docker compose -f docker-compose.prod.yml --env-file .env.production logs --tail=100 frontend
docker compose -f docker-compose.prod.yml --env-file .env.production logs --tail=100 postgres
```

Open:

```text
http://YOUR_EC2_PUBLIC_IP
```

## Database Data

PostgreSQL data is stored in the Docker named volume:

```text
postgres_data
```

Uploaded resume files are stored in:

```text
backend_uploads
```

Connect to PostgreSQL:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production exec postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
```

## Schema Note

The backend disables TypeORM `synchronize` when `NODE_ENV=production`.

That is safer for production, but the PostgreSQL schema must exist before real traffic.

Options:

- add TypeORM migrations and run them during deployment
- initialize the schema manually from a trusted schema dump
- for a temporary test-only environment, run with development synchronization once, then switch back to production

Do not use automatic schema synchronization for real production data.

## Troubleshooting

If EC2 cannot pull images:

```bash
docker login registry.gitlab.com
docker compose -f docker-compose.prod.yml --env-file .env.production pull
```

If Compose says `CI_REGISTRY_IMAGE is required`, add this to `.env.production`:

```env
CI_REGISTRY_IMAGE=registry.gitlab.com/YOUR_GROUP/YOUR_PROJECT
```

If the frontend starts but API calls fail, check:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production logs --tail=100 backend
docker compose -f docker-compose.prod.yml --env-file .env.production exec frontend nginx -t
```

If a new commit is deployed but the app looks old:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production pull
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
docker image ls | grep interviewmate
```

## Next Steps

After GitLab Registry deployment works:

1. Connect a Route 53 domain.
2. Add HTTPS with Nginx and Certbot.
3. Move PostgreSQL from Docker Compose to RDS.
4. Code VPC, EC2, and RDS with Terraform.
5. Move containers to ECS Fargate with ALB.
6. Code ECS, ALB, ACM, and Route 53 with Terraform.
