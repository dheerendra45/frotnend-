import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout';
import { AnimatedBackground } from './components/AnimatedBackground';
import { Dashboard } from './pages/Dashboard';
import { Upload } from './pages/Upload';
import { Briefings } from './pages/Briefings';
import { BriefingDetails } from './pages/BriefingDetails';
import { PressGuardDashboard } from './pages/PressGuardDashboard';
import { Slices } from './pages/Slices';
import { Settings } from './pages/Settings';
import { About } from './pages/About';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10">
          <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/briefings" element={<Briefings />} />
            <Route path="/briefings/:id" element={<BriefingDetails />} />
            <Route path="/briefings/:id/pressguard" element={<PressGuardDashboard />} />
            <Route path="/briefings/:id/slices" element={<Slices />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/about" element={<About />} />
          </Routes>
          </Layout>
        </div>
        <Toaster 
          position="top-right"
          toastOptions={{
            className: 'rounded-md border shadow-lg bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700',
            duration: 4000,
            success: {
              className: 'bg-green-50 text-green-900 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800',
            },
            error: {
              className: 'bg-red-50 text-red-900 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;