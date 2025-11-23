import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  integer,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { length: 20 }).notNull().default('scholar'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Scholars table (extends user information for scholarship program)
export const scholars = pgTable("scholars", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  scholarId: varchar("scholar_id").notNull().unique(),
  level: varchar("level", { length: 20 }).notNull(),
  requiredHoursPerMonth: integer("required_hours_per_month").notNull().default(20),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_scholars_user_id").on(table.userId),
]);

export const insertScholarSchema = createInsertSchema(scholars).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertScholar = z.infer<typeof insertScholarSchema>;
export type Scholar = typeof scholars.$inferSelect;

// Activity categories
export const activityCategories = pgTable("activity_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertActivityCategorySchema = createInsertSchema(activityCategories).omit({
  id: true,
  createdAt: true,
});

export type InsertActivityCategory = z.infer<typeof insertActivityCategorySchema>;
export type ActivityCategory = typeof activityCategories.$inferSelect;

// Activities table
export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scholarId: varchar("scholar_id").notNull().references(() => scholars.id, { onDelete: 'cascade' }),
  categoryId: varchar("category_id").references(() => activityCategories.id, { onDelete: 'set null' }),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  activityDate: timestamp("activity_date").notNull(),
  hours: integer("hours").notNull(),
  status: varchar("status", { length: 20 }).notNull().default('pending'),
  reviewedBy: varchar("reviewed_by").references(() => users.id, { onDelete: 'set null' }),
  reviewComment: text("review_comment"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_activities_scholar_id").on(table.scholarId),
  index("idx_activities_status").on(table.status),
  index("idx_activities_date").on(table.activityDate),
]);

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  status: true,
  reviewedBy: true,
  reviewComment: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  hours: z.number().min(1).max(24),
  activityDate: z.string().or(z.date()),
});

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

// Extended types with joined data
export type ActivityWithDetails = Activity & {
  scholar: Scholar & { user: User };
  category: ActivityCategory | null;
  reviewer: User | null;
};

export type ScholarWithUser = Scholar & {
  user: User;
};

export type ScholarStats = {
  scholarId: string;
  totalHours: number;
  currentMonthHours: number;
  pendingActivities: number;
  approvedActivities: number;
  rejectedActivities: number;
};
