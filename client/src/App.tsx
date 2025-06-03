import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./components/ThemeProvider";
import Home from "@/pages/Home";
import Clients from "@/pages/Clients";
import Agents from "@/pages/Agents";
import SubAgents from "@/pages/SubAgents";
import Tools from "@/pages/Tools";
import EcoPledge from "@/pages/EcoPledge";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/clients" component={Clients} />
      <Route path="/agents" component={Agents} />
      <Route path="/subagents" component={SubAgents} />
      <Route path="/tools" component={Tools} />
      <Route path="/eco-pledge" component={EcoPledge} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
