export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
      <div className="text-center p-10 rounded-2xl shadow-2xl bg-white/10 backdrop-blur-md max-w-xl w-full">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 drop-shadow-md">
          Welcome to the File Sharing System
        </h1>
        <p className="text-lg md:text-xl mb-8 text-white/90">
          Securely upload, manage, and share your files with ease.
        </p>
        <a
          href="/login"
          className="inline-block px-6 py-3 bg-white text-blue-600 font-semibold text-lg rounded-xl shadow-md hover:bg-gray-100 transition-all"
        >
          Login
        </a>
      </div>
    </main>
  );
}
