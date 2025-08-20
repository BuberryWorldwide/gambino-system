export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-yellow-500 mb-4">🎲 GAMBINO</h1>
        <p className="text-xl text-gray-300 mb-8">The Future of Gaming Tokens</p>
        <div className="space-x-4">
          <a 
            href="/onboard" 
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg"
          >
            Sign Up
          </a>
          <a 
            href="/login" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
          >
            Login
          </a>
        </div>
      </div>
    </div>
  );
}
