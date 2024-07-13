"use client";
import React, { useState } from "react";
import * as XLSX from "xlsx";

export default function UsersTable({ users }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jsonData, setJsonData] = useState({});
  const namedRanges = ["student_names", "Midterm"]; // Add or remove named ranges as needed

  const namedRangesConfig = [
    { name: "student_names", columns: 1 },
    { name: "Midterm", columns: 2 },
    { name: "marks_distribution", columns: 2 },
    { name: "Final_", columns: 2 },
  ];

  function previewData() {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        if (data) {
          const workbook = XLSX.read(data, { type: "binary" });
          let results = {};

          namedRangesConfig.forEach((rangeConfig) => {
            const nameObject = workbook.Workbook?.Names?.find(
              (name) => name.Name === rangeConfig.name
            );
            if (nameObject && nameObject.Ref) {
              const cleanRange = nameObject.Ref.replace(/\$/g, "");
              const sheetName = cleanRange.split("!")[0].replace(/'/g, "");
              const range = cleanRange.split("!")[1];
              const workSheet = workbook.Sheets[sheetName];

              if (workSheet) {
                const options = {
                  range,
                  header: rangeConfig.columns > 1 ? 1 : ["value"], // Handling multiple columns dynamically
                };
                const json = XLSX.utils.sheet_to_json(workSheet, options);
                results[rangeConfig.name] = json;
              } else {
                console.log(
                  `Worksheet not found for range ${rangeConfig.name}`
                );
              }
            } else {
              console.log(
                `Named range ${rangeConfig.name} not found or no reference available`
              );
            }
          });

          setJsonData(results);
        }
      };
      reader.readAsBinaryString(file);
    }
  }

  function saveData() {
    if (file) {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result;
        if (data) {
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const workSheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(workSheet);
          try {
            // Assuming createBulkUsers is a function that takes an array of user data
            await createBulkUsers(json);
            setLoading(false);
          } catch (error) {
            console.log(error);
          }
        }
      };
      reader.readAsBinaryString(file);
    }
  }

  async function clearData() {
    try {
      // Assuming deleteUsers is a function that clears user data
      await deleteUsers();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="py-8 space-y-8">
      <div className="flex items-center gap-8">
        <div>
          <label
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            htmlFor="file_input"
          >
            Upload file
          </label>
          <input
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
            id="file_input"
            type="file"
            accept=".xls,.xlsx"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          />
        </div>
        <button
          onClick={previewData}
          className="py-2 px-6 rounded bg-slate-300 text-slate-900"
        >
          Preview Data
        </button>
        <button
          onClick={saveData}
          className="py-2 px-6 rounded bg-purple-600 text-slate-100"
        >
          Save Data
        </button>
        <button
          onClick={clearData}
          className="py-2 px-6 rounded bg-red-600 text-slate-100"
        >
          Clear Data
        </button>
      </div>
      <pre>{JSON.stringify(jsonData, null, 2)}</pre>
      {loading ? <p>Saving Data please wait...</p> : null}
    </div>
  );
}
