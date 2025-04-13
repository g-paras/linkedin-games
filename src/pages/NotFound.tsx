
export default function NotFound() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 text-center px-4">
            <div>
                <h1 className="text-6xl font-bold text-gray-800">404</h1>
                <p className="text-xl mt-4 text-gray-600">Page Not Found</p>
                <p className="mt-2 text-gray-500">Sorry, the page you are looking for doesn't exist.</p>
                <a
                    href="/"
                    className="mt-6 inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                    Go Home
                </a>
            </div>
        </div>
    );
}
