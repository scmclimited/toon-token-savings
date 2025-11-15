# Integrating TOON with LangGraph

LangGraph is a Python framework for building agentic workflows over large‑language models.  It orchestrates tool calls, message passing and state transitions using a directed graph.  The **Message Context Protocol (MCP)** defines how messages are encoded, and the TOON specification can be employed as an alternative to JSON when transmitting structured data between nodes.

This guide shows how to incorporate TOON encoding and decoding into a LangGraph pipeline.  The goal is to reduce token usage when sending intermediate results or documents to LLM nodes, thereby allowing more operations before reaching the model’s context limit.

## Prerequisites

* Python 3.13 with `langgraph` and `toon-format` installed (`pip install langgraph toon-format`).
* A configuration file containing your LLM API keys (e.g. OpenAI, Anthropic), if required by the models used in the graph.
* Familiarity with LangGraph’s node and edge concepts.  See the official documentation for more details.

## Encoding and Decoding functions

First define helper functions to serialise data to TOON and back.  Import these from the `src.dataset` module in this repository:

```python
from langgraph import Node, Edge
from src.dataset import to_toon, from_toon

def encode_message(data: dict) -> str:
    """Encode Python data into a TOON string for messaging."""
    return to_toon(data)

def decode_message(toon_str: str) -> dict:
    """Decode TOON back into Python data at graph nodes."""
    return from_toon(toon_str)
```

You can then wrap these in LangGraph nodes.  For example, suppose you have a node that processes an order record before sending it to an LLM for summarisation:

```python
class OrderProcessor(Node):
    def run(self, order: dict) -> str:
        # pre‑process order data
        cleaned = clean_order(order)
        # encode using TOON
        return encode_message(cleaned)


class SummarisationNode(Node):
    def run(self, toon_order: str) -> dict:
        # decode the TOON representation
        order_data = decode_message(toon_order)
        # call the LLM with the order information
        summary = call_llm(order_data)
        # return a Python dict; downstream nodes may re‑encode
        return summary
```

The edge connecting these nodes simply forwards the TOON string.  Because TOON uses fewer tokens than JSON, more orders can traverse the graph before hitting context limits.

## Counting tokens within the pipeline

To monitor token consumption in LangGraph, you can call the `src.token_counter.compare_formats` function after each node.  This allows dynamic adjustment of prompts or decisions to truncate history.

```python
from src.token_counter import compare_formats

class LoggerNode(Node):
    def run(self, data: dict) -> dict:
        result = compare_formats(data)
        print(f"JSON tokens: {result['json_tokens']:.0f}, TOON tokens: {result['toon_tokens']:.0f}, savings: {result['savings']:.2f}%")
        return data
```

You can insert `LoggerNode` after critical edges to log token usage and adapt the graph’s behaviour accordingly.

## Deployment with Docker

For production, containerise the LangGraph pipeline along with the TOON library.  A minimal `Dockerfile` might look like this:

```Dockerfile
FROM python:3.13-slim
WORKDIR /app
COPY . /app
RUN pip install --no-cache-dir langgraph toon-format tiktoken
CMD ["python", "pipeline.py"]
```

Where `pipeline.py` constructs and runs your LangGraph graph.  This repository includes examples in `src/langgraph_pipeline.py` which you can adapt to your use case.

## Considerations

* **Context windows**: Even when using long‑context models like GPT‑4.1 or Grok 4 Fast, token savings reduce cost proportionally.  For open‑source models with 4k–8k contexts, TOON may enable prompts that would otherwise overflow the model’s capacity.
* **Tool calls**: When LangGraph uses tool calls (e.g. function calling or remote execution), the tools’ input and output should also be encoded in TOON to maximise context efficiency.
* **Decoding for front‑end**: If results must be presented to end users or UI components (as in the React app), decode the TOON back into JSON using `from_toon` before rendering.

By following this guide, you can integrate TOON seamlessly into LangGraph workflows and reap the benefits of reduced token usage across your applications.