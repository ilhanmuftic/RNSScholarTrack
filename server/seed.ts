import { storage } from "./storage";

async function seed() {
  console.log("Seeding database...");

  const categories = [
    {
      name: "Tutoring",
      description: "Helping students with academic subjects",
      icon: "book",
    },
    {
      name: "Community Service",
      description: "General community improvement activities",
      icon: "users",
    },
    {
      name: "Environmental Work",
      description: "Environmental conservation and cleanup activities",
      icon: "tree",
    },
    {
      name: "Elderly Care",
      description: "Supporting elderly members of the community",
      icon: "heart",
    },
    {
      name: "Youth Mentoring",
      description: "Mentoring and guidance for younger students",
      icon: "user-check",
    },
    {
      name: "Food Distribution",
      description: "Food banks and meal distribution programs",
      icon: "utensils",
    },
    {
      name: "Healthcare Support",
      description: "Assisting in healthcare facilities and programs",
      icon: "medical",
    },
    {
      name: "Animal Welfare",
      description: "Supporting animal shelters and rescue organizations",
      icon: "paw",
    },
  ];

  for (const category of categories) {
    try {
      await storage.createCategory(category);
      console.log(`Created category: ${category.name}`);
    } catch (error) {
      console.log(`Category ${category.name} might already exist, skipping...`);
    }
  }

  console.log("Database seeded successfully!");
}

seed().catch(console.error).finally(() => process.exit(0));
