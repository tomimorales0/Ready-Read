import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Reader from "@/pages/Reader";
import { FlowRadio } from "@/components/FlowRadio";
import { useEffect } from "react";
import { TutorialProvider, useTutorial } from "@/contexts/tutorial-context";
import { cn } from "@/lib/utils";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/reader" component={Reader} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { currentStep } = useTutorial();
  const isTutorialStep3 = currentStep === 3;

  return (
    <div className="dark min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary/30 selection:text-white">
      <Router />
      <div className={cn("relative", isTutorialStep3 && "z-[60]")}>
        <FlowRadio />
      </div>
      <Toaster />
    </div>
  );
}

function App() {
  // Lock body scroll on mobile to prevent bounce
  useEffect(() => {
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overscrollBehavior = "auto";
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TutorialProvider>
          <AppContent />
        </TutorialProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
