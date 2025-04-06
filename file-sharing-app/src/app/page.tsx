export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-indigo-100 to-teal-100 flex items-center justify-center px-4">
      <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-3xl max-w-2xl w-full p-10 md:p-16 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-700 mb-4">
          Welcome to FileShare
        </h1>
        <p className="text-gray-700 text-lg md:text-xl mb-8">
          Effortlessly upload, manage, and share your files — all in one secure place.
        </p>
        <a
          href="/login"
          className="inline-block px-8 py-3 bg-indigo-600 text-white text-lg font-semibold rounded-xl shadow-md hover:bg-indigo-700 transition duration-200"
        >
          Get Started
        </a>
      </div>
    </main>
  );
}
