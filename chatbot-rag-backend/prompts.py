"""
prompts.py — system-prompt builders for ChatPDF.

These return the *system* string only. The user message and history
are passed separately as the `messages` list to ask_llm().
"""


def system_prompt_with_context(context: str) -> str:
    """System prompt when a PDF context chunk is available."""
    return f"""You are a helpful assistant that answers questions based on the provided document.

Use the context below to answer the user's question. If the context doesn't contain
enough information, say so clearly and supplement with your general knowledge if appropriate.
Keep track of the conversation history and refer back to earlier messages when relevant.

Relevant document context:
\"\"\"
{context}
\"\"\""""


def system_prompt_plain() -> str:
    """System prompt for plain chat (no PDF uploaded)."""
    return (
        "You are a helpful assistant. "
        "Answer clearly and concisely. "
        "Keep track of the conversation history and refer back to earlier messages when relevant."
    )
