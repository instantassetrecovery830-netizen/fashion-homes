const App = () => {
  return (
    <main className="min-h-screen bg-[#f5f5f0] text-[#0a0a0a] font-sans">
      {/* Hero Section */}
      <section className="flex items-center justify-center h-screen text-center">
        <div className="max-w-3xl px-6">
          <h1 className="font-serif text-5xl md:text-7xl mb-6">
            MyFitStore
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-700">
            A luxury fashion ecosystem connecting designers, vendors, and buyers.
          </p>
          <button className="px-8 py-3 bg-black text-white rounded-full hover:opacity-90 transition">
            Explore Marketplace
          </button>
        </div>
      </section>
    </main>
  );
};

export default App;
