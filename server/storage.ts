import {
  users,
  scholars,
  activities,
  activityCategories,
  type User,
  type UpsertUser,
  type Scholar,
  type InsertScholar,
  type Activity,
  type InsertActivity,
  type ActivityCategory,
  type InsertActivityCategory,
  type ScholarWithUser,
  type ActivityWithDetails,
  type ScholarStats,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lt, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  getScholarByUserId(userId: string): Promise<Scholar | undefined>;
  getScholarWithUser(scholarId: string): Promise<ScholarWithUser | undefined>;
  getAllScholarsWithUsers(): Promise<ScholarWithUser[]>;
  createScholar(scholar: InsertScholar): Promise<Scholar>;
  updateScholar(id: string, scholar: Partial<InsertScholar>): Promise<Scholar | undefined>;
  
  createActivity(activity: InsertActivity): Promise<Activity>;
  getActivityById(id: string): Promise<Activity | undefined>;
  getActivitiesByScholar(scholarId: string): Promise<Activity[]>;
  getActivitiesWithDetails(): Promise<ActivityWithDetails[]>;
  getRecentActivitiesWithDetails(limit: number): Promise<ActivityWithDetails[]>;
  getRecentActivitiesByScholar(scholarId: string, limit: number): Promise<Activity[]>;
  updateActivityStatus(id: string, status: string, reviewedBy: string, reviewComment?: string): Promise<Activity | undefined>;
  
  getAllCategories(): Promise<ActivityCategory[]>;
  createCategory(category: InsertActivityCategory): Promise<ActivityCategory>;
  
  getScholarStats(scholarId: string): Promise<ScholarStats>;
  getDashboardStats(): Promise<{
    totalScholars: number;
    activeThisMonth: number;
    pendingApprovals: number;
    hoursThisMonth: number;
  }>;
  getMonthlyReport(year: number, month: number): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getScholarByUserId(userId: string): Promise<Scholar | undefined> {
    const [scholar] = await db.select().from(scholars).where(eq(scholars.userId, userId));
    return scholar;
  }

  async getScholarWithUser(scholarId: string): Promise<ScholarWithUser | undefined> {
    const result = await db
      .select()
      .from(scholars)
      .innerJoin(users, eq(scholars.userId, users.id))
      .where(eq(scholars.id, scholarId));
    
    if (result.length === 0) return undefined;
    
    return {
      ...result[0].scholars,
      user: result[0].users,
    };
  }

  async getAllScholarsWithUsers(): Promise<ScholarWithUser[]> {
    const result = await db
      .select()
      .from(scholars)
      .innerJoin(users, eq(scholars.userId, users.id))
      .orderBy(users.firstName, users.lastName);
    
    return result.map(row => ({
      ...row.scholars,
      user: row.users,
    }));
  }

  async createScholar(scholarData: InsertScholar): Promise<Scholar> {
    const [scholar] = await db.insert(scholars).values(scholarData).returning();
    return scholar;
  }

  async updateScholar(id: string, scholarData: Partial<InsertScholar>): Promise<Scholar | undefined> {
    const [scholar] = await db
      .update(scholars)
      .set({ ...scholarData, updatedAt: new Date() })
      .where(eq(scholars.id, id))
      .returning();
    return scholar;
  }

  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const [activity] = await db.insert(activities).values(activityData).returning();
    return activity;
  }

  async getActivityById(id: string): Promise<Activity | undefined> {
    const [activity] = await db.select().from(activities).where(eq(activities.id, id));
    return activity;
  }

  async getActivitiesByScholar(scholarId: string): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.scholarId, scholarId))
      .orderBy(desc(activities.activityDate));
  }

  async getActivitiesWithDetails(): Promise<ActivityWithDetails[]> {
    const result = await db
      .select()
      .from(activities)
      .innerJoin(scholars, eq(activities.scholarId, scholars.id))
      .innerJoin(users, eq(scholars.userId, users.id))
      .leftJoin(activityCategories, eq(activities.categoryId, activityCategories.id))
      .leftJoin(users.as('reviewer'), eq(activities.reviewedBy, users.id))
      .orderBy(desc(activities.createdAt));
    
    return result.map(row => ({
      ...row.activities,
      scholar: {
        ...row.scholars,
        user: row.users,
      },
      category: row.activity_categories,
      reviewer: row.reviewer,
    }));
  }

  async getRecentActivitiesWithDetails(limit: number): Promise<ActivityWithDetails[]> {
    const result = await db
      .select()
      .from(activities)
      .innerJoin(scholars, eq(activities.scholarId, scholars.id))
      .innerJoin(users, eq(scholars.userId, users.id))
      .leftJoin(activityCategories, eq(activities.categoryId, activityCategories.id))
      .leftJoin(users.as('reviewer'), eq(activities.reviewedBy, users.id))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
    
    return result.map(row => ({
      ...row.activities,
      scholar: {
        ...row.scholars,
        user: row.users,
      },
      category: row.activity_categories,
      reviewer: row.reviewer,
    }));
  }

  async getRecentActivitiesByScholar(scholarId: string, limit: number): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.scholarId, scholarId))
      .orderBy(desc(activities.activityDate))
      .limit(limit);
  }

  async updateActivityStatus(
    id: string,
    status: string,
    reviewedBy: string,
    reviewComment?: string
  ): Promise<Activity | undefined> {
    const [activity] = await db
      .update(activities)
      .set({
        status,
        reviewedBy,
        reviewComment,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(activities.id, id))
      .returning();
    return activity;
  }

  async getAllCategories(): Promise<ActivityCategory[]> {
    return await db.select().from(activityCategories).orderBy(activityCategories.name);
  }

  async createCategory(categoryData: InsertActivityCategory): Promise<ActivityCategory> {
    const [category] = await db.insert(activityCategories).values(categoryData).returning();
    return category;
  }

  async getScholarStats(scholarId: string): Promise<ScholarStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const allActivities = await db
      .select()
      .from(activities)
      .where(eq(activities.scholarId, scholarId));

    const totalHours = allActivities
      .filter(a => a.status === 'approved')
      .reduce((sum, a) => sum + a.hours, 0);

    const currentMonthActivities = allActivities.filter(
      a => new Date(a.activityDate) >= startOfMonth && new Date(a.activityDate) < endOfMonth
    );

    const currentMonthHours = currentMonthActivities
      .filter(a => a.status === 'approved')
      .reduce((sum, a) => sum + a.hours, 0);

    const pendingActivities = allActivities.filter(a => a.status === 'pending').length;
    const approvedActivities = allActivities.filter(a => a.status === 'approved').length;
    const rejectedActivities = allActivities.filter(a => a.status === 'rejected').length;

    return {
      scholarId,
      totalHours,
      currentMonthHours,
      pendingActivities,
      approvedActivities,
      rejectedActivities,
    };
  }

  async getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const totalScholars = await db.select({ count: sql<number>`count(*)` }).from(scholars);
    
    const monthActivities = await db
      .select()
      .from(activities)
      .where(
        and(
          gte(activities.activityDate, startOfMonth),
          lt(activities.activityDate, endOfMonth)
        )
      );

    const activeScholarsSet = new Set(monthActivities.map(a => a.scholarId));
    const pendingApprovals = monthActivities.filter(a => a.status === 'pending').length;
    const hoursThisMonth = monthActivities
      .filter(a => a.status === 'approved')
      .reduce((sum, a) => sum + a.hours, 0);

    return {
      totalScholars: Number(totalScholars[0].count),
      activeThisMonth: activeScholarsSet.size,
      pendingApprovals,
      hoursThisMonth,
    };
  }

  async getMonthlyReport(year: number, month: number) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 1);

    const allScholars = await this.getAllScholarsWithUsers();
    
    const reports = await Promise.all(
      allScholars.map(async (scholar) => {
        const monthActivities = await db
          .select()
          .from(activities)
          .where(
            and(
              eq(activities.scholarId, scholar.id),
              gte(activities.activityDate, startOfMonth),
              lt(activities.activityDate, endOfMonth)
            )
          );

        const completedHours = monthActivities
          .filter(a => a.status === 'approved')
          .reduce((sum, a) => sum + a.hours, 0);

        const pendingHours = monthActivities
          .filter(a => a.status === 'pending')
          .reduce((sum, a) => sum + a.hours, 0);

        const approvedActivities = monthActivities.filter(a => a.status === 'approved').length;
        const pendingActivities = monthActivities.filter(a => a.status === 'pending').length;
        const rejectedActivities = monthActivities.filter(a => a.status === 'rejected').length;

        return {
          scholarId: scholar.scholarId,
          scholarName: `${scholar.user.firstName} ${scholar.user.lastName}`,
          scholarLevel: scholar.level,
          requiredHours: scholar.requiredHoursPerMonth,
          completedHours,
          pendingHours,
          approvedActivities,
          pendingActivities,
          rejectedActivities,
          isCompliant: completedHours >= scholar.requiredHoursPerMonth,
        };
      })
    );

    return reports;
  }
}

export const storage = new DatabaseStorage();
