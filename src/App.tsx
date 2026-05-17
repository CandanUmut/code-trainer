import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './routes/Home';
import ProblemPage from './routes/Problem';
import Browse from './routes/Browse';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/problem/:id" element={<ProblemPage />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
