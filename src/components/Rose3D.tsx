import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoseTheme } from '../types';

export interface Rose3DHandle {
  captureScreenshot: () => string | null;
  triggerKissBurst: () => void;
  resetView: () => void;
}

interface Rose3DProps {
  theme: RoseTheme;
  bloom: number; // 0 (bud) to 1 (full open)
  showDewDrops: boolean;
  autoRotate: boolean;
  rotationSpeed: number;
}

// Parametric petal coordinate calculator
function calculatePetalPoint(w: number, h: number, cup: number, curl: number, x: number, y: number): [number, number, number] {
  const e = Math.pow(Math.sin(Math.PI * (0.1 + 0.85 * y)), 0.6);
  const ax = Math.abs(2 * x);
  const px = x * w * e * 2;
  const py = y * h;
  const pz = -cup * ax * ax * 0.35 * (0.4 + y) * w + curl * y * y * h * 0.3 * (1 + ax);
  return [px, py, pz];
}

// Create petal geometry with vertex colors for velvet depth
function createPetalGeometry(w: number, h: number, cup: number, curl: number, baseColor: [number, number, number]): THREE.PlaneGeometry {
  const geo = new THREE.PlaneGeometry(1, 1, 14, 14);
  const pos = geo.attributes.position;
  const cols: number[] = [];

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i) + 0.5; // shift origin to base of petal
    const pt = calculatePetalPoint(w, h, cup, curl, x, y);
    pos.setXYZ(i, pt[0], pt[1], pt[2]);

    // Color gradient: darker velvety center, brighter highlighted edge
    const ax = Math.abs(2 * x);
    const shade = 0.28 + 0.72 * Math.pow(y, 0.85);
    const edgeHighlight = 0.3 * ax * ax * y;

    cols.push(
      Math.min(1, baseColor[0] * shade + edgeHighlight * 0.6),
      Math.min(1, baseColor[1] * shade + edgeHighlight * 0.3),
      Math.min(1, baseColor[2] * shade + edgeHighlight * 0.9)
    );
  }

  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  geo.computeVertexNormals();
  return geo;
}

export const Rose3D = forwardRef<Rose3DHandle, Rose3DProps>(({
  theme,
  bloom,
  showDewDrops,
  autoRotate,
  rotationSpeed,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Scene references for updates
  const plantGroupRef = useRef<THREE.Group | null>(null);
  const roseHeadRef = useRef<THREE.Group | null>(null);
  const petalsRef = useRef<{ mesh: THREE.Mesh; defaultTilt: number; defaultR: number; defaultW: number; defaultH: number; defaultCup: number; defaultCurl: number; angle: number; t: number }[]>([]);
  const dewDropsRef = useRef<THREE.Mesh[]>([]);
  const auraSpriteRef = useRef<THREE.Sprite | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const pointLight1Ref = useRef<THREE.PointLight | null>(null);
  const pointLight2Ref = useRef<THREE.PointLight | null>(null);
  const petalMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);

  // Interaction state
  const isDraggingRef = useRef(false);
  const previousPointerPosRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0.28, y: 0 });
  const currentRotationRef = useRef({ x: 0.28, y: 0 });
  const targetScaleRef = useRef(1);
  const currentScaleRef = useRef(1);
  const burstParticlesRef = useRef<THREE.Points | null>(null);

  // Expose imperative methods for taking photo & bursting kiss particles
  useImperativeHandle(ref, () => ({
    captureScreenshot: () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return null;
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      return rendererRef.current.domElement.toDataURL('image/png');
    },
    triggerKissBurst: () => {
      if (!sceneRef.current) return;
      // Spawn swirling heart particles around the rose
      const count = 70;
      const geo = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const velocities: { x: number; y: number; z: number; life: number }[] = [];

      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 0.4;
        positions[i * 3 + 1] = 0.5 + (Math.random() - 0.5) * 0.3;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 0.4;

        velocities.push({
          x: (Math.random() - 0.5) * 0.04,
          y: 0.02 + Math.random() * 0.04,
          z: (Math.random() - 0.5) * 0.04,
          life: 1.0,
        });
      }

      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      // Create glowing heart/circle canvas particle
      const pCanvas = document.createElement('canvas');
      pCanvas.width = 64;
      pCanvas.height = 64;
      const ctx = pCanvas.getContext('2d')!;
      ctx.fillStyle = '#f5d0fe';
      ctx.shadowColor = '#d946ef';
      ctx.shadowBlur = 10;
      ctx.font = '36px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💜', 32, 34);

      const pTex = new THREE.CanvasTexture(pCanvas);
      const pMat = new THREE.PointsMaterial({
        size: 0.28,
        map: pTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const burst = new THREE.Points(geo, pMat);
      sceneRef.current.add(burst);

      let frame = 0;
      const animateBurst = () => {
        frame++;
        const posAttr = geo.attributes.position as THREE.BufferAttribute;
        let anyAlive = false;

        for (let i = 0; i < count; i++) {
          const v = velocities[i];
          if (v.life > 0) {
            anyAlive = true;
            v.life -= 0.015;
            posAttr.setX(i, posAttr.getX(i) + v.x);
            posAttr.setY(i, posAttr.getY(i) + v.y);
            posAttr.setZ(i, posAttr.getZ(i) + v.z);
          }
        }
        posAttr.needsUpdate = true;
        pMat.opacity = Math.max(0, pMat.opacity - 0.015);

        if (anyAlive && pMat.opacity > 0.02) {
          requestAnimationFrame(animateBurst);
        } else {
          sceneRef.current?.remove(burst);
          geo.dispose();
          pMat.dispose();
          pTex.dispose();
        }
      };
      animateBurst();
    },
    resetView: () => {
      targetRotationRef.current = { x: 0.28, y: 0 };
      targetScaleRef.current = 1;
    },
  }));

  // Build the scene once on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect software WebGL as per Three.js skill
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 500;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true, // Needed for screenshot export
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(0, -0.05, 6.4);
    camera.lookAt(0, -0.05, 0);
    cameraRef.current = camera;

    // Procedural Studio Environment Map (RoomEnvironment) for rich reflections
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch {
      // Fallback ambient
    }

    // Master hierarchy
    const tiltGroup = new THREE.Group();
    tiltGroup.rotation.x = 0.28;
    scene.add(tiltGroup);

    const plantGroup = new THREE.Group();
    tiltGroup.add(plantGroup);
    plantGroupRef.current = plantGroup;

    const roseHead = new THREE.Group();
    roseHead.position.y = 0.6;
    roseHead.scale.setScalar(0.85);
    plantGroup.add(roseHead);
    roseHeadRef.current = roseHead;

    // Materials
    const petalMaterial = new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      roughness: 0.38,
      clearcoat: 0.55,
      clearcoatRoughness: 0.28,
      emissive: new THREE.Color(0x280045),
      emissiveIntensity: 0.85,
    });
    petalMaterialRef.current = petalMaterial;

    const leafMaterial = new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      roughness: 0.35,
      clearcoat: 0.8,
      emissive: new THREE.Color(0x081c0c),
      emissiveIntensity: 0.4,
    });

    const dewMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.05,
      transparent: true,
      opacity: 0.75,
      clearcoat: 1.0,
      transmission: isSoftwareGl ? 0 : 0.85,
      ior: 1.33,
      emissive: new THREE.Color(0x7c3aed),
      emissiveIntensity: 0.3,
    });

    // Petal configuration
    const N = 36;
    const petalRecords: typeof petalsRef.current = [];
    const dewMeshList: THREE.Mesh[] = [];
    const dewGeometry = new THREE.SphereGeometry(1, 12, 10);

    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const angle = i * 2.39996; // Golden angle
      const w = 0.26 + 0.5 * Math.pow(t, 0.9);
      const h = 0.55 + 0.5 * t;
      const cup = 1.6 - t;
      const curl = 0.2 + 1.6 * t * t;
      const tilt = 0.06 + 1.15 * Math.pow(t, 1.3);
      const r = 0.02 + 0.5 * Math.pow(t, 0.85);

      const geo = createPetalGeometry(w, h, cup, curl, theme.petalColor);
      const mesh = new THREE.Mesh(geo, petalMaterial);

      mesh.rotation.order = 'YXZ';
      mesh.rotation.set(tilt, angle, 0);
      mesh.position.set(Math.sin(angle) * r, -0.05 * t + 0.02, Math.cos(angle) * r);
      roseHead.add(mesh);

      petalRecords.push({
        mesh,
        defaultTilt: tilt,
        defaultR: r,
        defaultW: w,
        defaultH: h,
        defaultCup: cup,
        defaultCurl: curl,
        angle,
        t,
      });

      // Add delicate dewdrops on outer petals
      if (t > 0.45) {
        for (let k = 0; k < 3; k++) {
          const rx = (Math.random() - 0.5) * 0.75;
          const ry = 0.25 + Math.random() * 0.65;
          const pt = calculatePetalPoint(w, h, cup, curl, rx, ry);
          const dewMesh = new THREE.Mesh(dewGeometry, dewMaterial);
          const scale = 0.012 + Math.random() * 0.024;
          dewMesh.position.set(pt[0], pt[1], pt[2] - 0.015);
          dewMesh.scale.set(scale, scale, scale * 0.7);
          mesh.add(dewMesh);
          dewMeshList.push(dewMesh);
        }
      }
    }

    petalsRef.current = petalRecords;
    dewDropsRef.current = dewMeshList;

    // 5 Sepals (calyx under blossom)
    for (let i = 0; i < 5; i++) {
      const angle = i * 1.2566;
      const sepalGeo = createPetalGeometry(0.12, 0.8, 0.35, 0.4, [0.15, 0.42, 0.12]);
      const sepalMesh = new THREE.Mesh(sepalGeo, leafMaterial);
      sepalMesh.rotation.order = 'YXZ';
      sepalMesh.rotation.set(2.35, angle, 0);
      sepalMesh.position.set(Math.sin(angle) * 0.09, -0.12, Math.cos(angle) * 0.09);
      roseHead.add(sepalMesh);
    }

    // Stem
    const stemGeo = new THREE.CylinderGeometry(0.048, 0.065, 3.2, 16);
    const stemMat = new THREE.MeshStandardMaterial({
      color: 0x183315,
      roughness: 0.55,
      metalness: 0.1,
    });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = -1.0;
    plantGroup.add(stem);

    // Subtle thorns on stem
    const thornGeo = new THREE.ConeGeometry(0.03, 0.1, 8);
    const thornMat = new THREE.MeshStandardMaterial({ color: 0x24111a, roughness: 0.4 });
    const thornOffsets = [-0.3, -0.6, -1.0, -1.3];
    thornOffsets.forEach((yPos, idx) => {
      const thorn = new THREE.Mesh(thornGeo, thornMat);
      thorn.rotation.z = idx % 2 === 0 ? Math.PI / 2.3 : -Math.PI / 2.3;
      thorn.rotation.y = idx * 1.5;
      thorn.position.set(idx % 2 === 0 ? 0.06 : -0.06, yPos, 0);
      plantGroup.add(thorn);
    });

    // 2 Branching leaves
    const leafOffsets = [
      { y: -0.85, ry: 0.8, rz: 1.25 },
      { y: -1.45, ry: 3.8, rz: 1.1 },
    ];
    leafOffsets.forEach(l => {
      const leafGeo = createPetalGeometry(0.38, 1.25, 0.5, 0.6, [0.14, 0.38, 0.14]);
      const leafMesh = new THREE.Mesh(leafGeo, leafMaterial);
      leafMesh.rotation.order = 'YXZ';
      leafMesh.rotation.set(l.rz, l.ry, 0);
      leafMesh.position.set(0, l.y, 0);
      plantGroup.add(leafMesh);
    });

    // Lights
    const ambientLight = new THREE.AmbientLight(theme.ambientColor, 1.1);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const dirLight = new THREE.DirectionalLight(theme.lightColor, 1.4);
    dirLight.position.set(2.5, 4.5, 4);
    scene.add(dirLight);

    const pointLight1 = new THREE.PointLight(theme.glowColor, 2.4, 14);
    pointLight1.position.set(-2.5, 1.2, 3);
    scene.add(pointLight1);
    pointLight1Ref.current = pointLight1;

    const pointLight2 = new THREE.PointLight(0x8833ff, 3.2, 14);
    pointLight2.position.set(0, 2, -3);
    scene.add(pointLight2);
    pointLight2Ref.current = pointLight2;

    // Ethereal glowing aura sprite behind flower head
    const auraCanvas = document.createElement('canvas');
    auraCanvas.width = 256;
    auraCanvas.height = 256;
    const auraCtx = auraCanvas.getContext('2d')!;
    const grad = auraCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, 'rgba(216, 120, 255, 0.85)');
    grad.addColorStop(0.35, 'rgba(180, 77, 255, 0.45)');
    grad.addColorStop(0.7, 'rgba(120, 30, 200, 0.15)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    auraCtx.fillStyle = grad;
    auraCtx.fillRect(0, 0, 256, 256);

    const auraTex = new THREE.CanvasTexture(auraCanvas);
    const auraMat = new THREE.SpriteMaterial({
      map: auraTex,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      opacity: 0.75,
    });
    const auraSprite = new THREE.Sprite(auraMat);
    auraSprite.scale.set(5.2, 5.2, 1);
    auraSprite.position.set(0, 0.85, -1.2);
    scene.add(auraSprite);
    auraSpriteRef.current = auraSprite;

    // Pointer Drag & Touch handlers for fluid orbit inspection
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDraggingRef.current = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      previousPointerPosRef.current = { x: clientX, y: clientY };
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - previousPointerPosRef.current.x;
      const deltaY = clientY - previousPointerPosRef.current.y;

      targetRotationRef.current.y += deltaX * 0.008;
      targetRotationRef.current.x = Math.max(-0.4, Math.min(0.9, targetRotationRef.current.x + deltaY * 0.008));

      previousPointerPosRef.current = { x: clientX, y: clientY };
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.001;
      targetScaleRef.current = Math.max(0.7, Math.min(1.4, targetScaleRef.current - zoomDelta));
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    dom.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);
    dom.addEventListener('wheel', handleWheel, { passive: false });

    // Window resize observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop with exponential damping & breathing motion
    let animId = 0;
    let clock = 0;

    const animate = () => {
      clock += 0.016;

      // Smooth camera/object damping
      currentRotationRef.current.x = THREE.MathUtils.damp(
        currentRotationRef.current.x,
        targetRotationRef.current.x,
        8,
        0.016
      );
      currentRotationRef.current.y = THREE.MathUtils.damp(
        currentRotationRef.current.y,
        targetRotationRef.current.y,
        8,
        0.016
      );
      currentScaleRef.current = THREE.MathUtils.damp(
        currentScaleRef.current,
        targetScaleRef.current,
        6,
        0.016
      );

      // Apply rotations
      tiltGroup.rotation.x = currentRotationRef.current.x;

      if (autoRotate && !isDraggingRef.current) {
        targetRotationRef.current.y += 0.008 * rotationSpeed;
      }
      plantGroup.rotation.y = currentRotationRef.current.y;

      // Gentle breathing levitation
      tiltGroup.position.y = 0.15 + Math.sin(clock * 1.4) * 0.04;
      tiltGroup.scale.setScalar(currentScaleRef.current);

      // Aura light pulsation
      if (auraSpriteRef.current) {
        auraSpriteRef.current.material.opacity = 0.7 + 0.2 * Math.sin(clock * 2);
      }
      if (pointLight1Ref.current) {
        pointLight1Ref.current.intensity = 2.2 + 0.5 * Math.sin(clock * 2.8);
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      dom.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
      dom.removeEventListener('wheel', handleWheel);

      renderer.dispose();
      if (container.contains(dom)) {
        container.removeChild(dom);
      }
    };
  }, []);

  // Update theme colors dynamically
  useEffect(() => {
    if (!sceneRef.current) return;

    if (ambientLightRef.current) {
      ambientLightRef.current.color.setHex(theme.ambientColor);
    }
    if (pointLight1Ref.current) {
      pointLight1Ref.current.color.set(theme.glowColor);
    }
    if (petalMaterialRef.current) {
      petalMaterialRef.current.emissive.set(theme.glowColor).multiplyScalar(0.4);
    }

    // Update petal vertex colors
    petalsRef.current.forEach(({ mesh, defaultW, defaultH, defaultCup, defaultCurl }) => {
      mesh.geometry.dispose();
      mesh.geometry = createPetalGeometry(defaultW, defaultH, defaultCup, defaultCurl, theme.petalColor);
    });
  }, [theme]);

  // Update bloom unfurl state
  useEffect(() => {
    petalsRef.current.forEach(({ mesh, defaultTilt, defaultR, angle, t }) => {
      // Scale tilt and radius outward as bloom increases
      const bloomTiltMultiplier = 0.65 + bloom * 0.7; // 0.65 (closed bud) -> 1.35 (open)
      const bloomRadiusMultiplier = 0.7 + bloom * 0.6;

      const newTilt = defaultTilt * bloomTiltMultiplier;
      const newR = defaultR * bloomRadiusMultiplier;

      mesh.rotation.x = newTilt;
      mesh.position.x = Math.sin(angle) * newR;
      mesh.position.z = Math.cos(angle) * newR;
      mesh.position.y = -0.05 * t + 0.02 - (1 - bloom) * 0.08 * (1 - t);
    });
  }, [bloom]);

  // Update dew drops visibility
  useEffect(() => {
    dewDropsRef.current.forEach(d => {
      d.visible = showDewDrops;
    });
  }, [showDewDrops]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
      title="Click & drag or swipe to rotate the rose"
    />
  );
});

Rose3D.displayName = 'Rose3D';
