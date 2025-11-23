import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import { z } from "zod";
import { insertActivitySchema, insertScholarSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get('/api/admin/stats', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/admin/activities/recent', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const activities = await storage.getRecentActivitiesWithDetails(10);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.get('/api/admin/activities', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const activities = await storage.getActivitiesWithDetails();
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.post('/api/admin/activities/:id/approve', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { comment } = req.body;
      const userId = req.user.claims.sub;

      const activity = await storage.updateActivityStatus(id, 'approved', userId, comment);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }

      res.json(activity);
    } catch (error) {
      console.error("Error approving activity:", error);
      res.status(500).json({ message: "Failed to approve activity" });
    }
  });

  app.post('/api/admin/activities/:id/reject', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { comment } = req.body;
      const userId = req.user.claims.sub;

      const activity = await storage.updateActivityStatus(id, 'rejected', userId, comment);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }

      res.json(activity);
    } catch (error) {
      console.error("Error rejecting activity:", error);
      res.status(500).json({ message: "Failed to reject activity" });
    }
  });

  app.get('/api/admin/scholars', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const scholars = await storage.getAllScholarsWithUsers();
      
      const scholarsWithStats = await Promise.all(
        scholars.map(async (scholar) => {
          const stats = await storage.getScholarStats(scholar.id);
          return {
            ...scholar,
            stats,
          };
        })
      );

      res.json(scholarsWithStats);
    } catch (error) {
      console.error("Error fetching scholars:", error);
      res.status(500).json({ message: "Failed to fetch scholars" });
    }
  });

  app.post('/api/admin/scholars', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validatedData = insertScholarSchema.parse(req.body);
      const scholar = await storage.createScholar(validatedData);
      res.json(scholar);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating scholar:", error);
      res.status(500).json({ message: "Failed to create scholar" });
    }
  });

  app.get('/api/admin/reports/monthly', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const yearMonth = req.query.month as string;
      
      if (!yearMonth || !/^\d{4}-\d{2}$/.test(yearMonth)) {
        return res.status(400).json({ message: "Invalid month parameter. Expected format: YYYY-MM" });
      }
      
      const [year, month] = yearMonth.split('-').map(Number);
      const report = await storage.getMonthlyReport(year, month);
      res.json(report);
    } catch (error) {
      console.error("Error fetching monthly report:", error);
      res.status(500).json({ message: "Failed to fetch report" });
    }
  });

  app.get('/api/scholar/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const scholar = await storage.getScholarByUserId(userId);
      
      if (!scholar) {
        return res.status(404).json({ message: "Scholar profile not found" });
      }

      res.json(scholar);
    } catch (error) {
      console.error("Error fetching scholar profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.get('/api/scholar/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const scholar = await storage.getScholarByUserId(userId);
      
      if (!scholar) {
        return res.status(404).json({ message: "Scholar not found" });
      }

      const stats = await storage.getScholarStats(scholar.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching scholar stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/scholar/activities/recent', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const scholar = await storage.getScholarByUserId(userId);
      
      if (!scholar) {
        return res.status(404).json({ message: "Scholar not found" });
      }

      const activities = await storage.getRecentActivitiesByScholar(scholar.id, 10);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.get('/api/scholar/activities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const scholar = await storage.getScholarByUserId(userId);
      
      if (!scholar) {
        return res.status(404).json({ message: "Scholar not found" });
      }

      const activities = await storage.getActivitiesByScholar(scholar.id);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.post('/api/activities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const scholar = await storage.getScholarByUserId(userId);
      
      if (!scholar) {
        return res.status(404).json({ message: "Scholar not found" });
      }

      const validatedData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity({
        ...validatedData,
        scholarId: scholar.id,
      });

      res.json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating activity:", error);
      res.status(500).json({ message: "Failed to create activity" });
    }
  });

  app.get('/api/categories', isAuthenticated, async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
