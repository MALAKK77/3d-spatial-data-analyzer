export default function InspectorHUD({ metrics }: { metrics: any }) {
  return (
    <div className="flex flex-col space-y-4 text-xs">
      <h2 className="text-neutral-400 mb-2 border-b border-neutral-800 pb-2">METRICS</h2>
      
      <div className="flex justify-between">
        <span className="text-neutral-500">VERTICES</span>
        <span>{metrics.vertex_count.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-neutral-500">FACES</span>
        <span>{metrics.face_count.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-neutral-500">DETECTED REGIONS</span>
        <span>{metrics.detected_regions}</span>
      </div>
      
      <h2 className="text-neutral-400 mt-6 mb-2 border-b border-neutral-800 pb-2">BOUNDS (X, Y, Z)</h2>
      {metrics.bounding_box.map((val: number, i: number) => (
        <div key={i} className="flex justify-between">
          <span className="text-neutral-500">AXIS {i + 1}</span>
          <span>{val.toFixed(3)}</span>
        </div>
      ))}
    </div>
  );
}