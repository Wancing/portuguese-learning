import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function Flashcards() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [showStudy, setShowStudy] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [newCardForm, setNewCardForm] = useState({ front: "", back: "" });

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const { data: dueCards, isLoading: isDueLoading, refetch: refetchDue } = trpc.flashcards.getDueCards.useQuery();
  const { data: allCards, isLoading: isAllLoading } = trpc.flashcards.getAllCards.useQuery();
  const { data: stats } = trpc.flashcards.getStats.useQuery();

  const createMutation = trpc.flashcards.create.useMutation({
    onSuccess: () => {
      toast.success("Flashcard created!");
      setNewCardForm({ front: "", back: "" });
      refetchDue();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create flashcard");
    },
  });

  const recordSessionMutation = trpc.flashcards.recordSession.useMutation({
    onSuccess: () => {
      toast.success("Session recorded!");
      setIsFlipped(false);
      setCurrentCardIndex(currentCardIndex + 1);
      refetchDue();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to record session");
    },
  });

  const deleteMutation = trpc.flashcards.delete.useMutation({
    onSuccess: () => {
      toast.success("Flashcard deleted!");
      refetchDue();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete flashcard");
    },
  });

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardForm.front || !newCardForm.back) {
      toast.error("Please fill in both sides of the card");
      return;
    }
    createMutation.mutate(newCardForm);
  };

  const handleRecordSession = (quality: number) => {
    if (!dueCards || !dueCards[currentCardIndex]) return;
    recordSessionMutation.mutate({
      flashcardId: dueCards[currentCardIndex].id,
      quality,
    });
  };

  const currentCard = dueCards?.[currentCardIndex];
  const isStudyComplete = showStudy && (!dueCards || currentCardIndex >= dueCards.length);

  return (
    <div className="min-h-screen memphis-bg p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold uppercase mb-2">Flashcards</h1>
          <p className="text-gray-600">Master Portuguese vocabulary with spaced repetition</p>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-accent">{stats.totalCards}</p>
                  <p className="text-sm text-muted-foreground">Total Cards</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-pink-500">{stats.dueCards}</p>
                  <p className="text-sm text-muted-foreground">Due for Review</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-mint-500">{stats.totalSessions}</p>
                  <p className="text-sm text-muted-foreground">Study Sessions</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-lilac-500">{stats.averageQuality.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">Avg Quality</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Study Mode */}
        {showStudy ? (
          <div>
            {isStudyComplete ? (
              <Card className="border-2 mb-8">
                <CardContent className="pt-8 pb-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">Study Session Complete!</h2>
                  <p className="text-gray-600 mb-6">
                    Great job! You've reviewed all cards due today.
                  </p>
                  <Button
                    onClick={() => {
                      setShowStudy(false);
                      setCurrentCardIndex(0);
                    }}
                    className="btn-shadow"
                  >
                    Back to Dashboard
                  </Button>
                </CardContent>
              </Card>
            ) : isDueLoading ? (
              <div className="text-center py-8">
                <Loader2 className="inline h-8 w-8 animate-spin" />
              </div>
            ) : currentCard ? (
              <Card className="border-2 mb-8">
                <CardContent className="pt-8">
                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-2">
                      Card {currentCardIndex + 1} of {dueCards?.length}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-accent h-2 rounded-full transition-all"
                        style={{
                          width: `${((currentCardIndex + 1) / (dueCards?.length || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="min-h-64 bg-gradient-to-br from-pink-200 to-lilac-200 rounded-lg p-8 flex items-center justify-center cursor-pointer transform transition-transform hover:scale-105 mb-6"
                  >
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">
                        {isFlipped ? "Answer" : "Question"}
                      </p>
                      <p className="text-2xl font-bold text-center">
                        {isFlipped ? currentCard.back : currentCard.front}
                      </p>
                      <p className="text-xs text-gray-500 mt-4">Click to flip</p>
                    </div>
                  </div>

                  {isFlipped && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        How well did you remember?
                      </p>
                      <div className="grid grid-cols-5 gap-2">
                        {[
                          { label: "Again", value: 0, color: "bg-red-500" },
                          { label: "Hard", value: 1, color: "bg-orange-500" },
                          { label: "Good", value: 3, color: "bg-yellow-500" },
                          { label: "Easy", value: 4, color: "bg-green-500" },
                          { label: "Perfect", value: 5, color: "bg-blue-500" },
                        ].map((option) => (
                          <Button
                            key={option.value}
                            onClick={() => handleRecordSession(option.value)}
                            disabled={recordSessionMutation.isPending}
                            className={`${option.color} text-white hover:opacity-90`}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 mb-8">
                <CardContent className="pt-8 pb-8 text-center">
                  <p className="text-gray-600 mb-4">No cards due for review today!</p>
                  <Button
                    onClick={() => setShowStudy(false)}
                    className="btn-shadow"
                  >
                    Create New Card
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create New Card */}
            <div>
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Create Card</CardTitle>
                  <CardDescription>Add a new flashcard</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateCard} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="front">Portuguese</Label>
                      <Input
                        id="front"
                        placeholder="e.g., Olá"
                        value={newCardForm.front}
                        onChange={(e) =>
                          setNewCardForm({ ...newCardForm, front: e.target.value })
                        }
                        className="border-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="back">English</Label>
                      <Input
                        id="back"
                        placeholder="e.g., Hello"
                        value={newCardForm.back}
                        onChange={(e) =>
                          setNewCardForm({ ...newCardForm, back: e.target.value })
                        }
                        className="border-2"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending}
                      className="w-full btn-shadow"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {dueCards && dueCards.length > 0 && (
                <Button
                  onClick={() => setShowStudy(true)}
                  className="w-full mt-4 btn-shadow bg-pink-500 hover:bg-pink-600"
                >
                  Start Study Session ({dueCards.length})
                </Button>
              )}
            </div>

            {/* All Cards */}
            <div className="lg:col-span-2">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Your Cards</CardTitle>
                  <CardDescription>
                    {isAllLoading ? "Loading..." : `${allCards?.length || 0} total cards`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isAllLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="inline h-8 w-8 animate-spin" />
                    </div>
                  ) : allCards && allCards.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {allCards.map((card) => (
                        <div
                          key={card.id}
                          className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-start"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{card.front}</p>
                            <p className="text-xs text-gray-600">{card.back}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Repetitions: {card.repetitions}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMutation.mutate({ flashcardId: card.id })}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-600 py-8">
                      No cards yet. Create your first card!
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
