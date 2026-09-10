---
name: cerebras
description: Cerebras inference. Use this to write code to call an LLM using LiteLLM and OpenRouter with the Cerebras inference provider.
---

# Calling an LLM via Cerebras

These instructions let you write code to call an LLM with Cerebras specified as the inference provider. Read the model + key from `.env`.

```python
import os
import litellm
from pydantic import BaseModel

class DocumentFields(BaseModel):
    # Pydantic schema for structured output
    disclosing_party: str
    receiving_party: str
    effective_date: str
    governing_state: str
    purpose: str

# Structured output, pinned to the Cerebras provider
resp = litellm.completion(
    model="openrouter/openai/gpt-oss-120b",
    messages=messages,
    api_key=os.environ.get("OPENROUTER_API_KEY"),
    response_format=DocumentFields,
    extra_body={
        "provider": {
            "order": ["Cerebras"],
            "allow_fallbacks": False
        }
    },
)
```
