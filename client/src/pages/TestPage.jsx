import React from 'react';

const TestPage = () => {
  return (
    <div className="min-h-screen bg-red-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Test Page - React is Working!
        </h1>
        <p className="text-gray-600">
          If you can see this, React is rendering correctly.
        </p>
        <div className="mt-4 p-4 bg-blue-100 rounded">
          <p className="text-blue-800">
            Current time: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestPage; 