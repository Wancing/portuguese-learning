import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useRef, useEffect } from "react";
import { Loader2, Mic, Square, Volume2, Send, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

interface ConversationTurn {
  role: "user" | "assistant";
  text: string;
  feedback?: string;
}

export default function ConversationPractice() {
  const [, navigate] = useLocation();
const user = null;
const isAuthenticated = false;
// Redirect to home if accessed directly
if (typeof window !== 'undefined') {
  window.location.href = '/';
}
  const [topic, setTopic] = useState("ordering at a restaurant");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startConversationMutation = trpc.conversations.start.useMutation({
    onSuccess: (data) => {
      setSessionId(data.id);
      setConversation([
        {
          role: "assistant",
          text: data.initialPrompt,
        },
      ]);
      setSessionStarted(true);
      toast.success("Conversation started!");
    },
    onError: (error) => {
      toast.error(`Failed to start conversation: ${error.message}`);
    },
  });

  const addTurnMutation = trpc.conversations.addTurn.useMutation({
    onSuccess: (data) => {
      setConversation((prev) => [
        ...prev,
        {
          role: "user",
          text: userInput,
        },
        {
          role: "assistant",
          text: data.response,
          feedback: data.feedback,
        },
      ]);
      setUserInput("");
      setAudioBlob(null);
      setIsLoading(false);
      toast.success("Response received!");
    },
    onError: (error) => {
      toast.error(`Failed to process response: ${error.message}`);
      setIsLoading(false);
    },
  });

  const startConversation = () => {
    startConversationMutation.mutate({ topic, difficulty });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info("Recording started...");
    } catch (error) {
      toast.error("Failed to access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success("Recording stopped!");
    }
  };

  const sendResponse = async () => {
    if (!userInput.trim() && !audioBlob) {
      toast.error("Please type or record a response");
      return;
    }

    if (!sessionId) {
      toast.error("No active session");
      return;
    }

    setIsLoading(true);

    // If audio was recorded, transcribe it
    if (audioBlob) {
      // In a real app, you would transcribe the audio here
      // For now, use the text input
    }

    addTurnMutation.mutate({
      sessionId,
      studentText: userInput,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen memphis-bg flex items-center justify-center">
        <Card className="max-w-md border-2">
          <CardContent className="py-12 text-center">
            <p className="text-lg mb-4">Sign in to practice conversations</p>
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

        <h1 className="text-4xl font-bold mb-8 drop-shadow-[2px_2px_0_rgba(0,0,0,0.1)]">
          Conversation Practice
        </h1>

        {!sessionStarted ? (
          <Card className="border-2 mb-8">
            <CardHeader>
              <CardTitle>Start a Conversation</CardTitle>
              <CardDescription>
                Practice speaking with an AI conversation partner
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., ordering at a restaurant"
                  className="w-full px-4 py-2 border-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full px-4 py-2 border-2 rounded-lg"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <Button
                onClick={startConversation}
                disabled={startConversationMutation.isPending}
                className="btn-shadow w-full"
                size="lg"
              >
                {startConversationMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  "Start Conversation"
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Conversation Display */}
            <Card className="border-2 max-h-96 overflow-y-auto">
              <CardContent className="p-6 space-y-4">
                {conversation.map((turn, index) => (
                  <div
                    key={index}
                    className={`flex ${turn.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        turn.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      <p className="text-sm">{turn.text}</p>
                      {turn.feedback && (
                        <p className="text-xs mt-2 opacity-80">
                          💡 {turn.feedback}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recording and Input */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Your Response
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type your response in Portuguese..."
                  className="w-full px-4 py-2 border-2 rounded-lg min-h-24"
                />

                <div className="flex flex-wrap gap-4">
                  {!isRecording ? (
                    <Button
                      onClick={startRecording}
                      variant="outline"
                      className="btn-shadow"
                    >
                      <Mic className="mr-2 h-4 w-4" />
                      Record Audio
                    </Button>
                  ) : (
                    <Button
                      onClick={stopRecording}
                      variant="destructive"
                      className="btn-shadow"
                    >
                      <Square className="mr-2 h-4 w-4" />
                      Stop Recording
                    </Button>
                  )}

                  {audioBlob && (
                    <audio
                      src={URL.createObjectURL(audioBlob)}
                      controls
                      className="flex-1 min-w-[200px]"
                    />
                  )}
                </div>

                <Button
                  onClick={sendResponse}
                  disabled={isLoading || (!userInput.trim() && !audioBlob)}
                  className="btn-shadow w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Response
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
