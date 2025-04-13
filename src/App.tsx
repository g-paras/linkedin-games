import { BrowserRouter, Routes, Route } from "react-router";

import './App.css'
import Home from './pages/Home';
import TangoGamePanel from './tango/GamePanel';
import GameLevels from "./pages/GameLevels";
import NotFound from "./pages/NotFound";


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:gameId" element={<GameLevels />} />
        <Route path="/linkedin-tango/:gameLevelId" element={<TangoGamePanel />} />
        {/* Fallback route for unmatched paths */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
