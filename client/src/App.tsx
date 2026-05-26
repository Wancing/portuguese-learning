import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Category from "./pages/Category";
import Phrase from "./pages/Phrase";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Flashcards from "./pages/Flashcards";
import ContributorDashboard from "./pages/ContributorDashboard";
import HowItWorks from "./pages/HowItWorks";
import ConversationPractice from "./pages/ConversationPractice";
import StudentProfile from "./pages/StudentProfile";
import GrammarFeedback from "./pages/GrammarFeedback";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/register"} component={Register} />
      <Route path={"/flashcards"} component={Flashcards} />
      <Route path={"/contributor"} component={ContributorDashboard} />
      <Route path={"/how-it-works"} component={HowItWorks} />
      <Route path={"/conversations"} component={ConversationPractice} />
      <Route path={"/profile"} component={StudentProfile} />
      <Route path={"/grammar"} component={GrammarFeedback} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/category/:id"} component={Category} />
      <Route path={"/phrase/:id"} component={Phrase} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;