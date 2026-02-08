# Docker MCP Server - Usage Examples

This document provides practical examples of using the Docker MCP Server with GitHub Copilot, Claude, and other MCP-compatible AI assistants.

## Remote Docker Configuration Examples

### Example 1: Connecting to Remote Docker via TCP

**Configuration (VS Code `~/.vscode/mcp-settings.json`):**
```json
{
  "mcpServers": {
    "docker-remote": {
      "command": "node",
      "args": ["/path/to/Docker-MCP/dist/index.js"],
      "env": {
        "DOCKER_HOST": "tcp://192.168.1.100:2375"
      }
    }
  }
}
```

**Usage:**
Once configured, you can use natural language prompts to manage containers on the remote host:
```
"List all containers on the remote Docker host"
"Run nginx on the remote server on port 8080"
```

### Example 2: Connecting to Remote Docker via HTTPS with TLS

**Configuration:**
```json
{
  "mcpServers": {
    "docker-secure": {
      "command": "node",
      "args": ["/path/to/Docker-MCP/dist/index.js"],
      "env": {
        "DOCKER_HOST": "https://production-server:2376",
        "DOCKER_TLS_VERIFY": "1",
        "DOCKER_CERT_PATH": "/home/user/.docker/prod-certs"
      }
    }
  }
}
```

**Usage:**
```
"Show me all running containers on the production server"
"Deploy the latest version of my-app:v2.0 on production"
```

### Example 3: Multiple Docker Hosts

**Configuration:**
```json
{
  "mcpServers": {
    "docker-local": {
      "command": "node",
      "args": ["/path/to/Docker-MCP/dist/index.js"]
    },
    "docker-staging": {
      "command": "node",
      "args": ["/path/to/Docker-MCP/dist/index.js"],
      "env": {
        "DOCKER_HOST": "tcp://staging.example.com:2375"
      }
    },
    "docker-production": {
      "command": "node",
      "args": ["/path/to/Docker-MCP/dist/index.js"],
      "env": {
        "DOCKER_HOST": "https://prod.example.com:2376",
        "DOCKER_TLS_VERIFY": "1",
        "DOCKER_CERT_PATH": "/home/user/.docker/prod-certs"
      }
    }
  }
}
```

**Usage:**
```
"@docker-local list containers"
"@docker-staging deploy my-app:latest"
"@docker-production check system info"
```

### Example 4: SSH Tunnel Setup

**Step 1: Create SSH Tunnel**
```bash
# Start SSH tunnel in background
ssh -fNL 2375:/var/run/docker.sock user@remote-server

# Or with autossh for automatic reconnection
autossh -M 0 -fNL 2375:/var/run/docker.sock user@remote-server
```

**Step 2: MCP Configuration**
```json
{
  "mcpServers": {
    "docker-ssh": {
      "command": "node",
      "args": ["/path/to/Docker-MCP/dist/index.js"],
      "env": {
        "DOCKER_HOST": "tcp://localhost:2375"
      }
    }
  }
}
```

**Usage:**
```
"Connect to the tunneled Docker and list all containers"
"Run a test container on the remote host via SSH tunnel"
```

## Basic Container Operations

### Example 1: Run a Simple Web Server

**Natural Language Prompt:**
```
"Run an nginx web server named 'my-web-server' and expose it on port 8080"
```

**Expected MCP Tool Call:**
```json
{
  "tool": "run_container",
  "arguments": {
    "image": "nginx:latest",
    "name": "my-web-server",
    "exposedPorts": {
      "80/tcp": {}
    },
    "hostConfig": {
      "PortBindings": {
        "80/tcp": [{"HostPort": "8080"}]
      }
    }
  }
}
```

### Example 2: Run a Python Application with Environment Variables

**Natural Language Prompt:**
```
"Create a Python container that runs 'python app.py' with environment variables DEBUG=true and API_KEY=secret123"
```

**Expected MCP Tool Call:**
```json
{
  "tool": "run_container",
  "arguments": {
    "image": "python:3.9",
    "command": ["python", "app.py"],
    "env": ["DEBUG=true", "API_KEY=secret123"]
  }
}
```

### Example 3: Container with Multiple Commands and Volume Mounts

**Natural Language Prompt:**
```
"Run a Ubuntu container that executes 'bash -c echo Hello World', mount /tmp/data to /app/data, and set environment variables ENV=dev and LOG_LEVEL=debug"
```

**Expected MCP Tool Call:**
```json
{
  "tool": "run_container",
  "arguments": {
    "image": "ubuntu:latest",
    "command": ["bash", "-c", "echo Hello World"],
    "env": ["ENV=dev", "LOG_LEVEL=debug"],
    "hostConfig": {
      "Binds": ["/tmp/data:/app/data"]
    }
  }
}
```

### Example 4: Database Container with Custom Configuration

**Natural Language Prompt:**
```
"Create a PostgreSQL database container named 'my-postgres' on port 5432 with POSTGRES_PASSWORD=mypassword and POSTGRES_DB=myapp"
```

**Expected MCP Tool Call:**
```json
{
  "tool": "run_container",
  "arguments": {
    "image": "postgres:latest",
    "name": "my-postgres",
    "env": [
      "POSTGRES_PASSWORD=mypassword",
      "POSTGRES_DB=myapp"
    ],
    "exposedPorts": {
      "5432/tcp": {}
    },
    "hostConfig": {
      "PortBindings": {
        "5432/tcp": [{"HostPort": "5432"}]
      }
    }
  }
}
```

## Container Management

### Example 5: List All Containers

**Natural Language Prompt:**
```
"Show me all Docker containers including stopped ones"
```

**Expected MCP Tool Call:**
```json
{
  "tool": "list_containers",
  "arguments": {
    "all": true
  }
}
```

### Example 6: Stop and Remove a Container

**Natural Language Prompt:**
```
"Stop the container named 'my-web-server' and remove it"
```

**Expected MCP Tool Calls:**
```json
// First call
{
  "tool": "stop_container",
  "arguments": {
    "containerId": "my-web-server",
    "timeout": 10
  }
}

// Second call
{
  "tool": "remove_container",
  "arguments": {
    "containerId": "my-web-server",
    "force": false
  }
}
```

### Example 7: View Container Logs

**Natural Language Prompt:**
```
"Show me the last 50 lines of logs from container 'my-web-server'"
```

**Expected MCP Tool Call:**
```json
{
  "tool": "container_logs",
  "arguments": {
    "containerId": "my-web-server",
    "tail": 50,
    "follow": false
  }
}
```

## Image Operations

### Example 8: Pull a Specific Image

**Natural Language Prompt:**
```
"Pull the redis:7-alpine Docker image"
```

**Expected MCP Tool Call:**
```json
{
  "tool": "pull_image",
  "arguments": {
    "image": "redis:7-alpine"
  }
}
```

### Example 9: List All Available Images

**Natural Language Prompt:**
```
"List all Docker images on this system"
```

**Expected MCP Tool Call:**
```json
{
  "tool": "list_images",
  "arguments": {
    "all": false
  }
}
```

## Advanced Use Cases

### Example 10: Development Environment Setup

**Natural Language Prompt:**
```
"Set up a development environment with:
- Node.js 18 container named 'dev-node' with working directory /app
- Redis container named 'dev-redis' on port 6379
- Mount my current directory to /app in the Node container"
```

**Expected MCP Tool Calls:**
```json
// First: Pull images if needed
{
  "tool": "pull_image",
  "arguments": {"image": "node:18"}
}
{
  "tool": "pull_image",
  "arguments": {"image": "redis:latest"}
}

// Second: Create Redis
{
  "tool": "run_container",
  "arguments": {
    "image": "redis:latest",
    "name": "dev-redis",
    "exposedPorts": {"6379/tcp": {}},
    "hostConfig": {
      "PortBindings": {"6379/tcp": [{"HostPort": "6379"}]}
    }
  }
}

// Third: Create Node.js container
{
  "tool": "run_container",
  "arguments": {
    "image": "node:18",
    "name": "dev-node",
    "command": ["tail", "-f", "/dev/null"],
    "hostConfig": {
      "Binds": ["$(pwd):/app"]
    }
  }
}
```

## Common Patterns

### Pattern 1: Quick Test Container
```json
{
  "tool": "run_container",
  "arguments": {
    "image": "alpine:latest",
    "command": ["sh", "-c", "echo 'Test completed'"]
  }
}
```

### Pattern 2: Long-Running Service with Health Check
```json
{
  "tool": "run_container",
  "arguments": {
    "image": "nginx:alpine",
    "name": "web-service",
    "labels": {
      "environment": "production",
      "service": "web"
    },
    "exposedPorts": {"80/tcp": {}},
    "hostConfig": {
      "PortBindings": {"80/tcp": [{"HostPort": "80"}]},
      "RestartPolicy": {"Name": "unless-stopped"}
    }
  }
}
```

### Pattern 3: Isolated Test Container
```json
{
  "tool": "create_container",
  "arguments": {
    "image": "python:3.9",
    "name": "test-runner",
    "command": ["pytest", "/tests"],
    "env": ["PYTHONPATH=/app"],
    "hostConfig": {
      "Binds": ["./tests:/tests", "./src:/app"],
      "AutoRemove": true
    }
  }
}
```

## Troubleshooting Examples

### Check Container Status
```json
{
  "tool": "inspect_container",
  "arguments": {
    "containerId": "my-container"
  }
}
```

### View Recent Logs
```json
{
  "tool": "container_logs",
  "arguments": {
    "containerId": "failing-container",
    "tail": 100
  }
}
```

### Force Remove Stuck Container
```json
{
  "tool": "remove_container",
  "arguments": {
    "containerId": "stuck-container",
    "force": true,
    "volumes": true
  }
}
```

## Tips for Best Results with AI Assistants

1. **Be Specific**: Clearly state the image name, ports, and environment variables
2. **Use Standard Images**: Reference well-known Docker Hub images (nginx, postgres, redis, etc.)
3. **Mention Arrays**: When you need multiple values, use phrases like "with environment variables X, Y, and Z"
4. **Port Mappings**: Clearly state "expose port X on host port Y"
5. **Volume Mounts**: Use "mount /host/path to /container/path" phrasing

## Integration Testing

To verify the MCP server works correctly with your AI assistant:

1. Try listing containers: "Show me all Docker containers"
2. Pull an image: "Pull the hello-world image"
3. Run a simple container: "Run a hello-world container"
4. Check logs: "Show me the logs from that container"
5. Clean up: "Stop and remove the hello-world container"

If all these work, your Docker MCP server is properly configured!
