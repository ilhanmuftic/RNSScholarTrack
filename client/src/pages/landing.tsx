import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Award, TrendingUp } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-serif font-bold text-foreground">Ruku na srce</h1>
              <p className="text-xs text-muted-foreground">Volunteer Scholarship Program</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-serif font-bold text-foreground mb-4">
            Empowering Students Through Service
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Track your volunteer hours, manage scholarship requirements, and make a difference in your community.
          </p>
          <Button
            size="lg"
            onClick={() => window.location.href = '/login'}
            className="text-lg px-8"
            data-testid="button-login"
          >
            Sign In to Continue
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader className="space-y-0 pb-2">
              <Users className="w-8 h-8 text-primary mb-3" />
              <CardTitle className="text-2xl font-serif">Scholars</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Students earning scholarships through meaningful volunteer work in their communities.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-0 pb-2">
              <Heart className="w-8 h-8 text-primary mb-3" />
              <CardTitle className="text-2xl font-serif">Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Log volunteer activities from tutoring to community service, elderly care, and environmental work.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-0 pb-2">
              <Award className="w-8 h-8 text-primary mb-3" />
              <CardTitle className="text-2xl font-serif">Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Transparent review process ensuring quality volunteer contributions and accurate hour tracking.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-0 pb-2">
              <TrendingUp className="w-8 h-8 text-primary mb-3" />
              <CardTitle className="text-2xl font-serif">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Real-time tracking of monthly requirements with visual progress indicators and detailed reports.
              </CardDescription>
            </CardContent>
          </Card>
        </div>


      </main>

      <footer className="border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-center text-sm text-muted-foreground">
            Powered by STRINTECH
          </p>
        </div>
      </footer>
    </div>
  );
}
