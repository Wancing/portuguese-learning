import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowRight, Mic, Volume2, Brain, CheckCircle } from "lucide-react";

export default function HowItWorks() {
  const [, navigate] = useLocation();

  const steps = [
    {
      number: 1,
      title: "Browse Phrases",
      description: "Explore everyday Portuguese phrases organized by real-life situations like greetings, shopping, dining, and travel.",
      icon: "📚",
    },
    {
      number: 2,
      title: "Listen to Native Audio",
      description: "Hear authentic European Portuguese pronunciation from native speakers. Learn the correct accent and intonation.",
      icon: "🔊",
    },
    {
      number: 3,
      title: "Record Your Voice",
      description: "Practice speaking by recording your own pronunciation. Compare your voice directly with the native speaker audio.",
      icon: "🎤",
    },
    {
      number: 4,
      title: "Get AI Feedback",
      description: "Receive personalized pronunciation feedback powered by AI. Understand exactly where to improve and get specific tips.",
      icon: "✨",
    },
    {
      number: 5,
      title: "Study with Flashcards",
      description: "Create custom flashcards and practice with spaced repetition. Track your progress and build your vocabulary.",
      icon: "📇",
    },
    {
      number: 6,
      title: "Monitor Progress",
      description: "View your learning dashboard with statistics, streaks, and performance by category. Stay motivated with your achievements.",
      icon: "📊",
    },
  ];

  const features = [
    {
      title: "Interactive Audio Comparison",
      description: "Side-by-side playback of native speaker and your recording to identify pronunciation differences",
    },
    {
      title: "AI-Powered Transcription",
      description: "Automatic speech-to-text conversion of your recordings to compare with correct phrases",
    },
    {
      title: "Personalized Feedback",
      description: "Get specific pronunciation tips and improvement suggestions based on your recordings",
    },
    {
      title: "Spaced Repetition Learning",
      description: "Smart flashcard scheduling that optimizes your study time for maximum retention",
    },
    {
      title: "Progress Tracking",
      description: "Monitor your learning streaks, category performance, and overall improvement over time",
    },
    {
      title: "Contributor Community",
      description: "Learn from native Portuguese speakers who provide authentic recordings and live conversations",
    },
  ];

  return (
    <div className="min-h-screen memphis-bg">
      {/* Back button */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          onClick={() => navigate("/")}
          variant="outline"
          className="btn-shadow bg-card"
        >
          ← Back
        </Button>
      </div>

      {/* Geometric decorations */}
      <div className="geometric-shape shape-circle w-16 h-16 border-[#FF6B9D] top-20 right-10 hidden lg:block" style={{ borderColor: 'oklch(0.65 0.18 340)' }} />
      <div className="geometric-shape shape-circle w-20 h-20 border-[#A8E6CF] bottom-40 left-20 hidden lg:block" style={{ borderColor: 'oklch(0.75 0.08 160)' }} />

      <div className="container py-12 md:py-20 relative z-10">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground drop-shadow-[4px_4px_0_rgba(0,0,0,0.1)]">
            How It Works
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 font-medium">
            Master European Portuguese through interactive audio practice and AI-powered feedback
          </p>
        </div>

        {/* Learning Steps */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold mb-12 text-center">Your Learning Journey</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="btn-shadow border-2 h-full hover:scale-105 transition-transform">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-5xl">{step.icon}</div>
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                        {step.number}
                      </div>
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {step.description}
                    </CardDescription>
                  </CardContent>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-3 top-1/2 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold mb-12 text-center">Powerful Features</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center max-w-2xl mx-auto">
          <Card className="btn-shadow border-2 bg-card">
            <CardHeader>
              <CardTitle className="text-3xl mb-4">Ready to Start Learning?</CardTitle>
              <CardDescription className="text-lg">
                Begin your Portuguese learning journey today. No experience necessary—just bring your enthusiasm!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate("/category/1")}
                size="lg"
                className="btn-shadow text-lg px-8 py-6"
              >
                <Volume2 className="mr-2 h-5 w-5" />
                Start Learning Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
