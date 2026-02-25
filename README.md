# OpenClaw Gemini Proxy

A local proxy service that enables OpenClaw to interact with the Gemini CLI. This proxy handles TTY simulation, automated CLI execution, file management, and scheduled tasks.

## Features

- **Automated CLI Interaction**: Launches the Gemini CLI in non-interactive mode using `-p` and `--yolo` flags.
- **TTY Simulation**: Uses `node-pty` to simulate a terminal environment for the CLI.
- **Local Service**: Provides a RESTful API for OpenClaw to send messages and receive CLI output.
- **File Management**: Endpoint to upload markdown files directly into the proxy's workspace.
- **Scheduled Tasks**: Built-in cron job support to run CLI commands at specific intervals.
- **TDD Backed**: Developed with Test-Driven Development, achieving 100% code coverage.

## Installation

```bash
npm install
```

## Usage

### Starting the Proxy

```bash
npm start
```
The service will listen on port 3000 by default (configurable via `PORT` environment variable).

### API Endpoints

- **POST `/message`**: Send a prompt to the Gemini CLI.
  - Body: `{ "content": "your prompt here" }`
  - Response: `{ "response": "CLI output here" }`

- **POST `/files`**: Upload a file to the workspace.
  - Body: `{ "name": "filename.md", "content": "file content here" }`
  - Response: `{ "success": true }`

- **POST `/cron`**: Schedule a recurring task.
  - Body: `{ "schedule": "* * * * *", "message": "prompt to run" }`
  - Response: `{ "success": true, "schedule": "* * * * *" }`

## Development and Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```
