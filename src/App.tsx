import React from 'react';
import { Github } from 'lucide-react';
import Layout from './components/Layout';
import CGPACalculator from './components/CGPACalculator';

function App() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-2">
            CGPA Calculator
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload your course data CSV and get your CGPA instantly
          </p>
        </header>
        
        <CGPACalculator />
        
        <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
          <Github size={16} />
          <span>Source code available on GitHub</span>
        </footer>
      </div>
    </Layout>
  );
}

export default App;