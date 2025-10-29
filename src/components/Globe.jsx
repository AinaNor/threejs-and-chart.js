import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

// convert lat/long to 3D coordinates
function latLongToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

function LocationPin({ location, radius }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const position = latLongToVector3(location.latitude, location.longitude, radius + 0.02);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(hovered ? 1.6 : 1.0);
      meshRef.current.material.emissive.set(hovered ? "yellow" : "black");
    }
  });

  return (
    <group position={position}>
      {/* label (clickable) */}
      <Html distanceFactor={10} center>
        <a
          href={location.branch_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            textDecoration: "none",
            color: "white",
            fontWeight: "bold",
            fontSize: "0.8rem",
            background: "rgba(0,0,0,0.6)",
            padding: "4px 6px",
            borderRadius: "4px",
            pointerEvents: "auto",
            transform: "translate(-50%, -120%)",
          }}
        >
          {location.location_name}
        </a>
      </Html>

      {/* hoverable pin */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshStandardMaterial color="red" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function Earth({ locations }) {
  const earthRef = useRef();

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }
  });

//   const earthTexture = new THREE.TextureLoader().load(
//   "https://www.deviantart.com/adamirman2810/art/Earth-Texture-Map-My-Version-961758520?"
// );

// const earthTexture = new THREE.TextureLoader().load(
//   "and_ocean_ice_cloud_2048.jpg"
// );
const earthTexture = new THREE.TextureLoader().load(
  "https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg"
);


  const bordersTexture = new THREE.TextureLoader().load(
    "https://cdn.jsdelivr.net/gh/planetarycomputer/world-geojson@main/earth-borders-map.png"
  );

  return (
    <group ref={earthRef}>
      {/* earth with subtle borders */}
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
         map={earthTexture}
         emissiveMap={bordersTexture}
          emissiveIntensity={0.15}
          emissive="white"
        />
      </mesh>

      {/* location pins (fetched data) */}
      {locations.map((loc) => (
        <LocationPin key={loc.id} location={loc} radius={1} />
      ))}
    </group>
  );
}

export default function Globe() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // eetch data dynamically (from /public )
  useEffect(() => {
    async function fetchData() {
      try {
     

        const response = await fetch("/data/locations.json");
        if (!response.ok) throw new Error("Failed to load location data");

        const json = await response.json();
        setLocations(json);
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ width: "100%", height: "100vh", background: "black", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Loading globe data...</p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100vh", background: "black" }}>
      <Canvas camera={{ position: [0, 0, 2] }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 3, 5]} intensity={1.2} />
        <Earth locations={locations} />
      </Canvas>
    </div>
  );
}
