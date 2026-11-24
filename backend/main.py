from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import trimesh
import numpy as np
from sklearn.cluster import DBSCAN
import tempfile
import base64
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/analyze")
async def analyze_model(file: UploadFile):
    if not file.filename.lower().endswith(('.obj', '.ply', '.stl', '.glb')):
        raise HTTPException(status_code=400, detail="Unsupported file format")

    fd, temp_path = tempfile.mkstemp(suffix=os.path.splitext(file.filename)[1].lower())
    try:
        with os.fdopen(fd, 'wb') as f:
            f.write(await file.read())
        
        mesh = trimesh.load(temp_path, force='mesh')
        vertices = np.array(mesh.vertices, dtype=np.float32)
        
        centroid = vertices.mean(axis=0)
        vertices -= centroid
        max_dist = np.max(np.linalg.norm(vertices, axis=1))
        vertices /= (max_dist / 5.0)

        clustering = DBSCAN(eps=0.2, min_samples=15).fit(vertices)
        labels = clustering.labels_.astype(np.float32)

        metrics = {
            "vertex_count": int(len(vertices)),
            "face_count": int(len(mesh.faces)),
            "bounding_box": mesh.extents.tolist(),
            "detected_regions": int(len(set(labels)) - (1 if -1 in labels else 0))
        }

        pos_b64 = base64.b64encode(vertices.tobytes()).decode('utf-8')
        labels_b64 = base64.b64encode(labels.tobytes()).decode('utf-8')

        return JSONResponse({
            "metrics": metrics,
            "positions": pos_b64,
            "clusters": labels_b64
        })
    finally:
        os.remove(temp_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)