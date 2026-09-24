import * as THREE from 'three';
import { AppleActor } from './apple.js';

const clamp01 = (value) => Math.min(Math.max(value, 0), 1);
const easeOut = (value) => 1 - Math.pow(1 - clamp01(value), 3);
const damp = (current, target, smoothing, delta) =>
  current + (target - current) * (1 - Math.exp(-smoothing * delta));

function seededRandom(seed = 1337) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1103515245 + 12345) >>> 0;
    return value / 4294967296;
  };
}

function makeLine(points, color, opacity) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
  });
  return new THREE.LineLoop(geometry, material);
}

function makeGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255, 216, 184, 0.95)');
  gradient.addColorStop(0.14, 'rgba(255, 185, 140, 0.55)');
  gradient.addColorStop(0.42, 'rgba(190, 93, 76, 0.16)');
  gradient.addColorStop(1, 'rgba(190, 93, 76, 0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createVoidField() {
  const random = seededRandom(77);
  const count = 360;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const cool = new THREE.Color(0x6c7b86);
  const warm = new THREE.Color(0x9f6b5d);

  for (let index = 0; index < count; index += 1) {
    const radius = 4.6 + random() * 5.6;
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    const offset = index * 3;
    positions[offset] = Math.sin(phi) * Math.cos(theta) * radius;
    positions[offset + 1] = Math.cos(phi) * radius * 0.72;
    positions[offset + 2] = Math.sin(phi) * Math.sin(theta) * radius - 1.2;
    const color = cool.clone().lerp(warm, random() * 0.22);
    colors[offset] = color.r;
    colors[offset + 1] = color.g;
    colors[offset + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size: 0.026,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  return { points: new THREE.Points(geometry, material), material };
}

function createSpaceArcs() {
  const group = new THREE.Group();
  const colors = [0x56636c, 0x7c5a55, 0x68777d];
  const lines = [
    { radius: 2.05, tilt: 0.28, rotation: [0.22, 0.1, 0.5] },
    { radius: 2.7, tilt: -0.42, rotation: [-0.3, 0.22, -0.1] },
    { radius: 3.35, tilt: 0.16, rotation: [0.15, -0.2, 0.2] },
  ];

  lines.forEach((line, index) => {
    const points = [];
    for (let step = 0; step < 128; step += 1) {
      const angle = (step / 128) * Math.PI * 2;
      points.push(
        new THREE.Vector3(
          Math.cos(angle) * line.radius,
          Math.sin(angle) * line.radius * 0.34,
          Math.sin(angle * 2 + index) * 0.18,
        ),
      );
    }
    const orbit = makeLine(points, colors[index], 0);
    orbit.rotation.set(...line.rotation);
    orbit.scale.y = 1 + line.tilt;
    orbit.userData.initialRotation = [...line.rotation];
    orbit.userData.initialScaleY = 1 + line.tilt;
    group.add(orbit);
  });

  return { group, lines: group.children };
}

function createTimeRings() {
  const group = new THREE.Group();
  const materials = [];
  const rings = [
    { inner: 1.38, outer: 1.39, rotation: [0.12, 0.18, 0.08], color: 0x7d6259 },
    { inner: 1.78, outer: 1.785, rotation: [-0.3, 0.12, 0.42], color: 0x596a70 },
    { inner: 2.18, outer: 2.185, rotation: [0.48, -0.22, -0.18], color: 0x7b4e4b },
  ];

  rings.forEach((ring) => {
    const material = new THREE.MeshBasicMaterial({
      color: ring.color,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(new THREE.RingGeometry(ring.inner, ring.outer, 128), material);
    mesh.rotation.set(...ring.rotation);
    group.add(mesh);
    materials.push(material);
  });

  const tickPoints = [];
  for (let index = 0; index < 32; index += 1) {
    const angle = (index / 32) * Math.PI * 2;
    const length = index % 4 === 0 ? 0.12 : 0.06;
    tickPoints.push(
      new THREE.Vector3(Math.cos(angle) * 1.55, Math.sin(angle) * 1.55, 0),
      new THREE.Vector3(Math.cos(angle) * (1.55 + length), Math.sin(angle) * (1.55 + length), 0),
    );
  }
  const tickMaterial = new THREE.LineBasicMaterial({
    color: 0x8b7164,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const ticks = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(tickPoints), tickMaterial);
  ticks.rotation.set(0.12, 0.18, 0.08);
  group.add(ticks);
  materials.push(tickMaterial);

  return { group, materials };
}

function createMatterParticles() {
  const random = seededRandom(421);
  const count = 520;
  const positions = new Float32Array(count * 3);
  const starts = new Float32Array(count * 3);
  const targets = new Float32Array(count * 3);
  const phases = new Float32Array(count);

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    const radius = 3.2 + random() * 2.8;
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    starts[offset] = Math.sin(phi) * Math.cos(theta) * radius;
    starts[offset + 1] = Math.cos(phi) * radius * 0.8;
    starts[offset + 2] = Math.sin(phi) * Math.sin(theta) * radius - 0.4;

    const targetAngle = random() * Math.PI * 2;
    const targetHeight = -0.92 + random() * 1.95;
    const targetRadius = 0.28 + random() * 0.76;
    targets[offset] = Math.cos(targetAngle) * targetRadius;
    targets[offset + 1] = targetHeight;
    targets[offset + 2] = Math.sin(targetAngle) * targetRadius * 0.84;
    phases[index] = random() * Math.PI * 2;
    positions[offset] = starts[offset];
    positions[offset + 1] = starts[offset + 1];
    positions[offset + 2] = starts[offset + 2];
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0xc97c5e,
    size: 0.045,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  return { points: new THREE.Points(geometry, material), positions, starts, targets, phases, material };
}

export class World {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050608);
    this.scene.fog = new THREE.FogExp2(0x050608, 0.035);
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    this.camera.position.set(0, 0.15, 9);
    this.lookTarget = new THREE.Vector3(0, 0.05, 0);
    this.cameraTargetPosition = this.camera.position.clone();
    this.cameraTargetLook = this.lookTarget.clone();
    this.layoutOffsetX = 0;
    this.isCompact = false;
    this.clock = 0;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.shadowMap.enabled = false;

    this.state = {
      phase: 'void',
      levels: { void: 0, space: 0, time: 0, light: 0, matter: 0 },
      apple: {
        created: false,
        form: 0,
        pigment: 0,
        stem: 0,
        texture: 0,
        reflection: 0,
        weight: 0,
        imperfection: 0,
      },
      lastCommand: 'INIT',
    };
    this.visualLevels = { ...this.state.levels };

    this.root = new THREE.Group();
    this.root.name = 'MILESTONE 01 / WORLD';
    this.scene.add(this.root);

    this.ambient = new THREE.HemisphereLight(0x3b4b55, 0x090508, 0.3);
    this.scene.add(this.ambient);
    this.keyLight = new THREE.DirectionalLight(0xffd2b8, 0.44);
    this.keyLight.position.set(-3.5, 4.5, 5.5);
    this.keyLight.target.position.set(0, 0, 0);
    this.scene.add(this.keyLight, this.keyLight.target);
    this.fillLight = new THREE.DirectionalLight(0x607b88, 0.18);
    this.fillLight.position.set(4, 1.5, 3.5);
    this.fillLight.target.position.set(0, 0.1, 0);
    this.scene.add(this.fillLight, this.fillLight.target);

    this.voidField = createVoidField();
    this.voidShell = new THREE.Mesh(
      new THREE.SphereGeometry(5.8, 32, 20),
      new THREE.MeshBasicMaterial({
        color: 0x10151a,
        wireframe: true,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    this.voidShell.name = 'VOID / shell';
    this.root.add(this.voidField.points, this.voidShell);

    this.space = createSpaceArcs();
    this.space.group.name = 'SPACE / orbital traces';
    this.root.add(this.space.group);

    this.time = createTimeRings();
    this.time.group.name = 'TIME / measured rings';
    this.root.add(this.time.group);

    this.light = new THREE.Group();
    this.light.name = 'LIGHT / first light';
    this.light.position.set(2.55, 2.25, 1.3);
    this.lightSource = new THREE.PointLight(0xffb890, 0, 8, 2);
    this.light.add(this.lightSource);
    this.lightOrb = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0xffd4b3, transparent: true, opacity: 0 }),
    );
    this.light.add(this.lightOrb);
    this.glowTexture = makeGlowTexture();
    this.lightGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.glowTexture,
        color: 0xffb18f,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    this.lightGlow.scale.setScalar(1.7);
    this.light.add(this.lightGlow);
    this.root.add(this.light);

    this.matter = createMatterParticles();
    this.matter.points.name = 'MATTER / pooled particles';
    this.root.add(this.matter.points);

    this.apple = new AppleActor();
    this.root.add(this.apple.root);

    this.resize();
  }

  setCameraPreset(presetName) {
    const presets = {
      void: { position: [0.05, 0.1, 8.9], look: [0, 0.05, 0] },
      space: { position: [0.25, 0.25, 8.15], look: [0, 0.1, 0] },
      time: { position: [-0.15, 0.3, 7.55], look: [0, 0.12, 0] },
      light: { position: [0.65, 0.38, 7.05], look: [0.15, 0.18, 0] },
      matter: { position: [0.45, 0.1, 6.8], look: [0, 0.02, 0] },
      apple: { position: [0.18, -0.02, 7.15], look: [0, 0.02, 0] },
    };
    const preset = presets[presetName] ?? presets.void;
    const distanceScale = this.isCompact ? 1.16 : 1;
    this.cameraTargetPosition.set(
      preset.position[0],
      preset.position[1],
      preset.position[2] * distanceScale,
    );
    this.cameraTargetLook.set(preset.look[0], preset.look[1], preset.look[2]);
  }

  applyEvent(event) {
    const action = event.world;
    if (!action) {
      return;
    }

    this.state.lastCommand = event.terminal?.lines?.[0]?.text ?? event.id;

    if (action.type === 'set-level') {
      this.state.phase = action.phase;
      this.state.levels[action.level] = 1;
      return;
    }

    if (action.type === 'create-apple') {
      this.state.phase = action.phase;
      this.state.apple.created = true;
      this.apple.setCreated(true);
      return;
    }

    if (action.type === 'apple-stage') {
      this.state.phase = 'apple';
      this.state.apple[action.stage] = 1;
      this.apple.setStage(action.stage);
    }
  }

  update(delta) {
    this.clock += delta;
    const levelValues = this.state.levels;
    const visual = this.visualLevels;
    for (const level of Object.keys(visual)) {
      visual[level] = damp(visual[level], levelValues[level], 4.6, delta);
    }

    const voidLevel = easeOut(visual.void);
    const spaceLevel = easeOut(visual.space);
    const timeLevel = easeOut(visual.time);
    const lightLevel = easeOut(visual.light);
    const matterLevel = easeOut(visual.matter);

    this.voidField.material.opacity = 0.012 + voidLevel * 0.22;
    this.voidShell.material.opacity = voidLevel * 0.022;
    this.voidField.points.rotation.y = this.clock * 0.006;
    this.voidShell.rotation.y = -this.clock * 0.004;

    this.space.group.visible = spaceLevel > 0.001;
    this.space.lines.forEach((line, index) => {
      line.material.opacity = spaceLevel * (0.2 - index * 0.035);
      line.rotation.z += delta * (0.018 + index * 0.006) * (index % 2 === 0 ? 1 : -1);
    });

    this.time.group.visible = timeLevel > 0.001;
    this.time.materials.forEach((material, index) => {
      material.opacity = timeLevel * (0.26 - index * 0.035);
    });
    this.time.group.rotation.y += delta * 0.018;
    this.time.group.rotation.z = Math.sin(this.clock * 0.08) * 0.025;

    this.light.visible = lightLevel > 0.001;
    this.lightSource.intensity = lightLevel * 2.4;
    this.lightOrb.material.opacity = lightLevel * 0.95;
    this.lightOrb.scale.setScalar(0.8 + lightLevel * 0.5 + Math.sin(this.clock * 1.7) * 0.04);
    this.lightGlow.material.opacity = lightLevel * 0.28;
    this.lightGlow.scale.setScalar(1.2 + lightLevel * 0.7 + Math.sin(this.clock * 0.9) * 0.05);

    this.matter.points.visible = matterLevel > 0.001;
    this.matter.material.opacity = matterLevel * 0.72;
    if (this.matter.points.visible) {
      this.updateMatterParticles(matterLevel);
    }

    this.apple.update(delta);
    this.updateCamera(delta);
    this.renderer.render(this.scene, this.camera);
  }

  updateMatterParticles(level) {
    const { positions, starts, targets, phases } = this.matter;
    const gather = easeOut(level);
    for (let index = 0; index < phases.length; index += 1) {
      const offset = index * 3;
      const phase = phases[index];
      const local = clamp01(gather * 1.08 - (index % 17) * 0.002);
      const drift = Math.sin(this.clock * 0.55 + phase) * 0.018 * local;
      const driftY = Math.cos(this.clock * 0.47 + phase) * 0.014 * local;
      positions[offset] = starts[offset] + (targets[offset] - starts[offset]) * local + drift;
      positions[offset + 1] = starts[offset + 1] + (targets[offset + 1] - starts[offset + 1]) * local + driftY;
      positions[offset + 2] = starts[offset + 2] + (targets[offset + 2] - starts[offset + 2]) * local - drift * 0.5;
    }
    this.matter.points.geometry.attributes.position.needsUpdate = true;
  }

  updateCamera(delta) {
    const positionEase = 1 - Math.exp(-3.4 * delta);
    const lookEase = 1 - Math.exp(-3.8 * delta);
    this.camera.position.lerp(this.cameraTargetPosition, positionEase);
    this.lookTarget.lerp(this.cameraTargetLook, lookEase);
    this.camera.lookAt(this.lookTarget);
  }

  resize() {
    const width = Math.max(this.canvas.clientWidth || window.innerWidth, 1);
    const height = Math.max(this.canvas.clientHeight || window.innerHeight, 1);
    this.isCompact = width < 760;
    this.layoutOffsetX = this.isCompact ? 0 : Math.min(width * 0.13, 1.2);
    this.root.position.x = this.layoutOffsetX;
    this.root.position.y = this.isCompact ? 0.3 : 0;
    this.camera.aspect = width / height;
    this.camera.fov = this.isCompact ? 46 : 38;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.isCompact ? 1.35 : 1.75));
    this.renderer.setSize(width, height, false);
    this.setCameraPreset(this.state.phase);
  }

  getSnapshot() {
    return {
      phase: this.state.phase.toUpperCase(),
      level: Math.min(
        Object.values(this.state.levels).reduce((sum, value) => sum + value, 0) / 5,
        1,
      ),
      apple: this.state.apple,
    };
  }

  reset() {
    this.state.phase = 'void';
    this.state.levels = { void: 0, space: 0, time: 0, light: 0, matter: 0 };
    this.state.apple = {
      created: false,
      form: 0,
      pigment: 0,
      stem: 0,
      texture: 0,
      reflection: 0,
      weight: 0,
      imperfection: 0,
    };
    this.state.lastCommand = 'INIT';
    for (const level of Object.keys(this.visualLevels)) {
      this.visualLevels[level] = 0;
    }
    this.clock = 0;
    this.apple.reset();
    this.voidField.points.rotation.set(0, 0, 0);
    this.voidShell.rotation.set(0, 0, 0);
    this.space.group.rotation.set(0, 0, 0);
    this.space.lines.forEach((line) => {
      line.rotation.set(...(line.userData.initialRotation ?? [0, 0, 0]));
      line.scale.y = line.userData.initialScaleY ?? 1;
    });
    this.time.group.rotation.set(0, 0, 0);
    this.voidField.material.opacity = 0;
    this.voidShell.material.opacity = 0;
    this.space.lines.forEach((line) => {
      line.material.opacity = 0;
    });
    this.time.materials.forEach((material) => {
      material.opacity = 0;
    });
    this.lightSource.intensity = 0;
    this.lightOrb.material.opacity = 0;
    this.lightOrb.scale.setScalar(0.8);
    this.lightGlow.material.opacity = 0;
    this.lightGlow.scale.setScalar(1.7);
    this.matter.material.opacity = 0;
    this.matter.positions.set(this.matter.starts);
    this.matter.points.geometry.attributes.position.needsUpdate = true;
    this.matter.points.visible = false;
    this.root.position.y = this.isCompact ? 0.3 : 0;
    this.setCameraPreset('void');
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.apple.dispose();
    this.glowTexture.dispose();
    const geometries = new Set();
    const materials = new Set();
    const textures = new Set();
    this.scene.traverse((object) => {
      if (object.geometry) {
        geometries.add(object.geometry);
      }
      if (object.material) {
        const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
        objectMaterials.forEach((material) => {
          materials.add(material);
          if (material.map) {
            textures.add(material.map);
          }
        });
      }
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    textures.forEach((texture) => texture.dispose());
    this.renderer.dispose();
  }
}
