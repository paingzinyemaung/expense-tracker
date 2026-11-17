import { Route, Routes } from 'react-router';
import DesignPreview from './pages/DesignPreview';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DesignPreview />} />
    </Routes>
  );
}
