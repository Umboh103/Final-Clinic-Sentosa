import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

// Patient Pages
import PatientDashboard from "./pages/patient/Dashboard";
import PatientRegistration from "./pages/patient/Registration";
import PatientHistory from "./pages/patient/History";
import PatientSchedule from "./pages/patient/Schedule";
import PatientReceipt from "./pages/patient/Receipt";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminPatientRegistration from "./pages/admin/PatientRegistration";
import AdminPayments from "./pages/admin/Payments";
import AdminReports from "./pages/admin/Reports";
import AdminPatientManagement from "./pages/admin/PatientManagement";

// Doctor Pages
import DoctorDashboard from "./pages/doctor/Dashboard";
import DoctorExaminations from "./pages/doctor/Examinations";
import DoctorPrescriptions from "./pages/doctor/Prescriptions";

// Pharmacist Pages
import PharmacistDashboard from "./pages/pharmacist/Dashboard";
import PharmacistPrescriptions from "./pages/pharmacist/Prescriptions";
import PharmacistStock from "./pages/pharmacist/Stock";

// Owner Pages
import OwnerDashboard from "./pages/owner/Dashboard";
import OwnerReports from "./pages/owner/Reports";
import OwnerAccounts from "./pages/owner/Accounts";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          
          {/* Patient Routes */}
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/patient/registration" element={<PatientRegistration />} />
          <Route path="/patient/history" element={<PatientHistory />} />
          <Route path="/patient/schedule" element={<PatientSchedule />} />
          <Route path="/patient/receipt" element={<PatientReceipt />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/patient-registration" element={<AdminPatientRegistration />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/patient-management" element={<AdminPatientManagement />} />
          
          {/* Doctor Routes */}
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/examinations" element={<DoctorExaminations />} />
          <Route path="/doctor/prescriptions" element={<DoctorPrescriptions />} />
          
          {/* Pharmacist Routes */}
          <Route path="/pharmacist/dashboard" element={<PharmacistDashboard />} />
          <Route path="/pharmacist/prescriptions" element={<PharmacistPrescriptions />} />
          <Route path="/pharmacist/stock" element={<PharmacistStock />} />
          
          {/* Owner Routes */}
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          <Route path="/owner/reports" element={<OwnerReports />} />
          <Route path="/owner/accounts" element={<OwnerAccounts />} />
          
          {/* Catch all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
