# AgenticHQ

A workflow-automation platform that combines AI planning with built-in GitHub and Gmail actions.

---

## Run Locally with Docker

### 1. Prerequisites
- **Docker Desktop** (or Docker Engine) and **Docker Compose** installed  
- A free GitHub PAT and/or Gmail App-Password **only if** you plan to use those features  

### 2. Clone & configure
```bash
git clone <repo-url>
cd agentichq
cp .env.example .env        # create local env file
````

Edit **`.env`** – the two lines below are the bare minimum:

```env
# DB connection used by the containers
DATABASE_URL=postgresql://agentichq:password@postgres:5432/agentichq

# Required for encrypting stored credentials
MASTER_SECRET=change-me
```

### 3. Start Postgres & apply the schema

1. Temporarily expose Postgres on port 5432 so Drizzle can connect from your host:

   ```yaml
   # (in your docker-compose.yml under `services → postgres`)
   ports:
     - "5432:5432"
   ```

2. Start only the Postgres container:

   ```bash
   docker compose up -d postgres
   ```

   Wait until you see `postgres` turn **Healthy**.

3. On your host machine, install devDependencies (so that `drizzle-kit` is available) and push the schema:

   ```bash
   npm install             # installs drizzle-kit (and all devDeps)
   DATABASE_URL=postgresql://agentichq:password@localhost:5432/agentichq \
   npm run db:push
   ```

   You should see output like “Applying … initial\_schema.sql … OK,” and all Drizzle tables (`secrets`, `clients`, `agents`, etc.) will be created.

4. Once `db:push` finishes, you can remove (or leave) the temporary port mapping. If you want to hide 5432 again, simply remove the `ports: ["5432:5432"]` entry and restart Postgres:

   ```bash
   docker compose down
   docker compose up -d
   ```

### 4. Start the full stack

```bash
docker compose up -d        # builds & starts all services (app + postgres)
```

When the containers turn **Healthy**, browse to **[http://localhost:5000](http://localhost:5000)**.

---

## Enabling Extras (optional)

| Feature                        | What you need                                                                            | Where to paste it            |
| ------------------------------ | ---------------------------------------------------------------------------------------- | ---------------------------- |
| **GitHub actions**             | Personal Access Token with `repo` + `user` scopes                                        | **Settings → GitHub**        |
| **Gmail send**                 | Gmail App-Password JSON: `{"email":"you@gmail.com","appPassword":"xxxx xxxx xxxx xxxx"}` | **Settings → Gmail**         |
| **AI LLM** (DeepSeek / OpenAI) | Relevant API key                                                                         | **Settings → LLM Providers** |

---

## Updating & stopping

```bash
docker compose pull        # grab new images (if published)
docker compose up -d       # rebuild & restart if sources changed
docker compose down        # stop and remove containers
```

---

## Troubleshooting quick-checks

| Symptom                                                         | Likely fix                                                                |
| --------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **`docker compose logs app` shows “Using fallback master key”** | Set `MASTER_SECRET` in `.env`                                             |
| **GitHub / Gmail actions fail**                                 | Double-check the token / App-Password JSON in *Settings*                  |
| **Database errors (relation ... does not exist)**               | 1. Ensure you ran `npm run db:push` after `docker compose up -d postgres` |
|                                                                 | 2. Check that `DATABASE_URL` matches your Postgres container credentials  |
|                                                                 | 3. Confirm Postgres is *Healthy* before starting the app                  |

---

© 2025 AgenticHQ – GNU General Public License v3.0
