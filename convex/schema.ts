/**
 * Convex Database Schema
 * Better Auth tables are managed by the @convex-dev/better-auth component.
 * Shipper-managed auth analytics live in the authStats table below.
 * Leave that table intact and add your custom application tables below it.
 * @see https://convex-better-auth.netlify.app/
 */
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Better Auth tables (user, session, account, verification) are
  // automatically managed by the @convex-dev/better-auth component.
  // You don't need to define them here.

  // ============================================================================
  // AUTH STATS - Signup tracking for Shipper analytics dashboard
  // Platform-managed table. Leave this intact.
  // ============================================================================
  authStats: defineTable({
    date: v.string(),        // ISO date string "2024-01-15"
    provider: v.string(),    // "email", "google", "anonymous"
    signups: v.number(),     // Count of signups
    lastUpdated: v.number(), // Timestamp
  })
    .index("date_provider", ["date", "provider"])
    .index("date", ["date"]),

  // Add your custom tables below:
  // Example: User-scoped table
  // todos: defineTable({
  //   userId: v.string(), // References user._id from getAuthUser()
  //   title: v.string(),
  //   completed: v.boolean(),
  //   createdAt: v.number(),
  // }).index("by_user", ["userId"]), // Required for user-scoped queries
});
