"use client";

import { useEffect, useRef } from "react";
import {
  Renderer,
  Camera,
  Transform,
  GLTFLoader,
  Texture,
  Vec3,
  Program,
} from "ogl";

const vertex = /* glsl */ `
  attribute vec3 position;
  attribute vec3 normal;

  uniform mat4 modelMatrix;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform mat3 normalMatrix;

  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const vertexGL2 = /* glsl */ `#version 300 es
  in vec3 position;
  in vec3 normal;

  uniform mat4 modelMatrix;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform mat3 normalMatrix;

  out vec3 vNormal;
  out vec3 vWorldPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentGL2 = /* glsl */ `#version 300 es
  precision highp float;

  uniform vec3 uBaseColor;
  uniform float uRoughness;
  uniform float uMetallic;
  uniform vec3 cameraPosition;
  uniform sampler2D uEnvMap;
  uniform float uEnvMaxLod;
  uniform float uExposure;
  uniform float uEnvIntensity;

  in vec3 vNormal;
  in vec3 vWorldPosition;

  out vec4 fragColor;

  const float PI = 3.14159265359;

  float distributionGGX(vec3 N, vec3 H, float roughness) {
    float a = roughness * roughness;
    float a2 = a * a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH * NdotH;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;
    return a2 / max(denom, 0.0001);
  }

  float geometrySchlickGGX(float NdotV, float roughness) {
    float r = roughness + 1.0;
    float k = (r * r) / 8.0;
    return NdotV / (NdotV * (1.0 - k) + k);
  }

  float geometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    return geometrySchlickGGX(NdotV, roughness) * geometrySchlickGGX(NdotL, roughness);
  }

  vec3 fresnelSchlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
  }

  vec3 fresnelSchlickRoughness(float cosTheta, vec3 F0, float roughness) {
    return F0 + (max(vec3(1.0 - roughness), F0) - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
  }

  vec2 envUVFromDir(vec3 dir) {
    vec3 unitDir = normalize(dir);
    float longitude = atan(unitDir.z, unitDir.x);
    float latitude = asin(clamp(unitDir.y, -1.0, 1.0));
    return vec2(longitude / (2.0 * PI) + 0.5, latitude / PI + 0.5);
  }

  vec3 sampleEnv(vec3 dir, float lod) {
    vec3 envColor = textureLod(uEnvMap, envUVFromDir(dir), lod).rgb;
    return pow(envColor, vec3(2.2));
  }

  void main() {
    vec3 N = normalize(vNormal);
    if (!gl_FrontFacing) N = -N;

    vec3 V = normalize(cameraPosition - vWorldPosition);
    vec3 R = reflect(-V, N);

    float rough = clamp(uRoughness, 0.04, 1.0);
    float metal = clamp(uMetallic, 0.0, 1.0);
    float NdotV = max(dot(N, V), 0.0);

    vec3 lightDirs[2];
    lightDirs[0] = normalize(vec3(0.6, 0.8, 0.5));
    lightDirs[1] = normalize(vec3(-0.6, -0.3, -0.4));

    vec3 lightColors[2];
    lightColors[0] = vec3(2.2, 2.1, 1.9);
    lightColors[1] = vec3(1.2, 1.4, 1.2);

    vec3 baseColor = uBaseColor;
    vec3 F0 = mix(vec3(0.04), baseColor, metal);
    vec3 Lo = vec3(0.0);

    for (int i = 0; i < 2; i++) {
      vec3 L = lightDirs[i];
      vec3 H = normalize(V + L);

      float NDF = distributionGGX(N, H, rough);
      float G = geometrySmith(N, V, L, rough);
      vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);

      vec3 numerator = NDF * G * F;
      float denominator = 4.0 * NdotV * max(dot(N, L), 0.0) + 0.0001;
      vec3 specular = numerator / denominator;

      vec3 kS = F;
      vec3 kD = (1.0 - kS) * (1.0 - metal);

      float NdotL = max(dot(N, L), 0.0);
      Lo += (kD * baseColor / PI + specular) * lightColors[i] * NdotL;
    }

    float specLod = sqrt(rough) * uEnvMaxLod;
    vec3 prefilteredSpec = sampleEnv(R, specLod) * uEnvIntensity;
    vec3 irradiance = sampleEnv(N, uEnvMaxLod) * (uEnvIntensity * 0.8);

    vec3 F_env = fresnelSchlickRoughness(NdotV, F0, rough);
    vec3 kD_env = (1.0 - F_env) * (1.0 - metal);

    vec3 diffuseIBL = kD_env * baseColor * irradiance;
    vec3 specularIBL = prefilteredSpec * F_env * 0.45; 

    vec3 ambient = diffuseIBL + specularIBL;
    vec3 ambientFloor = baseColor * 0.05 * (1.0 - metal * 0.5);
    ambient = max(ambient, ambientFloor);

    vec3 color = (ambient + Lo) * uExposure;
    
    vec3 a = vec3(2.51);
    vec3 b = vec3(0.03);
    vec3 c = vec3(2.43);
    vec3 d = vec3(0.59);
    vec3 e = vec3(0.14);
    color = clamp((color * (a * color + b)) / (color * (c * color + d) + e), 0.0, 1.0);

    float contrast = 1.1; 
    color = mix(vec3(0.5), color, contrast);
    color = max(color, 0.0);

    color = pow(color, vec3(1.0 / 1.2));

    fragColor = vec4(color, 1.0);
  }
`;

const fragmentGL1 = /* glsl */ `
  precision highp float;

  uniform vec3 uBaseColor;
  uniform float uRoughness;
  uniform float uMetallic;
  uniform vec3 cameraPosition;
  uniform sampler2D uEnvMap;
  uniform float uExposure;
  uniform float uEnvIntensity;

  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  const float PI = 3.14159265359;

  float distributionGGX(vec3 N, vec3 H, float roughness) {
    float a = roughness * roughness;
    float a2 = a * a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH * NdotH;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;
    return a2 / max(denom, 0.0001);
  }

  float geometrySchlickGGX(float NdotV, float roughness) {
    float r = roughness + 1.0;
    float k = (r * r) / 8.0;
    return NdotV / (NdotV * (1.0 - k) + k);
  }

  float geometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    return geometrySchlickGGX(NdotV, roughness) * geometrySchlickGGX(NdotL, roughness);
  }

  vec3 fresnelSchlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
  }

  vec3 fresnelSchlickRoughness(float cosTheta, vec3 F0, float roughness) {
    return F0 + (max(vec3(1.0 - roughness), F0) - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
  }

  vec2 envUVFromDir(vec3 dir) {
    vec3 unitDir = normalize(dir);
    float longitude = atan(unitDir.z, unitDir.x);
    float latitude = asin(clamp(unitDir.y, -1.0, 1.0));
    return vec2(longitude / (2.0 * PI) + 0.5, latitude / PI + 0.5);
  }

  vec3 sampleEnv(vec3 dir, float lod) {
    vec3 envColor = texture2D(uEnvMap, envUVFromDir(dir)).rgb;
    return pow(envColor, vec3(2.2));
  }

  void main() {
    vec3 N = normalize(vNormal);
    if (!gl_FrontFacing) N = -N;

    vec3 V = normalize(cameraPosition - vWorldPosition);
    vec3 R = reflect(-V, N);

    float rough = clamp(uRoughness, 0.04, 1.0);
    float metal = clamp(uMetallic, 0.0, 1.0);
    float NdotV = max(dot(N, V), 0.0);

    vec3 lightDirs[2];
    lightDirs[0] = normalize(vec3(0.6, 0.8, 0.5));
    lightDirs[1] = normalize(vec3(-0.6, -0.3, -0.4));

    vec3 lightColors[2];
    lightColors[0] = vec3(4.8, 4.6, 4.0);
    lightColors[1] = vec3(1.6, 1.8, 2.2);

    vec3 baseColor = uBaseColor;
    vec3 F0 = mix(vec3(0.04), baseColor, metal);
    vec3 Lo = vec3(0.0);

    for (int i = 0; i < 2; i++) {
      vec3 L = lightDirs[i];
      vec3 H = normalize(V + L);

      float NDF = distributionGGX(N, H, rough);
      float G = geometrySmith(N, V, L, rough);
      vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);

      vec3 numerator = NDF * G * F;
      float denominator = 4.0 * NdotV * max(dot(N, L), 0.0) + 0.0001;
      vec3 specular = numerator / denominator;

      vec3 kS = F;
      vec3 kD = (1.0 - kS) * (1.0 - metal);

      float NdotL = max(dot(N, L), 0.0);
      Lo += (kD * baseColor / PI + specular) * lightColors[i] * NdotL;
    }

    float specLod = rough * 0.0;
    vec3 prefilteredSpec = sampleEnv(R, specLod) * uEnvIntensity;
    vec3 irradiance = sampleEnv(N, 0.0) * uEnvIntensity;

    vec3 F_env = fresnelSchlickRoughness(NdotV, F0, rough);
    vec3 kD_env = (1.0 - F_env) * (1.0 - metal);

    vec3 diffuseIBL = kD_env * baseColor * irradiance;
    vec3 specularIBL = prefilteredSpec * F_env;

    vec3 ambient = diffuseIBL * 0.6 + specularIBL * 0.35;
    vec3 ambientFloor = baseColor * 0.18 * (1.0 - metal * 0.5);
    ambient = max(ambient, ambientFloor);

    vec3 color = (ambient + Lo) * uExposure;
    color = color / (color + vec3(0.8));
    color = pow(color, vec3(1.0 / 2.2));

    gl_FragColor = vec4(color, 1.0);
  }
`;

interface GLTFNode extends Transform {
  program?: Program & {
    gltfMaterial?: {
      baseColorFactor: number[];
      roughnessFactor: number;
      metallicFactor: number;
      doubleSided: boolean;
    };
    uniforms?: {
      uEnvMaxLod?: { value: number };
    };
  };
  geometry?: {
    computeBoundingBox: () => void;
    bounds: {
      min: { x: number; y: number; z: number };
      max: { x: number; y: number; z: number };
    };
  };
}

export function GPUCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio, 2),
    });

    const gl = renderer.gl;
    const isWebgl2 = renderer.isWebgl2;

    const activeVertex = isWebgl2 ? vertexGL2 : vertex;
    const activeFragment = isWebgl2 ? fragmentGL2 : fragmentGL1;

    gl.clearColor(0, 0, 0, 0);
    container.appendChild(gl.canvas);

    const camera = new Camera(gl, {
      fov: 45,
      near: 0.1,
      far: 100,
    });

    camera.position.set(0, 0, 10);
    camera.lookAt([0, 0, 0]);

    function resize() {
      const width = container!.clientWidth;
      const height = container!.clientHeight;
      renderer.setSize(width, height);
      camera.perspective({ aspect: width / height });
    }

    window.addEventListener("resize", resize);
    resize();

    const scene = new Transform();
    const gpu = new Transform();
    gpu.setParent(scene);

    const envTexture = new Texture(gl, {
      image: createPlaceholderPixel(gl, [130, 130, 130]),
      wrapS: gl.CLAMP_TO_EDGE,
      wrapT: gl.CLAMP_TO_EDGE,
      generateMipmaps: true,
      minFilter: gl.LINEAR_MIPMAP_LINEAR,
      magFilter: gl.LINEAR,
      flipY: false,
    });

    let envMaxLod = 0;

    function computeMaxLod(image: HTMLImageElement) {
      const size = Math.max(image.width, image.height);
      return Math.floor(Math.log2(size));
    }

    const envImage = new Image();
    envImage.crossOrigin = "anonymous";
    envImage.onload = () => {
      envTexture.image = envImage;
      envTexture.generateMipmaps = true;
      envTexture.needsUpdate = true;
      envMaxLod = computeMaxLod(envImage);
      updateEnvMaxLodUniforms(envMaxLod);
    };
    envImage.onerror = () => {
      console.warn("Environment map failed to load.");
    };
    envImage.src = "/models/home/env.jpg";

    function updateEnvMaxLodUniforms(maxLod: number) {
      if (!isWebgl2) return;
      gpu.traverse((node: GLTFNode) => {
        if (node.program?.uniforms?.uEnvMaxLod) {
          node.program.uniforms.uEnvMaxLod.value = maxLod;
        }
      });
    }

    let frameId: number;
    let disposed = false;
    let animationStarted = false;

    let isDragging = false;
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationY = -0.42;
    let targetRotationX = 0.08;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      mouseX = e.clientX;
      mouseY = e.clientY;
      container.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - mouseX;
      const deltaY = e.clientY - mouseY;
      mouseX = e.clientX;
      mouseY = e.clientY;

      targetRotationY += deltaX * 0.007;
      targetRotationX += deltaY * 0.007;
      targetRotationX = Math.max(
        -Math.PI / 3,
        Math.min(Math.PI / 3, targetRotationX),
      );
    };

    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      try {
        container.releasePointerCapture(e.pointerId);
      } catch {}
    };

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerUp);

    async function loadModel() {
      try {
        const gltf = await GLTFLoader.load(gl, "/models/home/rtx.glb");
        if (disposed) return;

        const roots = gltf.scene || gltf.scenes?.[0] || [];
        roots.forEach((root: GLTFNode) => root.setParent(gpu));

        gpu.traverse((node: GLTFNode) => {
          if (node.program?.gltfMaterial) {
            const mat = node.program.gltfMaterial;
            node.program = new Program(gl, {
              vertex: activeVertex,
              fragment: activeFragment,
              uniforms: {
                uBaseColor: { value: mat.baseColorFactor.slice(0, 3) },
                uRoughness: { value: mat.roughnessFactor * 2.5 },
                uMetallic: { value: mat.metallicFactor * 0.1 },
                uEnvMap: { value: envTexture },
                uEnvMaxLod: { value: envMaxLod },
                uEnvIntensity: { value: 1 },
                uExposure: { value: 2 },
              },
              cullFace: mat.doubleSided ? false : gl.BACK,
            });
          }
        });

        const leftFan = findNode(gpu, "LeftFan");
        const rightFan = findNode(gpu, "RightFan");

        const { min, max } = computeWorldBounds(gpu);
        const center = new Vec3(
          (min.x + max.x) / 2,
          (min.y + max.y) / 2,
          (min.z + max.z) / 2,
        );

        roots.forEach((root: GLTFNode) => {
          root.position.x -= center.x;
          root.position.y -= center.y;
          root.position.z -= center.z;
        });

        gpu.scale.set(2.0, 2.0, 2.0);
        gpu.position.set(0, 0, 0);

        const scaledBounds = computeWorldBounds(gpu);
        const sizeX = scaledBounds.max.x - scaledBounds.min.x;
        const sizeY = scaledBounds.max.y - scaledBounds.min.y;
        const maxDim = Math.max(sizeX, sizeY);
        const fitDistance =
          (maxDim / 2 / Math.tan((camera.fov * Math.PI) / 360)) * 2.4;

        camera.position.set(0, 0, Math.max(fitDistance, 8));
        camera.lookAt([0, 0, 0]);

        let time = 0;

        function update() {
          if (disposed) return;
          frameId = requestAnimationFrame(update);
          time += 0.01;

          if (isDragging) {
            gpu.rotation.y += (targetRotationY - gpu.rotation.y) * 0.15;
            gpu.rotation.x += (targetRotationX - gpu.rotation.x) * 0.15;
          } else {
            targetRotationY += 0.0005;
            gpu.rotation.y +=
              (targetRotationY +
                Math.sin(time * 0.35) * 0.05 -
                gpu.rotation.y) *
              0.08;
            gpu.rotation.x +=
              (targetRotationX +
                Math.sin(time * 0.25) * 0.02 -
                gpu.rotation.x) *
              0.08;
          }

          const leftFanRoot = findNode(gpu, "LeftFanRoot") || leftFan;
          const rightFanRoot = findNode(gpu, "RightFanRoot") || rightFan;

          if (leftFanRoot) leftFanRoot.rotation.z += 0.035;
          if (rightFanRoot) rightFanRoot.rotation.z -= 0.035;

          renderer.render({ scene, camera });
        }

        animationStarted = true;
        update();
      } catch (error) {
        console.error("Failed to load model:", error);
      }
    }

    loadModel();

    return () => {
      disposed = true;
      if (animationStarted) cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerUp);
      if (container && container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        cursor: "grab",
        touchAction: "none",
      }}
    />
  );
}

function createPlaceholderPixel(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  rgb: [number, number, number],
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    ctx.fillRect(0, 0, 1, 1);
  }
  return canvas;
}

function findNode(root: GLTFNode, name: string): GLTFNode | null {
  let result: GLTFNode | null = null;
  root.traverse((node: GLTFNode) => {
    if (result) return;
    if (node.name === name) result = node;
  });
  return result;
}

function computeWorldBounds(root: GLTFNode) {
  const min = new Vec3(Infinity, Infinity, Infinity);
  const max = new Vec3(-Infinity, -Infinity, -Infinity);

  root.traverse((node: GLTFNode) => {
    if (!node.geometry) return;
    node.geometry.computeBoundingBox();
    const { min: bMin, max: bMax } = node.geometry.bounds;

    const corners = [
      [bMin.x, bMin.y, bMin.z],
      [bMax.x, bMin.y, bMin.z],
      [bMin.x, bMax.y, bMin.z],
      [bMax.x, bMax.y, bMin.z],
      [bMin.x, bMin.y, bMax.z],
      [bMax.x, bMin.y, bMax.z],
      [bMin.x, bMax.y, bMax.z],
      [bMax.x, bMax.y, bMax.z],
    ];

    corners.forEach(([x, y, z]) => {
      const p = new Vec3(x, y, z).applyMatrix4(node.worldMatrix);
      min.x = Math.min(min.x, p.x);
      min.y = Math.min(min.y, p.y);
      min.z = Math.min(min.z, p.z);
      max.x = Math.max(max.x, p.x);
      max.y = Math.max(max.y, p.y);
      max.z = Math.max(max.z, p.z);
    });
  });

  return { min, max };
}
