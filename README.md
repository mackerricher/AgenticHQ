# AgenticHQ

An intelligent full-stack workflow automation platform that leverages AI to streamline task planning, execution, and management with enhanced GitHub and Gmail integration.

## Features

- **AI-Powered Workflow Planning**: Uses DeepSeek LLM to generate and execute multi-step plans
- **Real GitHub Integration**: Create repositories, add files, and manage projects using Octokit
- **Gmail SMTP Support**: Send emails using Gmail with App Password authentication
- **Client-Agent Architecture**: Organize workflows with clients, agents, and sub-agents
- **Real-time Plan Execution**: Watch step-by-step progress with live status updates
- **Secure Secret Management**: Encrypted storage of API keys and credentials
- **Modern UI**: Clean, responsive interface with dark/light theme support

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: DeepSeek API, OpenAI API support
- **External APIs**: GitHub (Octokit), Gmail (Nodemailer)

## Quick Start with Docker

### Prerequisites

- Docker and Docker Compose installed
- Gmail account with 2FA enabled (for email features)
- GitHub Personal Access Token (for repository features)
- DeepSeek API key (for AI planning)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd agentichq
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` file with your credentials:

```bash
# Database
DATABASE_URL=postgresql://agentichq:password@postgres:5432/agentichq

# Security
MASTER_SECRET=your-secure-master-key-for-encryption

# Optional: LLM Provider API Keys
OPENAI_API_KEY=your-openai-api-key
DEEPSEEK_API_KEY=your-deepseek-api-key
```

### 3. Start the Application

```bash
docker-compose up -d
```

The application will be available at `http://localhost:5000`

### 4. Configure Integrations

Navigate to Settings (gear icon) to configure:

#### GitHub Integration
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Create a token with `repo` and `user` scopes
3. Add token in AgenticHQ Settings → GitHub tab

#### Gmail Integration
1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account Settings → Security → 2-Step Verification
3. Generate an App Password for "Mail"
4. Add credentials in AgenticHQ Settings → Gmail tab using format:
   ```json
   {"email": "your@gmail.com", "appPassword": "xxxx xxxx xxxx xxxx"}
   ```

#### LLM Provider
- Add your DeepSeek or OpenAI API key in Settings → LLM Providers tab

## Development Setup

### Local Development (without Docker)

```bash
# Install dependencies
npm install

# Setup database
npm run db:push

# Start development server
npm run dev
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `MASTER_SECRET` | Encryption key for secrets | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Optional |
| `DEEPSEEK_API_KEY` | DeepSeek API key | Optional |

## Usage Examples

### Create a GitHub Repository
```
"Create a new GitHub repository called 'my-project' with description 'My awesome project'"
```

### Send Email Notifications
```
"Send an email to team@company.com with subject 'Project Update' and body 'The project is complete'"
```

### Combined Workflows
```
"Create a GitHub repo for my blog project and email me when it's ready"
```

## API Endpoints

- `POST /api/chat` - Send chat message and execute workflow
- `GET /api/chat/history` - Get conversation history
- `POST /api/keys/{provider}` - Save API credentials
- `GET /api/keys/{provider}` - Check credential status
- `GET /api/plans/{id}` - Get plan execution details

## Database Schema

The application uses PostgreSQL with the following main tables:
- `users` - User accounts
- `secrets` - Encrypted API credentials
- `chat_messages` - Conversation history
- `plans` - Workflow execution plans
- `plan_executions` - Step-by-step execution logs
- `clients` - Workflow client configurations
- `agents` - AI agent definitions
- `sub_agents` - Specialized agent components

## Security

- All API credentials are encrypted using AES-256-GCM
- Environment variables for sensitive configuration
- Secure session management
- Rate limiting on API endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

[License information]

## Support

For issues and questions:
1. Check the GitHub Issues page
2. Review the configuration in Settings
3. Verify API credentials are correctly formatted
4. Check server logs for detailed error messages

## Troubleshooting

### Common Issues

**Gmail "Authentication failed"**
- Ensure 2FA is enabled on your Gmail account
- Use App Password, not your regular password
- Verify JSON format: `{"email": "...", "appPassword": "..."}`

**GitHub "Invalid token"**
- Check token has `repo` and `user` scopes
- Ensure token hasn't expired
- Verify token format starts with `ghp_`

**Database connection issues**
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists and is accessible

**LLM API errors**
- Verify API key is valid and has sufficient credits
- Check API endpoint availability
- Review rate limiting constraints