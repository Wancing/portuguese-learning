import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams, useLocation } from "wouter";
import { Loader2, ArrowLeft, Volume2, Mic, Square, Sparkles } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

export default function Phrase() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const phraseId = parseInt(params.id || "0");
  const user = null; // Bypass auth for demo
  const isAuthenticated = false;
  
  const { data: phrase, isLoading: phraseLoading } = trpc.phrases.getById.useQuery({ id: phraseId });
  const { data: recordings, refetch: refetchRecordings } = trpc.recordings.getByPhrase.useQuery(
    { phraseId },
    { enabled: isAuthenticated }
  );

  const uploadMutation = trpc.recordings.upload.useMutation({
    onSuccess: () => {
      toast.success("Recording uploaded successfully!");
      refetchRecordings();
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const transcribeMutation = trpc.recordings.transcribe.useMutation({
    onSuccess: () => {
      toast.success("Transcription and feedback generated!");
      refetchRecordings();
    },
    onError: (error) => {
      toast.error(`Transcription failed: ${error.message}`);
    },
  });

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Native audio playback
  const nativeAudioRef = useRef<HTMLAudioElement | null>(null);

  const playNativeAudio = () => {
    if (nativeAudioRef.current) {
      if (nativeAudioRef.current.paused) {
        nativeAudioRef.current.play().catch(err => {
          console.error('Failed to play audio:', err);
          toast.error('Failed to play audio. Check if file is available.');
        });
      } else {
        nativeAudioRef.current.pause();
        nativeAudioRef.current.currentTime = 0;
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info("Recording started...");
    } catch (error) {
      toast.error("Failed to access microphone. Please check permissions.");
      console.error("Recording error:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success("Recording stopped!");
    }
  };

  const uploadRecording = async () => {
    if (!audioBlob) {
      toast.error("No recording to upload");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      uploadMutation.mutate({
        phraseId,
        audioData: base64,
        mimeType: 'audio/webm',
      });
    };
    reader.readAsDataURL(audioBlob);
  };

  const analyzeRecording = (recordingId: number) => {
    transcribeMutation.mutate({ recordingId });
  };

  if (phraseLoading) {
    return (
      <div className="min-h-screen memphis-bg flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!phrase) {
    return (
      <div className="min-h-screen memphis-bg flex items-center justify-center">
        <Card className="max-w-md border-2">
          <CardContent className="py-12 text-center">
            <p className="text-lg mb-4">Phrase not found</p>
            <Button onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen memphis-bg">
      <div className="container py-8 max-w-4xl relative z-10">
        <Button variant="ghost" onClick={() => window.history.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Phrase Card */}
        <Card className="border-2 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                phrase.difficulty === 'beginner' ? 'bg-secondary text-secondary-foreground' :
                phrase.difficulty === 'intermediate' ? 'bg-accent text-accent-foreground' :
                'bg-primary text-primary-foreground'
              }`}>
                {phrase.difficulty}
              </span>
            </div>
            <CardTitle className="text-3xl md:text-4xl mb-4">{phrase.textPt}</CardTitle>
            <CardDescription className="text-xl">{phrase.textEn}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              size="lg" 
              className="btn-shadow w-full md:w-auto"
              onClick={playNativeAudio}
              disabled={!phrase.audioUrl}
            >
              <Volume2 className="mr-2 h-5 w-5" />
              Play Native Audio
            </Button>
            <audio
              ref={nativeAudioRef}
              src={phrase.audioUrl || ''}
              crossOrigin="anonymous"
              style={{ display: 'none' }}
            />
          </CardContent>
        </Card>

        {/* Recording Section - Hidden for demo since auth is disabled */}
        {!isAuthenticated ? (
          <Card className="border-2 mb-8">
            <CardContent className="py-12 text-center">
              <p className="text-lg mb-4">Recording feature available with authentication</p>
              <p className="text-muted-foreground">This demo focuses on browsing phrases and categories</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="border-2 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-6 w-6" />
                  Record Your Pronunciation
                </CardTitle>
                <CardDescription>
                  Click "Start Recording" to record your voice, then click "Stop Recording" when done. Your recording will be saved and compared with the native speaker audio above.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  {!isRecording ? (
                    <Button 
                      size="lg" 
                      className="btn-shadow"
                      onClick={startRecording}
                      disabled={uploadMutation.isPending}
                    >
                      <Mic className="mr-2 h-5 w-5" />
                      Start Recording
                    </Button>
                  ) : (
                    <Button 
                      size="lg" 
                      variant="destructive"
                      className="btn-shadow"
                      onClick={stopRecording}
                    >
                      <Square className="mr-2 h-5 w-5" />
                      Stop Recording
                    </Button>
                  )}

                  {audioUrl && (
                    <>
                      <div className="w-full">
                        <p className="text-sm font-medium mb-2">Your Recording:</p>
                        <audio src={audioUrl} controls className="w-full" />
                      </div>
                      <Button 
                        size="lg" 
                        className="btn-shadow"
                        onClick={uploadRecording}
                        disabled={uploadMutation.isPending}
                      >
                        {uploadMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          "Save Recording"
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Previous Recordings */}
            {recordings && recordings.length > 0 && (
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Your Recordings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recordings.map((recording) => (
                    <Card key={recording.id} className="border">
                      <CardContent className="pt-6">
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-4 flex-wrap">
                            <audio src={recording.audioUrl} controls className="flex-1 min-w-[200px]" />
                            {!recording.transcription && (
                              <>
                                <Button
                                  onClick={() => analyzeRecording(recording.id)}
                                  disabled={transcribeMutation.isPending}
                                  className="btn-shadow"
                                >
                                  {transcribeMutation.isPending ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Analyzing...
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="mr-2 h-4 w-4" />
                                      Get Feedback
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    toast.info("Skipped AI analysis. Your recording is saved.");
                                  }}
                                  className="btn-shadow"
                                >
                                  Skip
                                </Button>
                              </>
                            )}
                          </div>

                          {recording.transcription && (
                            <div className="space-y-3">
                              <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm font-medium mb-1">Your pronunciation:</p>
                                <p className="text-lg">{recording.transcription}</p>
                              </div>
                              {recording.feedback && (
                                <div className="p-4 bg-accent/20 rounded-lg border-2 border-accent">
                                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    AI Feedback:
                                  </p>
                                  <p className="text-base whitespace-pre-wrap">{recording.feedback}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}