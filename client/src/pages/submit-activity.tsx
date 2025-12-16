import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { ArrowLeft } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

/* ----------------------------------
   Types (local, no shared imports)
---------------------------------- */

type Category = {
  id: number;
  name: string;
};

type ScholarProfile = {
  id: number;
};

type FormData = {
  description: string;
  hours: number;
  activity_date: string;
  category: number | "";
};

/* ----------------------------------
   Helper: authenticated fetch
---------------------------------- */

async function authFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("authToken");

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  return res.json();
}

/* ----------------------------------
   Component
---------------------------------- */

export default function SubmitActivity() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<FormData>({
    defaultValues: {
      description: "",
      hours: 1,
      activity_date: new Date().toISOString().split("T")[0],
      category: "",
    },
  });

  /* -----------------------------
     Load categories
  ----------------------------- */

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["activity-categories"],
    queryFn: () => authFetch("/api/scholars/categories/"),
  });

  /* -----------------------------
     Load scholar profile
  ----------------------------- */

  const { data: scholar } = useQuery<ScholarProfile>({
    queryKey: ["scholar-profile"],
    queryFn: () => authFetch("/api/scholars/profile/"),
  });

  /* -----------------------------
     Submit mutation
  ----------------------------- */

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!scholar?.id) {
        throw new Error("Scholar profile not loaded");
      }

      await authFetch("/api/scholars/activities/", {
        method: "POST",
        body: JSON.stringify({
          description: data.description,
          hours: data.hours,
          activity_date: data.activity_date,
          category: data.category,
        }),
      });
    },

    onSuccess: () => {
      toast({
        title: "Activity submitted",
        description: "Your activity is awaiting review.",
      });
      setLocation("/scholar");
    },

    onError: (error: Error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  /* -----------------------------
     Render
  ----------------------------- */

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/scholar">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>

        <div>
          <h1 className="text-3xl font-serif font-semibold">
            Submit Activity
          </h1>
          <p className="text-muted-foreground">
            Log your volunteer work
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Details</CardTitle>
          <CardDescription>
            Provide information about your activity
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) =>
                mutation.mutate(data)
              )}
              className="space-y-6"
            >
              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                rules={{ required: "Description is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="min-h-32"
                        placeholder="Describe what you did..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-6">
                {/* Date */}
                <FormField
                  control={form.control}
                  name="activity_date"
                  rules={{ required: true }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Hours */}
                <FormField
                  control={form.control}
                  name="hours"
                  rules={{ min: 1 }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hours</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={24}
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                rules={{ required: "Category is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(v) =>
                        field.onChange(Number(v))
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {categories?.map((c) => (
                          <SelectItem
                            key={c.id}
                            value={String(c.id)}
                          >
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending
                    ? "Submitting..."
                    : "Submit Activity"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/scholar")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
