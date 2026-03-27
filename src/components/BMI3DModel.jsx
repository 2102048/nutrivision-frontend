import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Text, Billboard } from "@react-three/drei";
import { Suspense, useMemo, useRef, useEffect } from "react";
import * as THREE from "three";

const ModelWithEffects = ({ bmi, height, gender }) => {
  const modelPath = gender === "female" ? "/models/women.glb" : "/models/men.glb";
  const { scene } = useGLTF(modelPath);
  
  const groupRef = useRef();
  const { camera } = useThree();

  const bodyScaleWidth = useMemo(() => {
    if (bmi < 18.5) return 0.85; 
    if (bmi < 25) return 1.0;   
    if (bmi < 30) return 1.35;  
    return 1.7;          
  }, [bmi]);

  const glowColor = useMemo(() => {
    if (bmi < 18.5) return "#3b82f6";
    if (bmi < 25) return "#22c55e";
    if (bmi < 30) return "#f59e0b";
    return "#ef4444";
  }, [bmi]);

  const processedModel = useMemo(() => {
    const clone = scene.clone();
    
    clone.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: glowColor,
          emissive: glowColor,
          emissiveIntensity: 0.2,
          roughness: 0.4,
        });
      }
    });

    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    
    // INCREASED from 5.0 to 7.0 to make the model physically larger in the scene
    const targetHeight = 7.0; 
    const scaleFactor = targetHeight / size.y;
    
    const wrapper = new THREE.Group();
    
    // Position alignment
    clone.position.set(
      - (box.max.x + box.min.x) / 2, 
      - box.min.y, 
      - (box.max.z + box.min.z) / 2
    );
    
    wrapper.add(clone);
    wrapper.scale.set(scaleFactor, scaleFactor, scaleFactor);

    return { scene: wrapper, displayHeight: targetHeight };
  }, [scene, glowColor]);

  // ADJUSTED CAMERA: Closer (Z=8 instead of 9) and centered on the new height
  useEffect(() => {
    const h = processedModel.displayHeight;
    camera.position.set(0, h * 0.5, 8); 
    camera.lookAt(0, h * 0.5, 0);
    camera.updateProjectionMatrix();
  }, [camera, processedModel.displayHeight, gender]);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle hover
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive 
        object={processedModel.scene} 
        scale={[bodyScaleWidth, 1, bodyScaleWidth]}
      />

      {/* RULER / INDICATOR: Scaled to match the new 7.0 height */}
      <group position={[-2.5, 0, 0]}>
        <mesh position={[0, processedModel.displayHeight / 2, 0]}>
          <cylinderGeometry args={[0.025, 0.025, processedModel.displayHeight, 16]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        
        {/* Top Marker */}
        <mesh position={[0, processedModel.displayHeight, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>

        <Billboard position={[0, processedModel.displayHeight + 0.6, 0]}>
          <Text fontSize={0.45} color="#0f172a" fontWeight="900">{height} cm</Text>
        </Billboard>
        
        <Billboard position={[0, -0.4, 0]}>
          <Text fontSize={0.25} color="#94a3b8">0 cm</Text>
        </Billboard>
      </group>
    </group>
  );
};

const BMI3DModel = ({ bmi, height, weight, calories, gender, age }) => {
  return (
    <div className="grid md:grid-cols-2 gap-8 items-stretch p-4 bg-white">
      {/* 3D Visualizer Card */}
      <div className="bg-slate-50 rounded-3xl p-2 shadow-inner border border-slate-200 relative min-h-150 flex items-center justify-center overflow-hidden">
        {/* Adjusted FOV to 35 to "zoom in" slightly more on the content */}
        <Canvas shadows camera={{ fov: 35 }}>
          <ambientLight intensity={1.8} />
          <pointLight position={[10, 10, 10]} intensity={2.5} />
          <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
          
          <Suspense fallback={null}>
            <ModelWithEffects key={gender} bmi={bmi} height={height} gender={gender} />
          </Suspense>
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      </div>

      {/* Composition Card */}
      <div className="bg-white rounded-3xl shadow-2xl p-10 flex flex-col justify-between border border-slate-50">
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight italic">PROFILE</h3>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${gender === 'female' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                    {gender}
                </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">User Age</p>
                    <p className="text-3xl font-bold text-slate-800">{age} <span className="text-sm font-medium text-slate-300">Yrs</span></p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Weight</p>
                    <p className="text-3xl font-bold text-slate-800">{weight} <span className="text-sm font-medium text-slate-300">Kg</span></p>
                </div>
            </div>

            <div className="p-8 bg-slate-900 rounded-3xl text-white shadow-xl flex flex-col items-center">
                <p className="text-slate-400 text-[10px] font-bold uppercase mb-2 tracking-widest">BMI Analysis</p>
                <p className="text-8xl font-black mb-6">{bmi}</p>
                <div className="w-full pt-6 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">Estimated Intake</span>
                    <span className="text-2xl font-bold text-indigo-400">{calories} kcal</span>
                </div>
            </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 italic mt-6 leading-relaxed">
            *Visual calibration: Models are normalized to a consistent 1:1 view height within the interactive container.
        </p>
      </div>
    </div>
  );
};

export default BMI3DModel;