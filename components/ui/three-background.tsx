"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const TRAIL_LENGTH = 20;

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform vec2 uTrail[${TRAIL_LENGTH}];
  varying vec2 vUv;

  // Hash for organic hover edge
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    vec2 pixel = vUv * uResolution;
    vec2 mousePixel = uMouse * uResolution;
    
    // Calculate displacement from current cursor
    vec2 toMouse = pixel - mousePixel;
    float dist = length(toMouse);
    float pushRadius = 75.0;
    float pushStrength = smoothstep(pushRadius, 0.0, dist) * 4.0;
    vec2 pushDir = normalize(toMouse + 0.001);
    
    // Apply displacement
    vec2 displacedPixel = pixel + pushDir * pushStrength;
    
    // Create grid of dots
    vec2 grid = mod(displacedPixel, 3.0);
    float dot = step(grid.x, 2.0) * step(grid.y, 2.0);
    
    // Grid cell for noise
    vec2 cell = floor(displacedPixel / 3.0);
    float noise = hash(cell);
    
    // Calculate hover from current mouse + trail
    float noisyRadius = 40.0 + noise * 30.0;
    float hover = smoothstep(noisyRadius, noisyRadius * 0.3, dist);
    
    // Add fading trail influence
    for (int i = 0; i < ${TRAIL_LENGTH}; i++) {
      vec2 trailPixel = uTrail[i] * uResolution;
      float trailDist = distance(pixel, trailPixel);
      float trailFade = 1.0 - float(i) / float(${TRAIL_LENGTH}); // Fade based on age
      float trailRadius = noisyRadius * trailFade;
      float trailHover = smoothstep(trailRadius, trailRadius * 0.3, trailDist) * trailFade * 0.7;
      hover = max(hover, trailHover);
    }
    
    // Depth brightness
    float depthBrightness = 1.0 + smoothstep(pushRadius, 0.0, dist) * 0.3;
    
    // Colors
    vec3 blackGrain = vec3(0.08);
    vec3 pinkGrain = vec3(1.0, 0.75, 0.80) * depthBrightness;
    vec3 background = vec3(0.0);
    
    // Mix colors
    vec3 grainColor = mix(blackGrain, pinkGrain, hover);
    vec3 finalColor = mix(background, grainColor, dot);
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

function GrainPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const mouseRef = useRef({ x: -1, y: -1 });
  const smoothMouseRef = useRef({ x: -1, y: -1 });
  const trailRef = useRef<{ x: number; y: number }[]>(
    Array(TRAIL_LENGTH).fill({ x: -1, y: -1 })
  );
  const frameCountRef = useRef(0);
  const { size, viewport } = useThree();

  const uniforms = useMemo(() => {
    const trailArray = Array(TRAIL_LENGTH)
      .fill(null)
      .map(() => new THREE.Vector2(-1, -1));
    return {
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uMouse: { value: new THREE.Vector2(-1, -1) },
      uTrail: { value: trailArray },
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: 1.0 - e.clientY / window.innerHeight,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1, y: -1 };
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  useFrame(() => {
    // Lerp smooth mouse
    const lerpFactor = 0.08;
    smoothMouseRef.current.x += (mouseRef.current.x - smoothMouseRef.current.x) * lerpFactor;
    smoothMouseRef.current.y += (mouseRef.current.y - smoothMouseRef.current.y) * lerpFactor;

    // Update trail every 3 frames
    frameCountRef.current++;
    if (frameCountRef.current % 3 === 0) {
      trailRef.current.pop();
      trailRef.current.unshift({ ...smoothMouseRef.current });
    }

    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uResolution.value.set(size.width, size.height);
      material.uniforms.uMouse.value.set(smoothMouseRef.current.x, smoothMouseRef.current.y);
      
      // Update trail uniforms
      trailRef.current.forEach((pos, i) => {
        material.uniforms.uTrail.value[i].set(pos.x, pos.y);
      });
    }
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export function ThreeBackground() {
  return (
    <div className="absolute inset-0 z-0" style={{ pointerEvents: "none" }}>
      <Canvas
        camera={{ position: [0, 0, 1] }}
        gl={{ antialias: false }}
        style={{ pointerEvents: "auto" }}
      >
        <GrainPlane />
      </Canvas>
    </div>
  );
}
