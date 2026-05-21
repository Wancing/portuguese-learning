import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { useState } from "react";

export default function ContributorDashboard() {
  const user = null;
const isAuthenticated = false;
const loading = false;
// Redirect to home if accessed directly
if (typeof window !== 'undefined') {
  window.location.href = '/';
}
  const [, navigate] = useLocation();
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "phrase" as "phrase" | "conversation" | "lesson",
    difficulty: "beginner" as "beginner" | "intermediate" | "advanced",
    phraseId: "",
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);

  // Redirect if not authenticated or not a contributor
  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }



  const uploadMutation = trpc.contributors.uploadRecording.useMutation({
    onSuccess: () => {
      toast.success("Recording uploaded successfully!");
      setFormData({
        title: "",
        description: "",
        type: "phrase",
        difficulty: "beginner",
        phraseId: "",
      });
      setAudioFile(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Upload failed");
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !audioFile) {
      toast.error("Please fill in title and select an audio file");
      return;
    }

    setIsUploading(true);

    try {
      // Convert audio file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Audio = (reader.result as string).split(",")[1];
        uploadMutation.mutate({
          title: formData.title,
          description: formData.description,
          type: formData.type,
          difficulty: formData.difficulty,
          phraseId: formData.phraseId ? parseInt(formData.phraseId) : undefined,
          audioData: base64Audio,
          audioName: audioFile.name,
        });
      };
      reader.readAsDataURL(audioFile);
    } catch (error) {
      toast.error("Failed to process audio file");
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen memphis-bg p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold uppercase mb-2">Contributor Dashboard</h1>
          <p className="text-gray-600">Upload your Portuguese audio recordings and conversations</p>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Upload Recording</CardTitle>
            <CardDescription>Share your native Portuguese pronunciation and conversations</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., How to order coffee"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={isUploading}
                  className="border-2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your recording..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={isUploading}
                  className="border-2"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value as "phrase" | "conversation" | "lesson" })
                    }
                    disabled={isUploading}
                  >
                    <SelectTrigger className="border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phrase">Phrase</SelectItem>
                      <SelectItem value="conversation">Conversation</SelectItem>
                      <SelectItem value="lesson">Lesson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        difficulty: value as "beginner" | "intermediate" | "advanced",
                      })
                    }
                    disabled={isUploading}
                  >
                    <SelectTrigger className="border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audio">Audio File (MP3, WAV, M4A) *</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <input
                    id="audio"
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="hidden"
                  />
                  <label htmlFor="audio" className="cursor-pointer">
                    {audioFile ? (
                      <div>
                        <Upload className="mx-auto h-8 w-8 text-accent mb-2" />
                        <p className="font-semibold">{audioFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <p className="font-semibold">Click to upload audio</p>
                        <p className="text-sm text-muted-foreground">or drag and drop</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isUploading}
                className="w-full btn-shadow"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Recording
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="border-2"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
