import React, { useState } from 'react';
import { BarChart, ChevronDown, ChevronUp, Award, RefreshCw } from 'lucide-react';
import { CourseResult } from '../types';
import { getGradePoint } from '../utils/cgpaCalculator';

interface ResultCardProps {
  result: {
    cgpa: number;
    totalCredits: number;
    courses: CourseResult[];
  };
}

const ResultCard: React.FC<ResultCardProps> = ({ result: initialResult }) => {
  const [result, setResult] = useState(initialResult);
  const [showDetails, setShowDetails] = useState(false);
  const [editedCourses, setEditedCourses] = useState<{ [key: string]: boolean }>({});
  const [gradeErrors, setGradeErrors] = useState<{ [key: string]: string }>({});
  
  const enterAnimation = "animate-fade-in-up";

  const getCgpaColor = (cgpa: number) => {
    if (cgpa >= 3.7) return 'text-green-500';
    if (cgpa >= 3.0) return 'text-blue-500';
    if (cgpa >= 2.0) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getLetterGrade = (grade: number): string => {
    if (grade >= 4.0) return 'A';
    if (grade >= 3.7) return 'A-';
    if (grade >= 3.3) return 'B+';
    if (grade >= 3.0) return 'B';
    if (grade >= 2.7) return 'B-';
    if (grade >= 2.3) return 'C+';
    if (grade >= 2.0) return 'C';
    if (grade >= 1.7) return 'C-';
    if (grade >= 1.3) return 'D+';
    if (grade >= 1.0) return 'D';
    return 'F';
  };

  const handleCourseChange = (index: number, field: keyof CourseResult, value: string) => {
    const updatedCourses = [...result.courses];
    const course = { ...updatedCourses[index] };

    if (field === 'credits') {
      const credits = parseFloat(value);
      if (credits > 0) {
        course[field] = credits;
        setGradeErrors({ ...gradeErrors, [index]: '' });
      }
    } else if (field === 'grade') {
      course[field] = value.toUpperCase();
      try {
        course.gradePoint = getGradePoint(value);
        setGradeErrors({ ...gradeErrors, [index]: '' });
      } catch (error) {
        setGradeErrors({ ...gradeErrors, [index]: 'Invalid grade' });
        return;
      }
    } else {
      course[field] = value;
    }

    updatedCourses[index] = course;
    setEditedCourses({ ...editedCourses, [index]: true });
    setResult({ ...result, courses: updatedCourses });
  };

  const recalculateCGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;

    result.courses.forEach(course => {
      totalPoints += course.gradePoint * course.credits;
      totalCredits += course.credits;
    });

    const newCgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    setResult({
      ...result,
      cgpa: newCgpa,
      totalCredits
    });
    setEditedCourses({});
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 ${enterAnimation}`}>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-semibold mb-4">Your Results</h2>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-1.5 rounded text-xs font-medium text-blue-700 dark:text-blue-300">
            {result.courses.length} Courses
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Cumulative GPA</div>
            <div className={`text-5xl font-bold mb-1 ${getCgpaColor(result.cgpa)}`}>
              {result.cgpa.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <Award size={16} />
              <span>{getLetterGrade(result.cgpa)}</span>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Credits</div>
            <div className="text-5xl font-bold mb-1 text-green-500">
              {result.totalCredits}
            </div>
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <BarChart size={16} />
              <span>Credit Hours</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full mt-6 flex items-center justify-center gap-2 p-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
          {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {showDetails && (
          <div className="mt-4 overflow-hidden animate-fade-in transition-all duration-300">
            <div className="border-t dark:border-gray-700 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Course Breakdown</h3>
                {Object.keys(editedCourses).length > 0 && (
                  <button
                    onClick={recalculateCGPA}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <RefreshCw size={14} className="animate-spin-slow" />
                    <span>Recalculate CGPA</span>
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Grade</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Credits</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {result.courses.map((course, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={course.name}
                            onChange={(e) => handleCourseChange(index, 'name', e.target.value)}
                            className="w-full bg-transparent border-0 focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="px-4 py-3 relative">
                          <input
                            type="text"
                            value={course.grade}
                            onChange={(e) => handleCourseChange(index, 'grade', e.target.value)}
                            className={`w-20 text-center bg-transparent border-0 focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 text-sm ${
                              gradeErrors[index] ? 'border-red-500 focus:ring-red-500' : ''
                            }`}
                            placeholder="A, B+, C..."
                          />
                          {gradeErrors[index] && (
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-red-500">
                              {gradeErrors[index]}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={course.credits}
                            onChange={(e) => handleCourseChange(index, 'credits', e.target.value)}
                            min="0"
                            step="0.5"
                            className="w-20 text-center bg-transparent border-0 focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-gray-100">
                          {(course.gradePoint * course.credits).toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultCard;