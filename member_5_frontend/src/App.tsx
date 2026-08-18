import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Cases } from './pages/Cases';
import { CaseDetails } from './pages/CaseDetails';
import { NetworkAnalysis } from './pages/NetworkAnalysis';
import { EvidencePage } from './pages/Evidence';
import { IntelligenceCell } from './pages/IntelligenceCell';
import { Reports } from './pages/Reports';
import { Audit } from './pages/Audit';
import { FolderKanban } from 'lucide-react';

// 404 Page Component
const NotFound: React.FC = () => (
  <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl space-y-4 max-w-md mx-auto my-12">
    <FolderKanban className="w-12 h-12 text-slate-500 mx-auto" />
    <h2 className="text-xl font-mono font-bold text-slate-100">404 - Page / Case Dossier Not Found</h2>
    <p className="text-xs text-slate-400">
      Unable to load case information or page view. Please try again.
    </p>
    <a
      href="/dashboard"
      className="inline-block px-4 py-2 bg-cyan-500 text-slate-950 font-mono text-xs font-bold rounded-lg"
    >
      Return to Dashboard
    </a>
  </div>
);

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected Main Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="cases" element={<Cases />} />
            <Route path="cases/:id" element={<CaseDetails />} />
            <Route path="network" element={<NetworkAnalysis />} />
            <Route path="evidence" element={<EvidencePage />} />
            <Route path="intelligence" element={<IntelligenceCell />} />
            <Route path="reports" element={<Reports />} />
            <Route path="audit" element={<Audit />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
