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

### 3. Start the stack

```bash
docker compose up -d        # builds on first run, ~2 min
```

When the containers turn **healthy**, browse to **[http://localhost:5000](http://localhost:5000)**.

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

| Symptom                                                         | Likely fix                                                              |
| --------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **`docker compose logs app` shows “Using fallback master key”** | Set `MASTER_SECRET` in `.env`                                           |
| **GitHub / Gmail actions fail**                                 | Double-check the token / App-Password JSON in *Settings*                |
| **Database errors**                                             | Ensure the `postgres` container is *healthy* and `DATABASE_URL` matches |

---

© 2025 AgenticHQ – GNU General Public License v3.0
