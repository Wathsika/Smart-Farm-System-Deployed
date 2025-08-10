import React from "react";

const Home = () => {
  return (
    // Use transparent section; the background already comes from App.jsx
    <section className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="mb-4 text-5xl font-bold text-gray-800">
          Welcome to <span className="text-green-600">GreenLeaf Farm</span>
        </h1>
        <p className="mb-8 text-xl text-gray-600">Smart Farm Management System</p>
        <div className="space-x-4">
          <button className="rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700 transition-colors">
            Explore Our Farm
          </button>
          <button className="rounded-lg border border-green-600 px-6 py-3 text-green-600 hover:bg-green-50 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
};

export default Home;
