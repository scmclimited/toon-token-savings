# Deploying TOON on an MCP Server

The **Message Context Protocol (MCP)** is a specification for handling messages and tool invocations between clients and LLMs.  MCP servers provide a standard interface to orchestrate tools, maintain context and process requests.  Integrating TOON into an MCP server helps reduce token overhead when serialising tool inputs and outputs.

This document outlines how to set up an MCP server with TOON support and shows where to perform encoding/decoding in the request pipeline.

## Overview

An MCP server typically performs the following steps:

1. **Receive a request** from a client containing a message, tool configuration and context.
2. **Invoke tools** as needed, passing inputs and receiving outputs.
3. **Compose an LLM prompt** that includes the request, tool outputs and any intermediate reasoning.
4. **Call the LLM API** and stream the result back to the client.

By default, tool inputs and outputs are encoded as JSON.  Replacing this with TOON reduces the number of tokens consumed by these payloads, which is especially beneficial when using long‑context models or when chains of tool calls accumulate substantial data.

## Encoding and Decoding Hooks

Assume you have an MCP server implementation (for example, [anthropic/mcp](https://github.com/anthropic/mcp)) running behind a FastAPI interface.  To add TOON support, insert encoding and decoding hooks around tool invocations.  The helper functions live under `python-backend/src` (imported via the `src` namespace), so ensure that directory is on your `PYTHONPATH`:

```python
from src.dataset import to_toon, from_toon

async def call_tool(tool_name: str, input_data: dict) -> dict:
    # Encode input for the tool
    encoded_input = to_toon(input_data)
    # Send to tool via MCP (this example uses a hypothetical send_to_tool function)
    raw_output = await send_to_tool(tool_name, encoded_input)
    # Decode TOON output back into Python
    return from_toon(raw_output)


async def handle_request(request: MCPRequest) -> MCPResponse:
    # Preprocess client message (may include other context)
    # ...
    # Invoke tools with TOON encoding
    for tool_call in request.tool_calls:
        tool_input = tool_call.input
        tool_output = await call_tool(tool_call.name, tool_input)
        tool_call.output = tool_output
    # Compose prompt and call LLM
    response = await call_llm(request)
    return response
```

The `send_to_tool` function can forward the TOON string to remote MCP tools or subprocesses.  On the receiving side, decode the TOON string before performing the tool’s logic.

## Deployment with Docker Compose

For a complete MCP stack including this project’s API server and React front‑end, use `docker-compose` to orchestrate services.  A sample `docker-compose.yml` might look like:

```yaml
version: '3.9'
services:
  mcp:
    build: ./mcp
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    ports:
      - "9000:9000"
  api:
    build: .
    working_dir: /app/python-backend
    command: uvicorn src.server:app --host 0.0.0.0 --port 8000
    ports:
      - "8000:8000"
    depends_on:
      - mcp
  frontend:
    build: ./react-frontend
    ports:
      - "3000:3000"
    depends_on:
      - api
```

Each service runs in its own container.  The MCP server uses the environment variable `OPENAI_API_KEY` to access LLMs; replace this with your own keys (e.g. Anthropic or DeepSeek).  The API server imports `src.dataset` and `src.token_counter` to encode/decode and compute token counts.  The React front‑end communicates with the API server to fetch results and render charts.

## Considerations

* **Security**: Avoid passing sensitive data through TOON without encryption.  MCP messages may traverse networks or intermediate services.
* **Idempotency**: Ensure that encoding and decoding are deterministic.  If a tool fails, its input should be recoverable from the TOON string.
* **Performance**: TOON encoding is fast but not free.  When tool inputs are extremely large, you may wish to benchmark TOON vs JSON encoding overhead.

By incorporating TOON into your MCP server, you can extend the effective context window of your LLM pipelines and reduce costs when using long‑context models.