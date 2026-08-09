"use client"

import { useState, type KeyboardEvent, type SubmitEvent } from "react"
import { Bot, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
}

const STARTER_PROMPTS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
]

const DEMO_REPLY =
  "This is a preview of how AI responses will appear here. Real architecture generation is coming soon."

function AiArchitectTab() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")

  const sendMessage = (content: string) => {
    const trimmed = content.trim()
    if (!trimmed) return

    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-user`, role: "user", content: trimmed },
      { id: `${Date.now()}-assistant`, role: "assistant", content: DEMO_REPLY },
    ])
    setInput("")
  }

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <Bot className="h-8 w-8 text-ai-text" />
            <p className="text-sm text-copy-muted">
              Ask Ghost AI to design your system architecture.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full bg-subtle px-3 py-1.5 text-xs text-ai-text transition-colors hover:bg-subtle/70"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                    message.role === "user"
                      ? "border-2 border-brand/50 bg-accent-dim text-copy-primary"
                      : "border border-surface-border bg-elevated text-ai-text"
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-surface-border p-4 pb-16"
      >
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your architecture..."
            className="min-h-[72px] max-h-[160px] resize-none overflow-y-auto"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim()}
            aria-label="Send message"
            className="shrink-0 bg-ai text-white hover:bg-ai/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}

export { AiArchitectTab }
