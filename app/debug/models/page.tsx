"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function DebugModels() {
  const [logs, setLogs] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch("/api/debug/models");
        if (!response.ok) {
          throw new Error("Failed to fetch logs");
        }
        const data = await response.json();
        setLogs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen w-full py-8 px-4 md:px-8 lg:px-12">
      <div className="container mx-auto max-w-7xl bg-white rounded-lg border-4 border-gold-primary shadow-2xl overflow-hidden">
        <Navbar />

        <div className="p-8">
          <h1 className="text-4xl font-bold text-gold-primary mb-8">
            Database Models Debug
          </h1>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gold-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h2 className="text-2xl font-bold text-gold-primary mb-4">
                  Model Counts
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {logs?.counts &&
                    Object.entries(logs.counts).map(([model, count]) => (
                      <div
                        key={model}
                        className="bg-white p-4 rounded-lg shadow"
                      >
                        <h3 className="font-bold text-gold-primary">
                          {model.charAt(0).toUpperCase() + model.slice(1)}
                        </h3>
                        <p className="text-2xl">{count}</p>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg">
                <h2 className="text-2xl font-bold text-gold-primary mb-4">
                  Console Logs
                </h2>
                <p className="text-gray-600">
                  Check your browser's console to see the detailed model data.
                  Press F12 to open developer tools.
                </p>
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}
