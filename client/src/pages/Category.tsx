import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link, useParams, useLocation } from "wouter";
import { Loader2, ArrowLeft, Search, Volume2 } from "lucide-react";
import { useState } from "react";

export default function Category() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const categoryId = parseInt(params.id || "0");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: category, isLoading: categoryLoading } = trpc.categories.getById.useQuery({ id: categoryId });
  const { data: phrases, isLoading: phrasesLoading } = trpc.phrases.getByCategory.useQuery({ categoryId });

  const filteredPhrases = phrases?.filter(phrase => 
    phrase.textPt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    phrase.textEn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (categoryLoading || phrasesLoading) {
    return (
      <div className="min-h-screen memphis-bg flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen memphis-bg flex items-center justify-center">
        <Card className="max-w-md border-2">
          <CardContent className="py-12 text-center">
            <p className="text-lg mb-4">Category not found</p>
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
      <div className="container py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Button>
          
          <div className="flex items-center gap-4 mb-4">
            <span className="text-6xl">{category.icon || "📚"}</span>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">{category.name}</h1>
              <p className="text-xl text-muted-foreground">{category.nameEn}</p>
            </div>
          </div>
          
          {category.description && (
            <p className="text-lg text-muted-foreground">{category.description}</p>
          )}
        </div>

        {/* Search */}
        <div className="mb-8 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search phrases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-2"
            />
          </div>
        </div>

        {/* Phrases List */}
        {filteredPhrases && filteredPhrases.length > 0 ? (
          <div className="grid gap-4">
            {filteredPhrases.map((phrase) => (
              <Link key={phrase.id} href={`/phrase/${phrase.id}`}>
                <Card className="btn-shadow border-2 hover:scale-[1.02] transition-transform cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2 flex items-center gap-2">
                          {phrase.textPt}
                          <Volume2 className="h-5 w-5 text-primary" />
                        </CardTitle>
                        <CardDescription className="text-lg">
                          {phrase.textEn}
                        </CardDescription>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          phrase.difficulty === 'beginner' ? 'bg-secondary text-secondary-foreground' :
                          phrase.difficulty === 'intermediate' ? 'bg-accent text-accent-foreground' :
                          'bg-primary text-primary-foreground'
                        }`}>
                          {phrase.difficulty}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="border-2">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground text-lg">
                {searchTerm ? "No phrases found matching your search." : "No phrases available in this category yet."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
