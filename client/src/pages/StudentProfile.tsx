import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useEffect } from "react";
import { Loader2, Trophy, Flame, Target, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function StudentProfile() {
  const [, navigate] = useLocation();
const user = null;
const isAuthenticated = false;
// Redirect to home if accessed directly
if (typeof window !== 'undefined') {
  window.location.href = '/';
}
  const [badges, setBadges] = useState<any[]>([]);

  const { data: userBadges, isLoading: badgesLoading } = trpc.badges.getUserBadges.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const checkBadgesMutation = trpc.badges.checkAndAward.useMutation({
    onSuccess: (awarded) => {
      if (awarded.length > 0) {
        toast.success(`🎉 You earned ${awarded.length} new badge(s)!`);
      }
    },
  });

  useEffect(() => {
    if (userBadges) {
      setBadges(userBadges);
    }
  }, [userBadges]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen memphis-bg flex items-center justify-center">
        <Card className="max-w-md border-2">
          <CardContent className="py-12 text-center">
            <p className="text-lg mb-4">Sign in to view your profile</p>
            <Button className="btn-shadow" onClick={() => navigate("/login")}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen memphis-bg">
      <div className="container py-8 max-w-4xl relative z-10">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Profile Header */}
        <Card className="border-2 mb-8">
          <CardHeader>
            <CardTitle className="text-3xl">
              {user?.firstName} {user?.lastName}
            </CardTitle>
            <CardDescription>{user?.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => checkBadgesMutation.mutate()}
              disabled={checkBadgesMutation.isPending}
              className="btn-shadow"
            >
              {checkBadgesMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                "Check for New Badges"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Badges Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6 drop-shadow-[2px_2px_0_rgba(0,0,0,0.1)]">
            <Trophy className="inline mr-2 h-8 w-8" />
            Your Achievements
          </h2>

          {badgesLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : badges.length === 0 ? (
            <Card className="border-2">
              <CardContent className="py-12 text-center">
                <p className="text-lg text-muted-foreground">
                  No badges earned yet. Start practicing to unlock achievements!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {badges.map((badge) => (
                <Card key={badge.badge.id} className="border-2 btn-shadow hover:scale-105 transition-transform">
                  <CardHeader>
                    <div className="text-4xl mb-2">{badge.badge.icon || "🏆"}</div>
                    <CardTitle>{badge.badge.name}</CardTitle>
                    <CardDescription className="text-xs">
                      Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{badge.badge.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-2 btn-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                Practice Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0 days</p>
              <p className="text-sm text-muted-foreground">Keep it up!</p>
            </CardContent>
          </Card>

          <Card className="border-2 btn-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Phrases Practiced
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">phrases</p>
            </CardContent>
          </Card>

          <Card className="border-2 btn-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Total Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{badges.length}</p>
              <p className="text-sm text-muted-foreground">earned</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
