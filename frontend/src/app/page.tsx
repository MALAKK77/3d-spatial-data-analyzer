"use client";
import { useState } from "react";
import SceneCanvas from "@/components/SceneCanvas";
import InspectorHUD from "@/components/InspectorHUD";

export default function AnalysisPlatform() {
  const [modelData, setModelData] = useState<{ positions: Float32Array; clusters: Float32Array } | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || !data.positions) {
        alert(`Backend error: ${data.detail || "Failed to process 3D file"}`);
        return;
      }

      // Decode base64 back into Float32Arrays
      const posBuffer = Uint8Array.from(atob(data.positions), c => c.charCodeAt(0)).buffer;
      const clustersBuffer = Uint8Array.from(atob(data.clusters), c => c.charCodeAt(0)).buffer;

      setModelData({
        positions: new Float32Array(posBuffer),
        clusters: new Float32Array(clustersBuffer)
      });
      setMetrics(data.metrics);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Could not reach the backend server on http://localhost:8000");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-black text-white font-mono">
      {/* Sidebar UI */}
      <div className="w-80 border-r border-neutral-800 flex flex-col p-6 z-10 bg-black">
        <h1 className="text-xl font-bold tracking-tighter mb-8">3D DATA INSPECTOR</h1>
        
        <label className="border border-neutral-700 hover:border-white transition-colors cursor-pointer text-center p-4 text-sm mb-8 flex items-center justify-center">
          {isLoading ? "PROCESSING..." : "UPLOAD MESH (.OBJ, .GLB)"}
          <input type="file" accept=".obj,.ply,.stl,.glb" className="hidden" onChange={handleFileUpload} />
        </label>

        {metrics && <InspectorHUD metrics={metrics} />}
      </div>

      {/* 3D Viewport */}
      <div className="flex-1 relative">
        {modelData ? (
          <SceneCanvas positions={modelData.positions} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-neutral-600 text-sm">
            WAITING FOR GEOMETRY DATA...
          </div>
        )}
      </div>
    </main>
  );
}