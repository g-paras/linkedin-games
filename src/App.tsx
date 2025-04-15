import { BrowserRouter, Routes, Route } from "react-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

import '@/App.css'
import Home from '@/pages/Home';
import TangoGamePanel from '@/tango/GamePanel';
import GameLevels from "@/pages/GameLevels";
import NotFound from "@/pages/NotFound";
import { AuthContext } from "@/contexts/AuthContext";
import Layout from "@/Layout";
import { UserAuth } from "@/types";

function App() {
  const [userAuth, setUserAuth] = useState<UserAuth>({ isLoggedIn: false });

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // await getOrCreateUser({
        //   email: user.email,
        //   displayName: user.displayName,
        //   avatar: user.photoURL,
        // })
        setUserAuth({
          isLoggedIn: true,
          userDetails: {
            displayName: user.displayName!,
            avatar: user.photoURL!,
            uid: user.uid,
          }
        })
      } else {
        setUserAuth({
          isLoggedIn: false,
        })
      }
      document.getElementById('global-loader')?.classList.add('hidden');
    });
  }, [])

  return (
    <AuthContext.Provider value={userAuth}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/:gameId" element={<GameLevels />} />
            <Route path="/linkedin-tango/:gameLevelId" element={<TangoGamePanel />} />
            {/* Fallback route for unmatched paths */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}

export default App
