import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeFilmBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x08080a, 0.035);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 15);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x22111a, 1.5);
    scene.add(ambientLight);

    // Red Spotlight (Cinema vibe)
    const redSpot = new THREE.SpotLight(0xdc2626, 8, 30, Math.PI / 4, 0.5);
    redSpot.position.set(-10, 10, 10);
    scene.add(redSpot);

    // Gold Spotlight
    const goldSpot = new THREE.SpotLight(0xeab308, 6, 30, Math.PI / 4, 0.5);
    goldSpot.position.set(10, -10, 10);
    scene.add(goldSpot);

    // Blue Rim Light
    const bluePoint = new THREE.PointLight(0x3b82f6, 4, 25);
    bluePoint.position.set(0, 0, -5);
    scene.add(bluePoint);

    // Group to hold all floating 3D film symbols
    const filmSymbolsGroup = new THREE.Group();
    scene.add(filmSymbolsGroup);

    // Helper: Create 3D Film Reel Mesh
    const createFilmReel = () => {
      const reelGroup = new THREE.Group();

      // Outer Ring
      const ringGeo = new THREE.TorusGeometry(1.2, 0.1, 16, 50);
      const metalMat = new THREE.MeshStandardMaterial({
        color: 0x22222a,
        metalness: 0.8,
        roughness: 0.2,
      });
      const ringMesh = new THREE.Mesh(ringGeo, metalMat);
      reelGroup.add(ringMesh);

      // Inner Hub
      const hubGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 24);
      const hubMesh = new THREE.Mesh(hubGeo, metalMat);
      hubMesh.rotation.x = Math.PI / 2;
      reelGroup.add(hubMesh);

      // Spokes (3 cross bars)
      const spokeMat = new THREE.MeshStandardMaterial({
        color: 0xdc2626, // Red spoke accent
        metalness: 0.6,
        roughness: 0.3,
      });

      for (let i = 0; i < 3; i++) {
        const spokeGeo = new THREE.BoxGeometry(2.2, 0.08, 0.06);
        const spokeMesh = new THREE.Mesh(spokeGeo, spokeMat);
        spokeMesh.rotation.z = (i * Math.PI) / 3;
        reelGroup.add(spokeMesh);
      }

      // Film tape wrapped around reel
      const tapeGeo = new THREE.TorusGeometry(0.85, 0.18, 12, 40);
      const tapeMat = new THREE.MeshStandardMaterial({
        color: 0x0f0f15,
        roughness: 0.9,
      });
      const tapeMesh = new THREE.Mesh(tapeGeo, tapeMat);
      reelGroup.add(tapeMesh);

      return reelGroup;
    };

    // Helper: Create 3D Clapperboard Mesh
    const createClapperboard = () => {
      const clapperGroup = new THREE.Group();

      // Main board
      const boardGeo = new THREE.BoxGeometry(1.6, 1.2, 0.1);
      const boardMat = new THREE.MeshStandardMaterial({
        color: 0x111116,
        roughness: 0.4,
      });
      const board = new THREE.Mesh(boardGeo, boardMat);
      clapperGroup.add(board);

      // Top clapper arm
      const armGeo = new THREE.BoxGeometry(1.6, 0.25, 0.12);
      const armMat = new THREE.MeshStandardMaterial({
        color: 0xdc2626,
        roughness: 0.3,
      });
      const arm = new THREE.Mesh(armGeo, armMat);
      arm.position.set(0, 0.65, 0.02);
      arm.rotation.z = -0.15; // Slightly open clapper
      clapperGroup.add(arm);

      // Stripes on board
      const stripeGeo = new THREE.BoxGeometry(0.15, 0.8, 0.11);
      const stripeMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.2,
      });
      for (let i = -2; i <= 2; i += 2) {
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.position.set(i * 0.3, -0.1, 0.01);
        stripe.rotation.z = 0.3;
        clapperGroup.add(stripe);
      }

      return clapperGroup;
    };

    // Helper: Create 3D Film Strip Ribbon
    const createFilmStrip = () => {
      const stripGroup = new THREE.Group();

      // Ribbon body
      const stripGeo = new THREE.BoxGeometry(2.5, 0.6, 0.04);
      const stripMat = new THREE.MeshStandardMaterial({
        color: 0x181820,
        metalness: 0.3,
        roughness: 0.5,
      });
      const strip = new THREE.Mesh(stripGeo, stripMat);
      stripGroup.add(strip);

      // Sprocket holes along top and bottom edges
      const holeGeo = new THREE.BoxGeometry(0.12, 0.08, 0.06);
      const holeMat = new THREE.MeshStandardMaterial({
        color: 0xeab308, // Golden glowing holes
        emissive: 0x713f12,
      });

      for (let x = -1.0; x <= 1.0; x += 0.35) {
        const topHole = new THREE.Mesh(holeGeo, holeMat);
        topHole.position.set(x, 0.22, 0);
        stripGroup.add(topHole);

        const botHole = new THREE.Mesh(holeGeo, holeMat);
        botHole.position.set(x, -0.22, 0);
        stripGroup.add(botHole);
      }

      return stripGroup;
    };

    // Helper: Create 3D Camera / Spotlight Lens
    const createCameraLens = () => {
      const lensGroup = new THREE.Group();

      const bodyGeo = new THREE.CylinderGeometry(0.5, 0.7, 1.2, 24);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x27272a,
        metalness: 0.9,
        roughness: 0.1,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.rotation.x = Math.PI / 2;
      lensGroup.add(body);

      // Glass element
      const glassGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.1, 24);
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        metalness: 0.1,
        roughness: 0.0,
        transparent: true,
        opacity: 0.7,
      });
      const glass = new THREE.Mesh(glassGeo, glassMat);
      glass.rotation.x = Math.PI / 2;
      glass.position.z = 0.6;
      lensGroup.add(glass);

      return lensGroup;
    };

    // Populate objects array with random positions, rotations, & speeds
    interface AnimatedSymbol {
      mesh: THREE.Group;
      rotSpeedX: number;
      rotSpeedY: number;
      rotSpeedZ: number;
      floatSpeed: number;
      initialY: number;
      phase: number;
    }

    const animatedSymbols: AnimatedSymbol[] = [];

    // Create a variety of 3D objects
    const symbolCreators = [
      createFilmReel,
      createClapperboard,
      createFilmStrip,
      createCameraLens,
    ];

    const itemCount = 18; // 18 floating 3D objects in total
    for (let i = 0; i < itemCount; i++) {
      const creator = symbolCreators[i % symbolCreators.length];
      const mesh = creator();

      // Random position spread in 3D volume
      const x = (Math.random() - 0.5) * 28;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 16 - 2;

      mesh.position.set(x, y, z);
      mesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      const scale = 0.7 + Math.random() * 0.8;
      mesh.scale.set(scale, scale, scale);

      filmSymbolsGroup.add(mesh);

      animatedSymbols.push({
        mesh,
        rotSpeedX: (Math.random() - 0.5) * 0.008,
        rotSpeedY: (Math.random() - 0.5) * 0.012,
        rotSpeedZ: (Math.random() - 0.5) * 0.006,
        floatSpeed: 0.001 + Math.random() * 0.002,
        initialY: y,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Floating Golden & Red Dust Particles (Cinema Atmosphere)
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const redColor = new THREE.Color(0xdc2626);
    const goldColor = new THREE.Color(0xeab308);

    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 35;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 25;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 20;

      const c = Math.random() > 0.5 ? redColor : goldColor;
      particleColors[i * 3] = c.r;
      particleColors[i * 3 + 1] = c.g;
      particleColors[i * 3 + 2] = c.b;
    }

    particleGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(particlePos, 3)
    );
    particleGeo.setAttribute(
      'color',
      new THREE.BufferAttribute(particleColors, 3)
    );

    const particleMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse Tracking for subtle parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Window Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Lerp mouse for camera tilt
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      camera.position.x = mouseX * 1.5;
      camera.position.y = -mouseY * 1.5;
      camera.lookAt(0, 0, 0);

      // Animate individual symbols
      animatedSymbols.forEach((item) => {
        item.mesh.rotation.x += item.rotSpeedX;
        item.mesh.rotation.y += item.rotSpeedY;
        item.mesh.rotation.z += item.rotSpeedZ;

        // Gentle sinusoidal bobbing
        item.mesh.position.y =
          item.initialY + Math.sin(elapsedTime * 1.5 + item.phase) * 0.5;
      });

      // Slowly rotate particle field
      particles.rotation.y = elapsedTime * 0.02;
      particles.rotation.x = Math.sin(elapsedTime * 0.01) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-80"
      style={{ filter: 'brightness(0.85) contrast(1.1)' }}
    />
  );
};
