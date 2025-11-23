import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertActivitySchema, type InsertActivity, type ActivityCategory } from "@shared/schema";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useEffect } from "react";

export default function SubmitActivity() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: categories } = useQuery<ActivityCategory[]>({
    queryKey: ["/api/categories"],
  });

  const { data: scholar } = useQuery({
    queryKey: ["/api/scholar/profile"],
  });

  const form = useForm<InsertActivity>({
    resolver: zodResolver(insertActivitySchema),
    defaultValues: {
      title: "",
      description: "",
      hours: 1,
      activityDate: new Date().toISOString().split('T')[0],
      categoryId: "",
      scholarId: "",
    },
  });

  useEffect(() => {
    if (scholar?.id) {
      form.setValue('scholarId', scholar.id);
    }
  }, [scholar, form]);

  const mutation = useMutation({
    mutationFn: async (data: InsertActivity) => {
      if (!scholar?.id) {
        throw new Error("Scholar profile not loaded");
      }
      await apiRequest("POST", "/api/activities", { ...data, scholarId: scholar.id });
    },
    onSuccess: () => {
      toast({
        title: "Activity Submitted",
        description: "Your activity has been submitted for review.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/scholar/activities/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/scholar/stats"] });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertActivity) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild data-testid="button-back">
          <Link href="/">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-serif font-semibold text-foreground">Submit Activity</h1>
          <p className="text-muted-foreground mt-1">Log your volunteer work</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-serif">Activity Details</CardTitle>
          <CardDescription>
            Provide information about your volunteer activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Tutored elementary students in math"
                        {...field}
                        data-testid="input-title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what you did, who you helped, and the impact of your work..."
                        className="min-h-32 resize-none"
                        {...field}
                        data-testid="input-description"
                      />
                    </FormControl>
                    <FormDescription>
                      Provide detailed information about your volunteer activity
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="activityDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={typeof field.value === 'string' ? field.value : new Date(field.value).toISOString().split('T')[0]}
                          data-testid="input-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hours</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="24"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-hours"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the type of volunteer work
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={mutation.isPending || !scholar}
                  data-testid="button-submit"
                  className="flex-1"
                >
                  {mutation.isPending ? "Submitting..." : !scholar ? "Loading..." : "Submit Activity"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/")}
                  data-testid="button-cancel"
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
