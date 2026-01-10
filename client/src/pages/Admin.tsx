import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Loader2, Upload, Music, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [uploadingPhraseId, setUploadingPhraseId] = useState<number | null>(null);

  const { data: categories, isLoading: categoriesLoading } = trpc.categories.list.useQuery();
  const { data: phrases, isLoading: phrasesLoading, refetch: refetchPhrases } = trpc.phrases.list.useQuery();

  const updateAudioMutation = trpc.phrases.updateAudio.useMutation({
    onSuccess: () => {
      toast.success("Audio uploaded successfully!");
      refetchPhrases();
      setUploadingPhraseId(null);
    },
    onError: (error: any) => {
      toast.error(`Upload failed: ${error.message}`);
      setUploadingPhraseId(null);
    },
  });

  const handleFileUpload = async (phraseId: number, file: File) => {
    if (!file.type.startsWith('audio/')) {
      toast.error("Please select an audio file");
      return;
    }

    if (file.size > 16 * 1024 * 1024) {
      toast.error("File size must be less than 16MB");
      return;
    }

    setUploadingPhraseId(phraseId);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      updateAudioMutation.mutate({
        phraseId,
        audioData: base64,
        mimeType: file.type,
      });
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
      setUploadingPhraseId(null);
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="min-h-screen memphis-bg flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen memphis-bg flex items-center justify-center">
        <Card className="max-w-md border-2">
          <CardContent className="py-12 text-center">
            <p className="text-lg mb-4">Please sign in to access the admin panel</p>
            <Button asChild className="btn-shadow">
              <a href={getLoginUrl()}>Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen memphis-bg flex items-center justify-center">
        <Card className="max-w-md border-2">
          <CardContent className="py-12 text-center">
            <p className="text-lg mb-4">You don't have permission to access this page</p>
            <Button onClick={() => navigate("/")} className="btn-shadow">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getCategoryName = (categoryId: number) => {
    return categories?.find(c => c.id === categoryId)?.name || "Unknown";
  };

  return (
    <div className="min-h-screen memphis-bg">
      <div className="container py-8 max-w-6xl relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Admin Panel</h1>
          <p className="text-xl text-muted-foreground">Upload native speaker audio recordings for each phrase</p>
        </div>

        {(categoriesLoading || phrasesLoading) ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            {categories?.map((category) => {
              const categoryPhrases = phrases?.filter(p => p.categoryId === category.id) || [];
              
              if (categoryPhrases.length === 0) return null;

              return (
                <Card key={category.id} className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <span className="text-3xl">{category.icon}</span>
                      <div>
                        <div>{category.name}</div>
                        <div className="text-sm font-normal text-muted-foreground normal-case">
                          {category.nameEn}
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {categoryPhrases.map((phrase) => (
                        <Card key={phrase.id} className="border">
                          <CardContent className="pt-6">
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="font-semibold text-lg mb-1">{phrase.textPt}</p>
                                <p className="text-muted-foreground">{phrase.textEn}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {phrase.audioUrl && !phrase.audioUrl.includes('example.com') && (
                                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                    <Check className="h-4 w-4" />
                                    Audio uploaded
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                              <div className="flex-1 w-full">
                                <Label htmlFor={`audio-${phrase.id}`} className="mb-2 block">
                                  Upload Audio File (MP3, WAV, M4A, max 16MB)
                                </Label>
                                <Input
                                  id={`audio-${phrase.id}`}
                                  type="file"
                                  accept="audio/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleFileUpload(phrase.id, file);
                                    }
                                  }}
                                  disabled={uploadingPhraseId === phrase.id}
                                  className="border-2"
                                />
                              </div>

                              {phrase.audioUrl && !phrase.audioUrl.includes('example.com') && (
                                <audio 
                                  src={phrase.audioUrl} 
                                  controls 
                                  className="max-w-xs"
                                  preload="metadata"
                                />
                              )}

                              {uploadingPhraseId === phrase.id && (
                                <div className="flex items-center gap-2 text-primary">
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                  <span className="text-sm">Uploading...</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Card className="border-2 mt-8 bg-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Audio Recording Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Record in a quiet environment to minimize background noise</li>
              <li>• Speak clearly and at a natural pace</li>
              <li>• Use European Portuguese pronunciation</li>
              <li>• Save files as MP3 or M4A for best compatibility</li>
              <li>• Keep file sizes under 16MB</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
