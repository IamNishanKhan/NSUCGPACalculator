import { CourseResult } from '../types';

interface CourseData {
  name: string;
  grade: string;
  credits: number;
  gradePoint: number;
}

// Convert letter grade to grade point
export const getGradePoint = (grade: string): number => {
  grade = grade.toUpperCase();
  
  const gradeMap: { [key: string]: number } = {
    'A+': 4.0,
    'A': 4.0,
    'A-': 3.7,
    'B+': 3.3,
    'B': 3.0,
    'B-': 2.7,
    'C+': 2.3,
    'C': 2.0,
    'C-': 1.7,
    'D+': 1.3,
    'D': 1.0,
    'F': 0.0
  };

  // Also support numeric grades (assuming a 4.0 scale)
  const numericGrade = parseFloat(grade);
  if (!isNaN(numericGrade) && numericGrade >= 0 && numericGrade <= 4.0) {
    return numericGrade;
  }

  if (!(grade in gradeMap)) {
    throw new Error(`Invalid grade: ${grade}`);
  }

  return gradeMap[grade];
};

export const calculateCgpaFromCsv = (csvText: string): { 
  cgpa: number; 
  totalCredits: number; 
  courses: CourseResult[];
} => {
  // Parse CSV
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file must have a header row and at least one data row');
  }

  // Extract and normalize headers
  const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
  
  // Find column indices (now more flexible with header names)
  const courseIndex = headers.findIndex(h => h.includes('course'));
  const gradeIndex = headers.findIndex(h => h.includes('grade'));
  const creditsIndex = headers.findIndex(h => ['credit', 'credits'].some(term => h.includes(term)));
  
  if (courseIndex === -1 || gradeIndex === -1 || creditsIndex === -1) {
    throw new Error('CSV file must have columns for course, grade, and credits (header names can vary)');
  }

  // Process course data
  const courseMap = new Map<string, CourseData>();
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue; // Skip empty lines
    
    const values = lines[i].split(',').map(val => val.trim());
    const courseName = values[courseIndex];
    const grade = values[gradeIndex];
    const credits = parseFloat(values[creditsIndex]);
    
    // Validate data
    if (!courseName) {
      throw new Error(`Line ${i+1}: Course name is required`);
    }
    
    if (!grade) {
      throw new Error(`Line ${i+1}: Grade is required for ${courseName}`);
    }
    
    if (isNaN(credits) || credits <= 0) {
      throw new Error(`Line ${i+1}: Credits must be a positive number for ${courseName}`);
    }
    
    // Calculate grade point
    const gradePoint = getGradePoint(grade);
    
    // Check if we already have this course, keep the better grade
    if (courseMap.has(courseName)) {
      const existingCourse = courseMap.get(courseName)!;
      if (gradePoint > existingCourse.gradePoint) {
        courseMap.set(courseName, { name: courseName, grade, credits, gradePoint });
      }
    } else {
      courseMap.set(courseName, { name: courseName, grade, credits, gradePoint });
    }
  }
  
  // Calculate CGPA
  let totalPoints = 0;
  let totalCredits = 0;
  const courses: CourseResult[] = [];
  
  courseMap.forEach(course => {
    totalPoints += course.gradePoint * course.credits;
    totalCredits += course.credits;
    courses.push({
      name: course.name,
      grade: course.grade,
      credits: course.credits,
      gradePoint: course.gradePoint
    });
  });
  
  if (totalCredits === 0) {
    throw new Error('No valid courses found in the CSV');
  }
  
  const cgpa = totalPoints / totalCredits;
  
  return {
    cgpa,
    totalCredits,
    courses: courses.sort((a, b) => a.name.localeCompare(b.name))
  };
};