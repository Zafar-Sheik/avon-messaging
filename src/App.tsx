import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import GroupsPage from "./pages/Groups";
import DashboardPage from "./pages/Dashboard";
import MessagesPage from "./pages/Messages";
import UploadsPage from "./pages/Uploads";
import SettingsPage from "./pages/Settings";
import RemindersPage from "./pages/Reminders";
import Index from "./pages/Index";
import { ThemeProvider } from "next-themes";
import HomeMenuCards from "@/components/HomeMenuCards";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInset } from "@/components/ui/sidebar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <Sidebar collapsible="icon" className="[&_[data-sidebar=sidebar]]:bg-blue-50 [&_[data-sidebar=sidebar]]:text-blue-900 [&_[data-sidebar=sidebar]]:border-blue-200">
              <SidebarHeader className="space-y-3" />
              <SidebarContent>
                <HomeMenuCards />
              </SidebarContent>
            </Sidebar>
            <SidebarInset>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/groups" element={<GroupsPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/uploads" element={<UploadsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/reminders" element={<RemindersPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SidebarInset>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;