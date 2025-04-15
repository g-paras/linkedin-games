import { NavLink } from "react-router";

const Header = ({ isLoggedIn, userAvatarUrl, loginHandler }: { isLoggedIn: boolean, userAvatarUrl: string, loginHandler: React.MouseEventHandler<HTMLButtonElement> }) => {
    return (
        <header className="w-full flex items-center justify-between p-4 bg-white shadow-md">
            <NavLink to={'/'} className="text-xl font-bold text-gray-800">Linkedin Games</NavLink>
            <div>
                {isLoggedIn ? (
                    <img
                        src={userAvatarUrl}
                        alt="User Avatar"
                        className="w-10 h-10 rounded-full object-cover"
                    />
                ) : (
                    <button
                        onClick={loginHandler}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
                    >
                        Login
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;
