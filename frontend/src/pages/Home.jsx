import React from 'react';
import Layout from '../components/common/Layout';

const Home = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Welcome to <span className="text-green-600">GreenLeaf Farm</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Smart Farm Management System
          </p>
          <div className="space-x-4">
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
              Explore Our Farm
            </button>
            <button className="border border-green-600 text-green-600 px-6 py-3 rounded-lg hover:bg-green-50 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;