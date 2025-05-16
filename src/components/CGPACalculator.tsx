import React, { useState } from "react";
import { Check, AlertTriangle, Download, PlusCircle } from "lucide-react";
import FileUpload from "./FileUpload";
import ResultCard from "./ResultCard";
import { calculateCgpaFromCsv } from "../utils/cgpaCalculator";
import { CourseResult } from "../types";
import * as XLSX from "xlsx";

const CGPACalculator: React.FC = () => {
  const [result, setResult] = useState<{
    cgpa: number;
    totalCredits: number;
    courses: CourseResult[];
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setFileName(file.name);

    try {
      if (
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls") ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel"
      ) {
        // Excel file
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = new Uint8Array(event.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const csvText = XLSX.utils.sheet_to_csv(firstSheet);
            const { cgpa, totalCredits, courses } =
              calculateCgpaFromCsv(csvText);

            setTimeout(() => {
              setResult({ cgpa, totalCredits, courses });
              setIsProcessing(false);
            }, 800);
          } catch (err) {
            setError((err as Error).message || "Failed to process Excel file");
            setIsProcessing(false);
          }
        };
        reader.onerror = () => {
          setError("Failed to read file");
          setIsProcessing(false);
        };
        reader.readAsArrayBuffer(file);
      } else {
        // CSV file
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const csvText = event.target?.result as string;
            const { cgpa, totalCredits, courses } =
              calculateCgpaFromCsv(csvText);

            setTimeout(() => {
              setResult({ cgpa, totalCredits, courses });
              setIsProcessing(false);
            }, 800);
          } catch (err) {
            setError((err as Error).message || "Failed to process CSV data");
            setIsProcessing(false);
          }
        };
        reader.onerror = () => {
          setError("Failed to read file");
          setIsProcessing(false);
        };
        reader.readAsText(file);
      }
    } catch (err) {
      setError((err as Error).message || "An unexpected error occurred");
      setIsProcessing(false);
    }
  };

  const handleDownloadTemplate = () => {
    const template =
      "Course,Grade,Credits\nMAT130,A,3\nCSE115,B+,4\nENG103,A-,3";
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cgpa_template.csv";
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
              <h2 className="text-xl font-semibold mb-1">
                Upload Your Course Data
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                CSV format with Course, Grade, and Credits columns
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="mt-2 sm:mt-0 flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              <Download size={16} className="mr-1" />
              Download Example CSV / Excel
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
              <p>
                Successfully processed{" "}
                <span className="font-medium">{fileName}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {!result && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() =>
              setResult({
                cgpa: 0,
                totalCredits: 0,
                courses: [],
              })
            }
            className="flex items-center gap-2 px-8 py-5 text-xl font-bold text-green-800 dark:text-green-300 bg-green-100 dark:bg-green-900/40 rounded-2xl border-2 border-green-300 dark:border-green-700 shadow-lg hover:bg-green-200 dark:hover:bg-green-800/60 transition-all duration-200"
            style={{ minWidth: 320 }}
          >
            <PlusCircle size={32} />
            Add Manual Entry
          </button>
        </div>
      )}

      {result && <ResultCard result={result} />}
    </div>
  );
};

export default CGPACalculator;
