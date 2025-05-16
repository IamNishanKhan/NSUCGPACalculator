import React, { useState } from "react";
import { BarChart, Award, RefreshCw, Plus, PlusCircle, X } from "lucide-react";
import { CourseResult } from "../types";
import { getGradePoint } from "../utils/cgpaCalculator";

interface ResultCardProps {
  result: {
    cgpa: number;
    totalCredits: number;
    courses: CourseResult[];
  };
}

const ResultCard: React.FC<ResultCardProps> = ({ result: initialResult }) => {
  const [result, setResult] = useState(initialResult);
  const [editedCourses, setEditedCourses] = useState<{
    [key: string]: boolean;
  }>({});
  const [gradeErrors, setGradeErrors] = useState<{ [key: string]: string }>({});
  const [bulkCredits, setBulkCredits] = useState("");
  const [bulkCgpa, setBulkCgpa] = useState("");
  const [bulkError, setBulkError] = useState("");
  const [excluded, setExcluded] = useState<{ [key: number]: boolean }>({});
  const [isRecalculating, setIsRecalculating] = useState(false);

  const enterAnimation = "animate-fade-in-up";

  const getCgpaColor = (cgpa: number) => {
    if (cgpa >= 3.5) return "text-green-500";
    if (cgpa >= 3.0) return "text-blue-500";
    if (cgpa >= 2.0) return "text-yellow-500";
    return "text-red-500";
  };

  const getLetterGrade = (grade: number): string => {
    if (grade >= 4.0) return "A";
    if (grade >= 3.7) return "A-";
    if (grade >= 3.3) return "B+";
    if (grade >= 3.0) return "B";
    if (grade >= 2.7) return "B-";
    if (grade >= 2.3) return "C+";
    if (grade >= 2.0) return "C";
    if (grade >= 1.7) return "C-";
    if (grade >= 1.3) return "D+";
    if (grade >= 1.0) return "D";
    return "F";
  };

  const handleCourseChange = (
    index: number,
    field: keyof CourseResult | "name",
    value: string
  ) => {
    const updatedCourses = [...result.courses];
    const course = { ...updatedCourses[index] };

    // Allow editing without validation
    if (field === "credits") {
      course.credits = Number(value); // convert to number
    } else if (field === "grade") {
      course.grade = value; // keep as string for now
    } else if (field === "name") {
      course.name = value;
    }

    updatedCourses[index] = course;
    setEditedCourses({ ...editedCourses, [index]: true });
    setResult({ ...result, courses: updatedCourses });
    // Do not set gradeErrors here
  };

  const recalculateCGPA = () => {
    setIsRecalculating(true);
    setTimeout(() => {
      let totalPoints = 0;
      let totalCredits = 0;
      const newCourses = [...result.courses];
      const newGradeErrors: { [key: string]: string } = {};
      let hasError = false;

      newCourses.forEach((course, idx) => {
        if (excluded[idx]) return;

        // Validate credits
        const credits = parseFloat(String(course.credits));
        if (isNaN(credits) || credits <= 0) {
          newGradeErrors[idx] = "Invalid credits";
          hasError = true;
          return;
        }
        // Validate grade
        try {
          const gradePoint = getGradePoint(course.grade);
          newCourses[idx].gradePoint = gradePoint;
          newCourses[idx].credits = credits;
        } catch {
          newGradeErrors[idx] = "Invalid grade";
          hasError = true;
          return;
        }
        totalPoints += newCourses[idx].gradePoint * credits;
        totalCredits += credits;
      });

      setGradeErrors(newGradeErrors);

      if (hasError) {
        setIsRecalculating(false);
        return;
      }

      const newCgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
      setResult({
        ...result,
        cgpa: newCgpa,
        totalCredits,
        courses: newCourses,
      });
      setEditedCourses({});
      setIsRecalculating(false);
    }, 600); // Animation duration
  };

  const handleAddCourse = () => {
    setResult({
      ...result,
      courses: [
        { name: "", grade: "", credits: 0, gradePoint: 0 },
        ...result.courses,
      ],
    });
    // The new course is at index 0
    setEditedCourses({ ...editedCourses, 0: true });
  };

  const handleAddBulkCgpa = () => {
    setBulkError("");
    const credits = parseFloat(bulkCredits);
    const cgpa = parseFloat(bulkCgpa);
    if (isNaN(credits) || credits <= 0) {
      setBulkError("Credits must be a positive number");
      return;
    }
    if (isNaN(cgpa) || cgpa < 0 || cgpa > 4.0) {
      setBulkError("CGPA must be between 0 and 4.0");
      return;
    }
    setResult({
      ...result,
      courses: [
        ...result.courses,
        {
          name: "Bulk CGPA Entry",
          grade: cgpa.toFixed(2),
          credits,
          gradePoint: cgpa,
        },
      ],
    });
    setEditedCourses({ ...editedCourses, [result.courses.length]: true });
    setBulkCredits("");
    setBulkCgpa("");
  };

  const handleExcludeCourse = (index: number) => {
    setExcluded({ ...excluded, [index]: true });
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 ${enterAnimation}`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-semibold mb-4">Your Results</h2>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-1.5 rounded text-xs font-medium text-blue-700 dark:text-blue-300">
            {result.courses.length} Courses
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Cumulative GPA
            </div>
            <div
              className={`text-5xl font-bold mb-1 ${getCgpaColor(result.cgpa)}`}
            >
              {result.cgpa.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <Award size={16} />
              <span>{getLetterGrade(result.cgpa)}</span>
            </div>
          </div>

          <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Total Credits
            </div>
            <div className="text-5xl font-bold mb-1 text-green-500">
              {result.totalCredits}
            </div>
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <BarChart size={16} />
              <span>Credit Hours</span>
            </div>
          </div>
        </div>

        {/* Always show course breakdown */}
        <div className="mt-4 overflow-hidden animate-fade-in transition-all duration-300">
          <div className="border-t dark:border-gray-700 pt-4">
            {/* Add Course Button */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Course Breakdown</h3>
              <div className="flex gap-2">
                <button
                  onClick={recalculateCGPA}
                  disabled={isRecalculating}
                  className={`flex items-center gap-2 px-5 py-2 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-xl shadow-lg transition-all border-2 border-blue-400 dark:border-blue-700 ${
                  isRecalculating ? "opacity-80" : ""
                  }`}
                >
                  <RefreshCw
                  size={20}
                  className={isRecalculating ? "animate-spin" : ""}
                  />
                  <span>Recalculate CGPA</span>
                </button>
                <button
                  onClick={handleAddCourse}
                  className="flex items-center gap-1 px-2 py-1 text-base text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/60 rounded-lg transition-colors font-semibold shadow"
                  title="Add new course"
                >
                  <PlusCircle size={20} />
                  Add Course
                </button>
              </div>
            </div>
            {/* Bulk CGPA Entry moved below Course Breakdown heading but above course list */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center gap-3 md:gap-4 dark:from-blue-900/40 dark:via-purple-900/30 dark:to-blue-900/40 border rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="font-semibold text-blue-800 dark:text-blue-200 text-base">
                  Add Bulk CGPA Entry
                </span>
              </div>
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={bulkCredits}
                  onChange={(e) => setBulkCredits(e.target.value)}
                  placeholder="Total Credits"
                  className="w-36 text-center bg-white dark:bg-gray-900 border-2 border-blue-300 dark:border-blue-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 rounded-lg px-3 py-2 text-base transition font-medium shadow-sm"
                />
                <span className="self-center text-gray-600 dark:text-gray-300 font-medium">
                  with CGPA
                </span>
                <input
                  type="number"
                  min="0"
                  max="4"
                  step="0.01"
                  value={bulkCgpa}
                  onChange={(e) => setBulkCgpa(e.target.value)}
                  placeholder="CGPA"
                  className="w-28 text-center bg-white dark:bg-gray-900 border-2 border-blue-300 dark:border-blue-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 rounded-lg px-3 py-2 text-base transition font-medium shadow-sm"
                />
              </div>
              <button
                onClick={handleAddBulkCgpa}
                className="flex items-center gap-2 px-5 py-2 text-base font-bold text-white bg-blue-800 hover:from-purple-700 hover:to-blue-700 dark:from-purple-500 dark:to-blue-500 dark:hover:from-purple-600 dark:hover:to-blue-600 rounded-xl shadow-lg transition-all border-2 border-purple-400 dark:border-blue-700"
              >
                <Plus size={20} />
                Add Bulk CGPA
              </button>
              {bulkError && (
                <span className="text-xs text-red-500 ml-2">{bulkError}</span>
              )}
            </div>
            {/* Course List Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"></th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Credits
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {result.courses.map((course, index) =>
                    excluded[index] ? null : (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={course.name}
                            onChange={(e) =>
                              handleCourseChange(index, "name", e.target.value)
                            }
                            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 rounded px-2 py-1 text-sm transition"
                            placeholder="Course Name"
                          />
                        </td>
                        <td className="px-4 py-3 text-center align-middle">
                          <input
                            type="text"
                            value={course.grade}
                            onChange={(e) =>
                              handleCourseChange(index, "grade", e.target.value)
                            }
                            className={`w-20 text-center bg-white dark:bg-gray-900 border ${
                              gradeErrors[index]
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-800"
                            } focus:ring-2 rounded px-2 py-1 text-sm transition`}
                            placeholder="A, A-, B"
                          />
                        </td>
                        <td className="px-2 py-3 text-left align-middle w-32">
                          {gradeErrors[index] && (
                            <span className="text-xs text-red-500 whitespace-nowrap">
                              {gradeErrors[index]}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={course.credits}
                            onChange={(e) =>
                              handleCourseChange(
                                index,
                                "credits",
                                e.target.value
                              )
                            }
                            min="0"
                            step="0.5"
                            className="w-20 text-center bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 rounded px-2 py-1 text-sm transition"
                            placeholder="Credits"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-gray-100">
                          {(course.gradePoint * course.credits).toFixed(1)}
                        </td>
                        <td className="px-2 py-3 text-center align-middle">
                          <button
                            type="button"
                            onClick={() => handleExcludeCourse(index)}
                            className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-full p-1.5 transition border border-red-200 dark:border-red-700 shadow-sm"
                            title="Exclude this course"
                          >
                            <X size={20} />
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
