import { Outlet } from 'react-router';

import Header from '@/components/Header';
import { AuthContext } from "@/contexts/AuthContext";
import { useContext } from 'react';
import { signInWithGooglePopup } from './firebase';


function Layout() {
    const { isLoggedIn, userDetails } = useContext(AuthContext);

    return (
        <div>
            <header>
                <Header isLoggedIn={isLoggedIn} loginHandler={signInWithGooglePopup} userAvatarUrl={userDetails?.avatar || ''} />
            </header>
            <main>
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;