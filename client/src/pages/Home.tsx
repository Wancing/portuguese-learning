import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { Loader2, Volume2, Sparkles } from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();
  const { data: categories, isLoading } = trpc.categories.list.useQuery();
  const { user } = useAuth();

  return (
    <div className="min-h-screen memphis-bg">
      {/* Navigation links for authorized users */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        {user && (
          <Button
            onClick={() => navigate("/flashcards")}
            variant="outline"
            className="btn-shadow bg-card"
          >
            Flashcards
          </Button>
        )}
        {user?.role === 'contributor' || user?.role === 'admin' ? (
          <Button
            onClick={() => navigate("/contributor")}
            variant="outline"
            className="btn-shadow bg-card"
          >
            Contributor
          </Button>
        ) : null}
        {user?.role === 'admin' && (
          <Button
            onClick={() => navigate("/admin")}
            variant="outline"
            className="btn-shadow bg-card"
          >
            Admin
          </Button>
        )}
      </div>
      {/* Geometric decorations */}
      <div className="geometric-shape shape-circle w-16 h-16 border-[#FF6B9D] top-20 left-10 hidden lg:block" style={{ borderColor: 'oklch(0.65 0.18 340)' }} />
      <div className="geometric-shape shape-circle w-24 h-24 border-[#A8E6CF] top-40 right-20 hidden lg:block" style={{ borderColor: 'oklch(0.75 0.08 160)' }} />
      <div className="geometric-shape shape-circle w-12 h-12 border-[#FFD93D] bottom-32 left-1/4 hidden lg:block" style={{ borderColor: 'oklch(0.85 0.12 85)' }} />
      <div className="geometric-shape shape-circle w-20 h-20 border-[#C4A1FF] bottom-20 right-1/3 hidden lg:block" style={{ borderColor: 'oklch(0.78 0.08 270)' }} />

      {/* Hero Section */}
      <div className="container py-12 md:py-20 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground drop-shadow-[4px_4px_0_rgba(0,0,0,0.1)]">
            Learn European Portuguese
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 font-medium">
            Master everyday conversations with interactive audio practice and AI-powered pronunciation feedback
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={() => navigate("/category/1")}
              size="lg"
              className="btn-shadow text-lg px-8 py-6"
            >
              <Volume2 className="mr-2 h-5 w-5" />
              Start Learning
            </Button>
            <Button
              onClick={() => navigate("/how-it-works")}
              size="lg"
              variant="outline"
              className="btn-shadow text-lg px-8 py-6 bg-card"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              How It Works
            </Button>
          </div>
        </div>

        {/* Additional Features */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <Card className="btn-shadow border-2 hover:scale-105 transition-transform cursor-pointer" onClick={() => navigate("/conversations")}>
            <CardHeader>
              <CardTitle>Conversation Practice</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Practice real conversations with an AI partner. Get feedback on your responses.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="btn-shadow border-2 hover:scale-105 transition-transform cursor-pointer" onClick={() => navigate("/profile")}>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                View your achievements, badges, and learning progress.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="btn-shadow border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  🎯
                </div>
                Daily Situations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Browse phrases organized by real-life scenarios: greetings, shopping, dining, travel, and more.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="btn-shadow border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground">
                  🎤
                </div>
                Practice Speaking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Record your pronunciation and compare it side-by-side with native speaker audio.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="btn-shadow border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground">
                  ✨
                </div>
                AI Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Get personalized pronunciation tips and transcription comparison powered by AI.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Categories Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-8 text-center">Browse by Category</h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Link key={category.id} href={`/category/${category.id}`}>
                  <Card className="btn-shadow border-2 hover:scale-105 transition-transform cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <span className="text-3xl">{category.icon || "📚"}</span>
                        <div>
                          <div className="text-xl">{category.name}</div>
                          <div className="text-sm font-normal text-muted-foreground normal-case">
                            {category.nameEn}
                          </div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    {category.description && (
                      <CardContent>
                        <CardDescription className="text-base">
                          {category.description}
                        </CardDescription>
                      </CardContent>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="border-2">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground text-lg">
                  No categories available yet. Check back soon!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
