import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, Sparkles, CheckCircle2, BookOpen, Lightbulb } from "lucide-react";

// ─── Error tag colours ────────────────────────────────────────────────────────

const tagColour: Record<string, string> = {
  article:    "bg-blue-100 text-blue-800 border-blue-200",
  tense:      "bg-purple-100 text-purple-800 border-purple-200",
  word_order: "bg-orange-100 text-orange-800 border-orange-200",
  agreement:  "bg-pink-100 text-pink-800 border-pink-200",
  vocabulary: "bg-yellow-100 text-yellow-800 border-yellow-200",
  spelling:   "bg-red-100 text-red-800 border-red-200",
  preposition:"bg-teal-100 text-teal-800 border-teal-200",
  accent:     "bg-indigo-100 text-indigo-800 border-indigo-200",
  other:      "bg-gray-100 text-gray-700 border-gray-200",
};

const tagLabel: Record<string, string> = {
  article:     "Article",
  tense:       "Tense",
  word_order:  "Word Order",
  agreement:   "Agreement",
  vocabulary:  "Vocabulary",
  spelling:    "Spelling",
  preposition: "Preposition",
  accent:      "Accent",
  other:       "Other",
};

// ─── Example sentences for quick-start ───────────────────────────────────────

const EXAMPLES = [
  "Eu gosto muito de ir ao praia com os meus amigos.",
  "Ontem eu vai ao supermercado comprar leite.",
  "A minha mãe tem trinta e cinco anos e ela é muito simpática.",
  "Eu estou a aprender o português desde dois anos.",
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function GrammarFeedback() {
  const [sentence, setSentence] = useState("");
  const [submittedOnce, setSubmittedOnce] = useState(false);

  const check = trpc.grammar.check.useMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sentence.trim()) return;
    setSubmittedOnce(true);
    check.mutate({ sentence: sentence.trim() });
  };

  const handleExample = (ex: string) => {
    setSentence(ex);
  };

  const result = check.data;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">AI Grammar Feedback</h1>
          </div>
          <Badge variant="secondary" className="ml-auto text-xs">
            Powered by AI · European Portuguese
          </Badge>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* ── Intro ── */}
        <div>
          <p className="text-muted-foreground text-sm">
            Write a sentence in Portuguese and get instant grammar analysis —
            corrections, explanations, error tags, and a follow-up practice sentence.
          </p>
        </div>

        {/* ── Input form ── */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="sentence">
                  Your Portuguese sentence
                </label>
                <Textarea
                  id="sentence"
                  placeholder="e.g. Eu gosto muito de ir ao praia…"
                  value={sentence}
                  onChange={(e) => setSentence(e.target.value)}
                  rows={3}
                  className="resize-none"
                  disabled={check.isPending}
                />
              </div>

              {/* Example quick-fills */}
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Try an example:</p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => handleExample(ex)}
                      className="text-xs px-2.5 py-1 rounded-full border border-border
                                 hover:bg-accent hover:text-accent-foreground
                                 transition-colors text-left"
                    >
                      {ex.length > 42 ? ex.slice(0, 42) + "…" : ex}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={!sentence.trim() || check.isPending}
                className="w-full gap-2"
              >
                {check.isPending ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Analysing…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Check Grammar
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ── Error state ── */}
        {check.isError && (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">
                Something went wrong. Please try again.
              </p>
            </CardContent>
          </Card>
        )}

        {/* ── Results ── */}
        {result && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">

            {/* Already correct banner */}
            {result.isAlreadyCorrect && (
              <div className="flex items-center gap-2.5 rounded-lg border border-green-200
                              bg-green-50 dark:bg-green-950/20 px-4 py-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  Your sentence is grammatically correct! 🎉
                </p>
              </div>
            )}

            {/* Error tags */}
            {result.errorTags.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Error types found</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.errorTags.map((tag) => (
                      <span
                        key={tag}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs
                                    font-medium border ${
                                      tagColour[tag] ?? tagColour.other
                                    }`}
                      >
                        {tagLabel[tag] ?? tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Corrected sentence */}
            {!result.isAlreadyCorrect && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Corrected sentence</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Side-by-side diff */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="rounded-md bg-red-50 dark:bg-red-950/20 border border-red-200
                                    dark:border-red-800/40 px-3 py-2.5">
                      <p className="text-xs font-medium text-red-600 mb-1">Original</p>
                      <p className="text-sm text-red-900 dark:text-red-100">{check.variables?.sentence}</p>
                    </div>
                    <div className="rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200
                                    dark:border-green-800/40 px-3 py-2.5">
                      <p className="text-xs font-medium text-green-600 mb-1">Corrected</p>
                      <p className="text-sm text-green-900 dark:text-green-100">{result.corrected}</p>
                    </div>
                  </div>

                  {/* Overall explanation */}
                  <p className="text-sm text-muted-foreground">{result.explanation}</p>
                </CardContent>
              </Card>
            )}

            {/* Per-change breakdown */}
            {result.changes.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Detailed corrections</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.changes.map((change, i) => (
                    <div
                      key={i}
                      className="rounded-md border border-border bg-muted/30 px-3 py-2.5 space-y-1.5"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="line-through text-sm text-muted-foreground">
                          {change.original}
                        </span>
                        <span className="text-muted-foreground">→</span>
                        <span className="text-sm font-medium text-foreground">
                          {change.corrected}
                        </span>
                        <span
                          className={`ml-auto inline-flex items-center px-2 py-0.5 rounded-full
                                      text-xs font-medium border ${
                                        tagColour[change.errorType] ?? tagColour.other
                                      }`}
                        >
                          {tagLabel[change.errorType] ?? change.errorType}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{change.reason}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Practice sentence */}
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  Practice this
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                <p className="text-base font-medium">{result.practiceSentence}</p>
                <p className="text-sm text-muted-foreground italic">
                  {result.practiceSentenceEnglish}
                </p>
                <p className="text-xs text-muted-foreground pt-1">
                  Try writing a response using the same grammar pattern.
                </p>
              </CardContent>
            </Card>

            {/* Encourage re-submission */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>Submit another sentence to keep practising.</span>
            </div>
          </div>
        )}

        {/* ── Empty state on first load ── */}
        {!submittedOnce && !result && (
          <div className="text-center py-12 text-muted-foreground">
            <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Your grammar feedback will appear here.</p>
          </div>
        )}
      </main>
    </div>
  );
}
