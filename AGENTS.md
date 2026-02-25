# Agent Integration Guide: OpenClaw Gemini Proxy

This document provides technical instructions for AI agents (like OpenClaw or Gemini CLI sub-agents) to interact with this proxy.

## Protocol Specification

The proxy communicates via HTTP/JSON.

### 1. Sending Commands (`/message`)
Use this endpoint to execute a prompt against the Gemini CLI. The proxy automatically appends `--yolo` and `-p` to ensure non-interactive execution.

- **URL**: `http://localhost:3000/message`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "content": "string (the prompt to execute)"
  }
  ```
- **Success Response**: `200 OK` with `{ "response": "string" }`

### 2. File Synchronization (`/files`)
Use this endpoint to push markdown files or context into the workspace before running a command.

- **URL**: `http://localhost:3000/files`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "name": "string (relative path/filename)",
    "content": "string (file content)"
  }
  ```
- **Constraint**: The `name` must resolve within the current working directory. Path traversal (e.g., `../`) is blocked with a `403 Forbidden`.

### 3. Scheduling Automation (`/cron`)
Use this to set up recurring checks or automated tasks.

- **URL**: `http://localhost:3000/cron`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "schedule": "string (standard cron expression)",
    "message": "string (the prompt to run on schedule)"
  }
  ```

## Agent Guidelines

- **Statelessness**: Each `/message` call starts a fresh CLI session. For persistent state, use the `--resume` flag within your `content` if supported by the CLI, or ensure your context is uploaded via `/files`.
- **Error Handling**: 
  - `400`: Missing required fields.
  - `403`: Unauthorized path access.
  - `500`: CLI execution failure or internal error.
- **Automation**: Do not attempt to provide manual input. The proxy is designed for headless execution.
- **Sub-Agents**: When acting as a sub-agent, you can use this proxy to bridge between discord-style messaging and the local CLI environment.
