"use client";

import React, { useEffect, useRef, useState } from "react";
import { Column, Flex, Icon, IconButton, Row, Text, Textarea } from "@once-ui-system/core";
import styles from "./ChatBot.module.scss";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
    } catch (error) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Sorry, I couldn't get a response. Please try again.";
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, { role: "assistant", content: errMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <Column
          className={styles.chatWindow}
          background="surface"
          border="neutral-alpha-weak"
          radius="l"
          overflow="hidden"
        >
          {/* Header */}
          <Row
            padding="16"
            horizontal="between"
            vertical="center"
            borderBottom="neutral-alpha-weak"
          >
            <Row gap="8" vertical="center">
              <Icon name="sparkles" size="s" onBackground="brand-medium" />
              <Text variant="label-strong-m">AI Assistant</Text>
            </Row>
            <IconButton
              icon="close"
              size="s"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            />
          </Row>

          {/* Messages */}
          <Column className={styles.messagesContainer} gap="12" padding="16">
            {messages.length === 0 && (
              <Column flex={1} horizontal="center" vertical="center" gap="8" padding="l">
                <Icon name="sparkles" size="m" onBackground="neutral-weak" />
                <Text variant="body-default-s" onBackground="neutral-weak" align="center">
                  Hi! Ask me anything about this portfolio.
                </Text>
              </Column>
            )}
            {messages.map((msg, i) => (
              <Flex
                key={i}
                className={`${styles.messageBubble} ${
                  msg.role === "user" ? styles.userMessage : styles.botMessage
                }`}
              >
                <Text variant="body-default-s">{msg.content}</Text>
              </Flex>
            ))}
            {isLoading && (
              <div className={styles.typingDots}>
                <span />
                <span />
                <span />
              </div>
            )}
            <div ref={messagesEndRef} />
          </Column>

          {/* Input area */}
          <Row padding="12" borderTop="neutral-alpha-weak">
            <Textarea
              id="chat-input"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              lines="auto"
              resize="none"
              disabled={isLoading}
              aria-label="Chat message input"
              style={{ flex: 1 }}
              hasSuffix={
                <IconButton
                  icon="arrowUp"
                  size="m"
                  variant="primary"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  aria-label="Send message"
                />
              }
            />
          </Row>
        </Column>
      )}

      {/* Floating toggle button */}
      <Flex className={styles.chatButtonWrapper}>
        <IconButton
          icon={isOpen ? "close" : "sparkles"}
          size="l"
          variant="primary"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Close chat" : "Open chat"}
          tooltip={isOpen ? undefined : "Chat with AI"}
        />
      </Flex>
    </>
  );
};
