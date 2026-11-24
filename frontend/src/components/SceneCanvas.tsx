"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";

export default function SceneCanvas({ positions }: { positions: Float32Array }) {
  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 45 }}>
      <color attach="background" args={["#000000"]} />
      <ambientLight intensity={1.0} />
      
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        {/* Render points in stark white against the black void */}
        <pointsMaterial size={0.02} color="#ffffff" sizeAttenuation />
      </points>

      <Grid infiniteGrid fadeDistance={20} sectionColor="#333" cellColor="#111" />
      <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
    </Canvas>
  );
}