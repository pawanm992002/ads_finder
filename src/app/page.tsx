"use client";
import axios from "axios";
import { useState } from "react";

export default function Home() {
  const [noOfAutomation, setNoOfAutomation] = useState<number>(1);
  const [noOfPages, setNoOfPages] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [expectSource, setExpectSource] = useState<string>("");
  const [searchError, setSearchError] = useState<string | null>(null);

  const startAutomation = async () => {
    try {
      if (!search.trim()) {
        setSearchError("Search field cannot be empty.");
        return;
      }

      await axios.post("/api/automation", {
        noOfAutomation,
        noOfPages,
        search,
        expectSource,
      });
    } catch (err) {
      console.log("Automation Disrupted", err);
    }
  };

  const stopAutomation = async () => {
    try {
      await axios.delete("/api/automation");
    } catch (err) {
      console.log("Automation Stopped", err);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center relative"
      style={{
        backgroundImage: "url('/bg.jpg')",
      }}
    >
      {/* <div className="absolute inset-0 bg-black bg-opacity-60" /> */}
      <div className="relative z-10 w-full max-w-md bg-white bg-opacity-90 backdrop-blur p-8 rounded-2xl shadow-2xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Ads Explorer
        </h1>
        <div className="space-y-5">
          <div>
            <label
              htmlFor="noOfAutomation"
              className="block text-sm font-medium text-gray-700"
            >
              Number Of Automation <span className="text-red-500">*</span>
            </label>
            <input
              min="1"
              value={noOfAutomation}
              onChange={(e) => setNoOfAutomation(Number(e.target.value))}
              type="number"
              id="noOfAutomation"
              name="noOfAutomation"
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="noOfPages"
              className="block text-sm font-medium text-gray-700"
            >
              Number Of Page Crawl <span className="text-red-500">*</span>
            </label>
            <input
              min="1"
              value={noOfPages}
              onChange={(e) => setNoOfPages(Number(e.target.value))}
              type="number"
              id="noOfPages"
              name="noOfPages"
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700"
            >
              Search <span className="text-red-500">*</span>
            </label>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (e.target.value.trim()) setSearchError(null);
              }}
              type="text"
              id="search"
              name="search"
              className={`mt-1 w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                searchError ? "border-red-500" : ""
              }`}
            />
            {searchError && (
              <p className="text-red-600 text-sm mt-1">{searchError}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="expectSource"
              className="block text-sm font-medium text-gray-700"
            >
              Search Expect
            </label>
            <input
              value={expectSource}
              onChange={(e) => setExpectSource(e.target.value)}
              type="text"
              id="expectSource"
              name="expectSource"
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex justify-between mt-4">
            <button
              onClick={startAutomation}
              className="w-full mr-2 text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-semibold rounded-lg text-sm px-5 py-2.5 focus:outline-none"
            >
              Start
            </button>
            <button
              onClick={stopAutomation}
              className="w-full ml-2 text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 font-semibold rounded-lg text-sm px-5 py-2.5 focus:outline-none"
            >
              Stop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
