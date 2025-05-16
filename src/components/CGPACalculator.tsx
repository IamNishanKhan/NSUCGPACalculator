import React, { useState } from 'react';
import { Upload, FileUp, FileQuestion, Check, AlertTriangle, Download } from 'lucide-react';
import FileUpload from './FileUpload';
import ResultCard from './ResultCard';
import { calculateCgpaFromCsv } from '../utils/cgpaCalculator';
import { CourseResult } from '../types';

const CGPACalculator: React.FC = () => {
  const [result, setResult] = useState<{
    cgpa: number;
    totalCredits: number;
    courses: CourseResult[];
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setFileName(file.name);
    
    try {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const csvText = event.target?.result as string;
          const { cgpa, totalCredits, courses } = calculateCgpaFromCsv(csvText);
          
          // Simulate processing time for better UX
          setTimeout(() => {
            setResult({ cgpa, totalCredits, courses });
            setIsProcessing(false);
          }, 800);
        } catch (err) {
          setError((err as Error).message || 'Failed to process CSV data');
          setIsProcessing(false);
        }
      };
      
      reader.onerror = () => {
        setError('Failed to read file');
        setIsProcessing(false);
      };
      
      reader.readAsText(file);
    } catch (err) {
      setError((err as Error).message || 'An unexpected error occurred');
      setIsProcessing(false);
    }
  };

  const handleDownloadTemplate = () => {
    const template = 'Course,Grade,Credits\nMATH101,A,3\nPHYS101,B+,4\nENGL101,A-,3';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cgpa_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Upload Your Course Data</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                CSV format with Course, Grade, and Credits columns
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="mt-2 sm:mt-0 flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              <Download size={16} className="mr-1" />
              Download Template
            </button>
          </div>
          
          <FileUpload 
            onFileUpload={handleFileUpload} 
            isProcessing={isProcessing}
            error={error}
            fileName={fileName}
          />
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start text-red-700 dark:text-red-400">
              <AlertTriangle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Error processing file</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}
          
          {!error && !isProcessing && result && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center text-green-700 dark:text-green-400">
              <Check size={18} className="mr-2 flex-shrink-0" />
              <p>Successfully processed <span className="font-medium">{fileName}</span></p>
            </div>
          )}
        </div>
      </div>
      
      {result && <ResultCard result={result} />}
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <div className="space-y-3 text-gray-700 dark:text-gray-300">
          <p>1. Upload a CSV file with your course data (course name, grade, and credits).</p>
          <p>2. The calculator will automatically select the best grade for each unique course.</p>
          <p>3. Your CGPA will be calculated based on the standard 4.0 scale.</p>
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 flex items-start">
            <FileQuestion size={20} className="mr-3 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-700 dark:text-blue-400 mb-1">CSV Format Requirements:</p>
              <p>Ensure your CSV has headers and follows this format:</p>
              <pre className="mt-2 bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs overflow-x-auto">
                Course,Grade,Credits<br/>
                MATH101,A,3<br/>
                PHYS101,B+,4<br/>
                ENGL101,A-,3
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CGPACalculator;