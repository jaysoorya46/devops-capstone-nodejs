# DevOps Capstone Project — Node.js

An educational end-to-end CI/CD pipeline using GitHub, Jenkins, Docker, Docker Hub, AWS EC2, Prometheus, Grafana, Bash and cron.

## Architecture

Developer → GitHub → Jenkins (checkout, test, build, push) → Docker Hub → SSH deploy to AWS EC2 → Node.js app  
Prometheus scrapes `/metrics`; Grafana visualizes metrics. Bash scripts archive container logs and clean old backups.

## Requirements

- Node.js 20+ and npm for local development
- Git
- Docker Engine/Desktop
- GitHub repository
- Docker Hub account
- AWS account and Ubuntu EC2 instance
- Jenkins with Pipeline, Git, Credentials Binding and SSH Agent plugins
- Prometheus and Grafana (provided with `monitoring-compose.yml`)

## Run locally

```bash
npm install
npm test
npm start
```

Open `http://localhost:3000`, `http://localhost:3000/health`, and `http://localhost:3000/metrics`.

## Run with Docker

```bash
docker build -t devops-capstone-nodejs:local .
docker run --rm -p 3000:3000 --name devops-capstone-app devops-capstone-nodejs:local
```

## GitHub setup

Create an empty GitHub repository, then:

```bash
git init
git add .
git commit -m "Initial DevOps capstone app"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO.git
git push -u origin main
```

Replace the sample remote with your actual repository URL.

## Jenkins setup (overview)

1. Install Jenkins on a dedicated Ubuntu EC2 instance or a suitable lab VM.
2. Install Pipeline, Git, Credentials Binding and SSH Agent plugins.
3. Ensure the Jenkins agent that runs the pipeline has Node.js, npm, Docker CLI/daemon, curl and SSH client.
4. Add a Docker Hub credential (Username with password/token) using ID `dockerhub-credentials`.
5. Add the deployment SSH private key as an SSH Username with private key credential using ID `ec2-ssh-key`.
6. Update `IMAGE_NAME`, `APP_HOST`, and `APP_USER` in the Jenkinsfile for your environment. `IMAGE_NAME` must use your Docker Hub namespace.
7. Ensure the remote Ubuntu EC2 user can run Docker. Restrict SSH to your own IP.
8. Create a Pipeline job connected to the GitHub repo and use the repository `Jenkinsfile`.
9. Configure a GitHub webhook to trigger Jenkins, or enable polling for a lab.

**Security:** Do not commit SSH keys, cloud credentials, `.env` files, or Docker Hub tokens. Prefer Jenkins credentials and IAM roles. The sample pipeline is a learning template and must be tested in a non-production environment before use.

## AWS EC2 network rules

- SSH port 22: only your current public IP (not `0.0.0.0/0`).
- App port 3000: for a short demo, restrict to your own IP. For a public production app, use a reverse proxy/TLS and appropriate firewall rules.
- Keep Prometheus (9090) and Grafana (3001 in this sample) bound to localhost. Access them through SSH port forwarding, not public security-group rules.

## Monitoring

On the app EC2 host, copy `prometheus.yml` and `monitoring-compose.yml` into a directory. Confirm the app is reachable on host port 3000, then run:

```bash
docker compose -f monitoring-compose.yml up -d
```

Open monitoring dashboards securely with SSH tunnels from your computer:

```bash
ssh -i YOUR_KEY.pem -L 9090:127.0.0.1:9090 ubuntu@YOUR_EC2_HOST
ssh -i YOUR_KEY.pem -L 3001:127.0.0.1:3001 ubuntu@YOUR_EC2_HOST
```

Use `http://localhost:9090` for Prometheus and `http://localhost:3001` for Grafana. Grafana's first-run login is typically `admin`; set a strong password immediately. Add Prometheus data source URL `http://prometheus:9090` in Grafana. Create a dashboard with `app_uptime_seconds`, `app_memory_rss_bytes`, and `app_memory_heap_used_bytes`.

## Backups and cron

```bash
chmod +x scripts/*.sh
./scripts/backup.sh
./scripts/cleanup-logs.sh
./scripts/setup-cron.sh
crontab -l
```

The backup script archives app container logs. It is not a database backup. Test restore and retention policies before relying on it.

## Troubleshooting

- ``npm install` fails: check Node.js/npm versions and network access.
- Docker permission denied: configure Docker access for the Jenkins agent; avoid running untrusted builds with privileged access.
- SSH fails: check username, key, EC2 security group and host fingerprint handling.
- Jenkins cannot push: check Docker Hub credential ID and image namespace.
- Prometheus target down: confirm the app is running and host port 3000 is reachable from the Prometheus container.
- Port conflict: inspect `docker ps` and change the published host port if needed.

## Evidence to collect for submission

Take real screenshots of:
1. GitHub repository files and commits.
2. Successful Jenkins stages and console output.
3. Docker Hub image tags.
4. EC2 instance and application `/health` response.
5. Prometheus target showing `UP`.
6. Grafana dashboard with app metrics.
7. Cron entries and backup archive.

Do not submit fake screenshots or placeholder IPs as proof.
