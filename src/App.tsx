import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import KioskConsentPage from "./pages/KioskConsentPage";
import KioskRegisterPage from "./pages/KioskRegisterPage";
import KioskSurveyPage from "./pages/KioskSurveyPage";
import KioskThankYouPage from "./pages/KioskThankYouPage";
import AdminLayout from "./components/AdminLayout";
import DashboardPage from "./pages/DashboardPage";
import VisitorLogsPage from "./pages/VisitorLogsPage";
import SurveyResultsPage from "./pages/SurveyResultsPage";
import UsersPage from "./pages/UsersPage";
import AuditLogsPage from "./pages/AuditLogsPage";
import AgencySettingsPage from "./pages/AgencySettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/kiosk" element={<KioskConsentPage />} />
          <Route path="/kiosk/register" element={<KioskRegisterPage />} />
          <Route path="/kiosk/survey" element={<KioskSurveyPage />} />
          <Route path="/kiosk/thankyou" element={<KioskThankYouPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="visitors" element={<VisitorLogsPage />} />
            <Route path="surveys" element={<SurveyResultsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="audit" element={<AuditLogsPage />} />
            <Route path="settings" element={<AgencySettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
