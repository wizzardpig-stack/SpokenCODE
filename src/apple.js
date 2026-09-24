import * as THREE from 'three';

const STAGES = ['form', 'pigment', 'stem', 'texture', 'reflection', 'weight', 'imperfection'];
const GHOST = new THREE.Color(0x6b6b64);
const PIGMENT = new THREE.Color(0xb32f2c);
const PIGMENT_WARM = new THREE.Color(0xca5136);
const DEEP_PIGMENT = new THREE.Color(0x4b1018);
const GOLDEN = new THREE.Color(0xd99a68);

const clamp01 = (value) => Math.min(Math.max(value, 0), 1);
const smoothstep = (value) => value * value * (3 - 2 * value);
const easeOut = (value) => 1 - Math.pow(1 - clamp01(value), 3);
const gaussian = (value, center, width) => Math.exp(-Math.pow((value - center) / width, 2));
const damp = (current, target, smoothing, delta) =>
  current + (target - current) * (1 - Math.exp(-smoothing * delta));

function seededRandom(seed = 17) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function hashNoise(a, b) {
  const value = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function appleRadius(t) {
  const capped = clamp01(t);
  const vertical = capped * 2 - 1;
  const sphere = Math.sqrt(Math.max(0, 1 - vertical * vertical));
  const shoulder = 1 + gaussian(capped, 0.68, 0.2) * 0.13;
  const lowerBelly = 1 + gaussian(capped, 0.43, 0.25) * 0.025;
  const topTaper = 1 - smoothstep(clamp01((capped - 0.74) / 0.26)) * 0.22;
  const bottomTaper = 1 - smoothstep(clamp01((0.18 - capped) / 0.18)) * 0.4;
  return Math.max(0.025, sphere * 1.02 * shoulder * lowerBelly * topTaper * bottomTaper);
}

function surfacePoint(t, angle, radialScale = 1) {
  const capped = clamp01(t);
  const radius = appleRadius(capped) * radialScale;
  const lobe = 1 + Math.cos(angle * 2 + 0.28) * 0.065 + Math.cos(angle - 0.65) * 0.018;
  const asymmetry = 1 + Math.sin(angle + 0.72) * 0.032 * Math.sin(Math.PI * capped);
  const irregularity =
    1 +
    Math.sin(angle * 3.0 + capped * 21.0) * 0.006 +
    Math.sin(angle * 7.0 - capped * 29.0) * 0.0035 +
    Math.cos(angle * 2.0 + capped * 11.0) * 0.004;
  const contour = Math.sin(angle * 2 - 0.45) * Math.sin(Math.PI * capped) * 0.025;
  const topRim = gaussian(capped, 0.86, 0.11) * 0.11;
  const topDimple = Math.pow(clamp01((capped - 0.78) / 0.22), 2.1) * 0.18;
  const bottomDimple = Math.pow(clamp01((0.12 - capped) / 0.12), 4) * 0.12;

  return {
    x: Math.cos(angle) * radius * lobe * asymmetry * irregularity + Math.sin(Math.PI * capped) * 0.026,
    y: -1.04 + capped * 2.08 + contour + topRim - topDimple + bottomDimple,
    z: Math.sin(angle) * radius * 0.89 * irregularity - Math.sin(Math.PI * capped) * 0.012,
  };
}

function createAppleGeometry() {
  const geometry = new THREE.SphereGeometry(1, 64, 56);
  const position = geometry.attributes.position;
  const colors = [];

  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index);
    const y = position.getY(index);
    const z = position.getZ(index);
    const radial = Math.hypot(x, z);
    const t = clamp01((y + 1) * 0.5);
    const angle = Math.atan2(z, x);
    const point = surfacePoint(t, angle);
    const noise = hashNoise(t * 19.7, (angle + Math.PI) * 20.1);
    const warmVariation = gaussian(t, 0.56, 0.34) * 0.035;
    const value = 0.91 + noise * 0.1;

    if (radial > 0.0001) {
      position.setXYZ(index, point.x, point.y, point.z);
    } else {
      position.setXYZ(index, 0, point.y, 0);
    }

    colors.push(
      value * (1.01 + warmVariation),
      value * (0.91 - noise * 0.035),
      value * (0.88 - noise * 0.025),
    );
  }

  position.needsUpdate = true;
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

function createTextureGeometry() {
  const random = seededRandom(90210);
  const positions = [];
  const colors = [];
  const count = 165;

  for (let index = 0; index < count; index += 1) {
    const t = 0.12 + random() * 0.78;
    const angle = random() * Math.PI * 2;
    const point = surfacePoint(t, angle, 1.012);
    const fleck = random();
    positions.push(point.x, point.y, point.z);

    if (fleck > 0.82) {
      colors.push(0.72, 0.37, 0.22);
    } else if (fleck > 0.42) {
      colors.push(0.3, 0.075, 0.06);
    } else {
      colors.push(0.48, 0.14, 0.09);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  return geometry;
}

function createSoftCircleTexture() {
  const size = 64;
  const data = new Uint8Array(size * size * 4);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const nx = ((x + 0.5) / size) * 2 - 1;
      const ny = ((y + 0.5) / size) * 2 - 1;
      const distance = Math.sqrt(nx * nx + ny * ny);
      const alpha = Math.pow(Math.max(0, 1 - distance), 1.8);
      const offset = (y * size + x) * 4;
      data[offset] = 255;
      data[offset + 1] = 255;
      data[offset + 2] = 255;
      data[offset + 3] = Math.round(alpha * 255);
    }
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.UnsignedByteType);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createLeafGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.1, 0.19, 0.38, 0.31, 0.7, 0.1);
  shape.bezierCurveTo(0.5, -0.06, 0.22, -0.1, 0, 0);
  const geometry = new THREE.ShapeGeometry(shape, 8);
  geometry.computeVertexNormals();
  return geometry;
}

function createStemGeometry() {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(-0.035, 0.18, 0.012),
    new THREE.Vector3(0.025, 0.4, -0.012),
    new THREE.Vector3(0.012, 0.62, 0.012),
    new THREE.Vector3(0.105, 0.82, 0.028),
  ]);
  return new THREE.TubeGeometry(curve, 20, 0.043, 7, false);
}

export class AppleActor {
  constructor() {
    this.root = new THREE.Group();
    this.root.name = 'APPLE / progressive construction';

    this.values = Object.fromEntries(STAGES.map((stage) => [stage, 0]));
    this.targets = Object.fromEntries(STAGES.map((stage) => [stage, 0]));
    this.created = false;

    this.bodyGroup = new THREE.Group();
    this.bodyGroup.name = 'APPLE / body';
    this.root.add(this.bodyGroup);

    this.bodyGeometry = createAppleGeometry();
    this.bodyMaterial = new THREE.MeshStandardMaterial({
      color: GHOST,
      vertexColors: true,
      roughness: 0.7,
      metalness: 0.015,
      transparent: true,
      opacity: 0,
      emissive: 0x120507,
      emissiveIntensity: 0.08,
    });
    this.bodyMesh = new THREE.Mesh(this.bodyGeometry, this.bodyMaterial);
    this.bodyMesh.name = 'APPLE / surface';
    this.bodyGroup.add(this.bodyMesh);

    this.wireMaterial = new THREE.MeshBasicMaterial({
      color: 0xc89b80,
      wireframe: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    this.wireMesh = new THREE.Mesh(this.bodyGeometry, this.wireMaterial);
    this.wireMesh.name = 'APPLE / form wire';
    this.wireMesh.scale.setScalar(1.008);
    this.bodyGroup.add(this.wireMesh);

    this.coreMaterial = new THREE.MeshBasicMaterial({
      color: 0x88736a,
      wireframe: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    this.coreMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.68, 1), this.coreMaterial);
    this.coreMesh.name = 'APPLE / unresolved core';
    this.bodyGroup.add(this.coreMesh);

    this.stemGroup = new THREE.Group();
    this.stemGroup.name = 'APPLE / stem';
    this.stemGroup.position.set(0.015, 0.95, 0);
    this.stemGroup.scale.set(0.001, 0.001, 0.001);
    this.root.add(this.stemGroup);
    this.stemMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a2118,
      roughness: 0.86,
      metalness: 0,
    });
    this.stemMesh = new THREE.Mesh(createStemGeometry(), this.stemMaterial);
    this.stemGroup.add(this.stemMesh);

    this.stemSocketMaterial = new THREE.MeshStandardMaterial({
      color: 0x390d14,
      roughness: 1,
      transparent: true,
      opacity: 0,
    });
    this.stemSocket = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 8), this.stemSocketMaterial);
    this.stemSocket.name = 'APPLE / stem dimple';
    this.stemSocket.position.set(0.01, 0.95, 0);
    this.stemSocket.scale.set(1.25, 0.2, 0.92);
    this.root.add(this.stemSocket);
    this.stemRimMaterial = new THREE.MeshBasicMaterial({
      color: 0x2a0910,
      transparent: true,
      opacity: 0,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.stemRim = new THREE.Mesh(new THREE.RingGeometry(0.065, 0.14, 32), this.stemRimMaterial);
    this.stemRim.name = 'APPLE / top dimple rim';
    this.stemRim.position.set(0.01, 0.98, 0);
    this.stemRim.rotation.x = -Math.PI / 2;
    this.stemRim.renderOrder = 3;
    this.root.add(this.stemRim);

    this.leafGroup = new THREE.Group();
    this.leafGroup.name = 'APPLE / leaf';
    this.leafGroup.position.set(0.08, 1.65, 0.01);
    this.leafGroup.rotation.set(-0.45, 0.2, -0.28);
    this.leafGroup.scale.setScalar(0.001);
    this.root.add(this.leafGroup);
    this.leafMaterial = new THREE.MeshStandardMaterial({
      color: 0x466b3d,
      roughness: 0.84,
      metalness: 0,
      side: THREE.DoubleSide,
    });
    this.leafMesh = new THREE.Mesh(createLeafGeometry(), this.leafMaterial);
    this.leafGroup.add(this.leafMesh);

    this.textureMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      vertexColors: true,
      size: 0.024,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    this.textureMesh = new THREE.Points(createTextureGeometry(), this.textureMaterial);
    this.textureMesh.name = 'APPLE / surface mottling';
    this.bodyGroup.add(this.textureMesh);

    this.reflectionTexture = createSoftCircleTexture();
    this.reflectionMaterial = new THREE.SpriteMaterial({
      map: this.reflectionTexture,
      color: 0xffc7aa,
      transparent: true,
      opacity: 0,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.reflectionGroup = new THREE.Group();
    this.reflectionGroup.name = 'APPLE / reflection';
    this.reflectionGroup.position.set(-0.34, 0.42, 0.78);
    this.root.add(this.reflectionGroup);
    this.reflectionMesh = new THREE.Sprite(this.reflectionMaterial);
    this.reflectionMesh.scale.set(0.5, 0.82, 1);
    this.reflectionGroup.add(this.reflectionMesh);
    this.reflectionSecondary = new THREE.Sprite(this.reflectionMaterial);
    this.reflectionSecondary.scale.set(0.15, 0.22, 1);
    this.reflectionSecondary.position.set(0.2, 0.28, 0.01);
    this.reflectionGroup.add(this.reflectionSecondary);

    this.weightGroup = new THREE.Group();
    this.weightGroup.name = 'APPLE / weight';
    this.weightGroup.position.y = -1.16;
    this.root.add(this.weightGroup);
    this.weightMaterial = new THREE.MeshBasicMaterial({
      color: 0x984536,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    this.weightRing = new THREE.Mesh(new THREE.TorusGeometry(0.96, 0.012, 6, 96), this.weightMaterial);
    this.weightRing.rotation.x = Math.PI / 2;
    this.weightGroup.add(this.weightRing);
    this.contactTexture = createSoftCircleTexture();
    this.contactMaterial = new THREE.MeshBasicMaterial({
      map: this.contactTexture,
      color: 0x32131b,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.contactShadow = new THREE.Mesh(new THREE.PlaneGeometry(2.15, 1.1), this.contactMaterial);
    this.contactShadow.rotation.x = -Math.PI / 2;
    this.contactShadow.position.y = -0.014;
    this.weightGroup.add(this.contactShadow);

    this.imperfectionGroup = new THREE.Group();
    this.imperfectionGroup.name = 'APPLE / imperfection';
    this.bodyGroup.add(this.imperfectionGroup);
    this.imperfectionMaterial = new THREE.MeshStandardMaterial({
      color: 0x51131a,
      roughness: 1,
      transparent: true,
      opacity: 0,
    });
    for (const [x, y, z, scale] of [
      [-0.48, 0.16, 0.7, 1],
      [0.29, -0.4, 0.72, 0.62],
      [0.56, 0.2, 0.53, 0.42],
    ]) {
      const mark = new THREE.Mesh(new THREE.SphereGeometry(0.042 * scale, 8, 6), this.imperfectionMaterial);
      mark.position.set(x, y, z);
      mark.scale.set(1, 0.48, 0.28);
      this.imperfectionGroup.add(mark);
    }

    this.setCreated(false);
  }

  setCreated(created) {
    this.created = created;
    this.root.visible = created;
    if (created) {
      this.targets.form = Math.max(this.targets.form, 0.08);
    }
  }

  setStage(stage) {
    if (!STAGES.includes(stage)) {
      return;
    }
    this.targets[stage] = 1;
  }

  reset() {
    for (const stage of STAGES) {
      this.values[stage] = 0;
      this.targets[stage] = 0;
    }
    this.root.position.set(0, 0, 0);
    this.root.rotation.set(0, 0, 0);
    this.bodyGroup.position.set(0, 0, 0);
    this.bodyGroup.rotation.set(0, 0, 0);
    this.bodyGroup.scale.setScalar(1);
    this.stemGroup.rotation.set(0, 0, 0);
    this.stemSocket.scale.set(1.25, 0.2, 0.92);
    this.leafGroup.rotation.set(-0.45, 0.2, -0.28);
    this.reflectionGroup.position.set(-0.34, 0.42, 0.78);
    this.weightGroup.position.y = -1.16;
    this.imperfectionGroup.scale.setScalar(0.001);
    this.setCreated(false);
  }

  update(delta) {
    for (const stage of STAGES) {
      this.values[stage] = damp(this.values[stage], this.targets[stage], 5.5, delta);
    }

    const form = easeOut(this.values.form);
    const pigment = smoothstep(this.values.pigment);
    const stem = easeOut(this.values.stem);
    const texture = smoothstep(this.values.texture);
    const reflection = smoothstep(this.values.reflection);
    const weight = easeOut(this.values.weight);
    const imperfection = smoothstep(this.values.imperfection);

    this.root.visible = this.created || form > 0.005;
    if (!this.root.visible) {
      return;
    }

    const bodyScale = 0.12 + form * 0.88;
    this.bodyGroup.scale.set(
      bodyScale * (1 + imperfection * 0.016),
      bodyScale * 1.12 * (1 - weight * 0.04),
      bodyScale,
    );
    this.bodyGroup.position.y = (1 - form) * 0.06;
    this.bodyGroup.rotation.y = (1 - form) * -0.45 + imperfection * 0.035;
    this.bodyGroup.rotation.z = (1 - form) * 0.08 + imperfection * -0.025;

    this.bodyMaterial.opacity = 0.012 + form * (0.12 + pigment * 0.84);
    this.bodyMaterial.color.copy(GHOST).lerp(PIGMENT, pigment);
    this.bodyMaterial.color.lerp(PIGMENT_WARM, Math.max(0, pigment - 0.72) * 0.16);
    this.bodyMaterial.roughness = 0.74 - pigment * 0.06 + reflection * 0.025;
    this.bodyMaterial.metalness = 0.012;
    this.bodyMaterial.emissive.copy(DEEP_PIGMENT).lerp(GOLDEN, reflection * 0.18);
    this.bodyMaterial.emissiveIntensity = 0.07 + reflection * 0.1;
    this.wireMaterial.opacity = form * (0.17 - pigment * 0.14);
    this.wireMaterial.color.set(pigment > 0.35 ? 0xd99b7d : 0xc89b80);
    this.coreMaterial.opacity = (1 - form) * 0.14;
    this.coreMesh.scale.setScalar(0.72 + (1 - form) * 0.2);
    this.coreMesh.rotation.y += delta * 0.6;
    this.coreMesh.rotation.x += delta * 0.18;

    this.stemGroup.scale.set(0.001 + stem * 0.999, 0.001 + stem * 0.999, 0.001 + stem * 0.999);
    this.stemGroup.rotation.z = -0.14 + (1 - stem) * 0.08 + imperfection * 0.035;
    this.stemSocketMaterial.opacity = stem * 0.72;
    this.stemSocket.scale.set(1.18 + stem * 0.1, 0.18 + stem * 0.04, 0.86 + stem * 0.08);
    this.stemRimMaterial.opacity = stem * 0.3;
    this.leafGroup.scale.setScalar(Math.max(0.001, stem * 0.78));
    this.leafGroup.rotation.z = -0.28 - stem * 0.12 + imperfection * 0.1;
    this.leafGroup.rotation.y = 0.2 + stem * 0.35;

    this.textureMaterial.opacity = texture * (0.28 + imperfection * 0.12);
    this.textureMesh.scale.setScalar(0.94 + texture * 0.06);
    this.reflectionMaterial.opacity = reflection * 0.22;
    this.reflectionGroup.scale.set(0.72 + reflection * 0.28, 0.72 + reflection * 0.28, 1);
    this.reflectionGroup.position.x = -0.34 - reflection * 0.035;

    this.weightMaterial.opacity = weight * 0.34;
    this.contactMaterial.opacity = weight * 0.3;
    this.weightGroup.scale.set(0.72 + weight * 0.28);
    this.weightGroup.position.y = -1.16 - weight * 0.012;
    this.imperfectionMaterial.opacity = imperfection * 0.68;
    this.imperfectionGroup.scale.setScalar(0.001 + imperfection * 0.999);

    this.root.position.y = 0.14 - weight * 0.12;
    this.root.position.x = imperfection * 0.035;
    this.root.rotation.y = imperfection * 0.08;
  }

  dispose() {
    const geometries = new Set();
    const materials = new Set();
    const textures = new Set();
    this.root.traverse((object) => {
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
  }
}
