-- Migration: add_short_memory
-- Adds short-term memory columns to chat_sessions table

ALTER TABLE "chat_sessions" ADD COLUMN IF NOT EXISTS "buffer" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "chat_sessions" ADD COLUMN IF NOT EXISTS "summary" TEXT NOT NULL DEFAULT '';
ALTER TABLE "chat_sessions" ADD COLUMN IF NOT EXISTS "msg_count" INTEGER NOT NULL DEFAULT 0;
