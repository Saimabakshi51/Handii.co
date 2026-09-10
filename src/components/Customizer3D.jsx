import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useCart } from '../context/CartContext';

// Color and material presets
const BAG_COLORS = [
  { id: 'natural', name: 'Natural Oatmeal', hex: '#FAF3E0', rough: 0.8 },
  { id: 'rose', name: 'Blush Rose', hex: '#E8A598', rough: 0.7 },
  { id: 'teal', name: 'Studio Ink Teal', hex: '#2C4C52', rough: 0.6 },
  { id: 'caramel', name: 'Warm Caramel', hex: '#C2844B', rough: 0.65 },
  { id: 'lavender', name: 'Lavender Mist', hex: '#B8A9C9', rough: 0.75 },
  { id: 'sage', name: 'Earthy Sage', hex: '#8FA89B', rough: 0.8 },
];

const CHARM_METALS = [
  { id: 'gold', name: 'Gold Foil & Brass', hex: '#D4AF37', metalness: 0.85, roughness: 0.2 },
  { id: 'rosegold', name: 'Rose Gold Shimmer', hex: '#B76E79', metalness: 0.8, roughness: 0.25 },
  { id: 'silver', name: 'Sterling Silver', hex: '#C0C0C0', metalness: 0.9, roughness: 0.15 },
];

const FLOWER_CHARMS = [
  { id: 'tulip', name: 'Pink Tulip Stem', hex: '#E25B7B', stemHex: '#4E7C59', price: 99 },
  { id: 'sunflower', name: 'Golden Sunflower', hex: '#F5B041', stemHex: '#3E6B48', price: 119 },
  { id: 'daisy', name: 'White Daisy Bloom', hex: '#FDFEFE', stemHex: '#4E7C59', price: 89 },
  { id: 'lavender', name: 'Purple Lavender', hex: '#9B59B6', stemHex: '#3E6B48', price: 99 },
];

export default function Customizer3D() {
  const { addToCart } = useCart();
  const mountRef = useRef(null);

  const [selectedBagColor, setSelectedBagColor] = useState(BAG_COLORS[0]);
  const [selectedMetal, setSelectedMetal] = useState(CHARM_METALS[0]);
  const [selectedFlower, setSelectedFlower] = useState(FLOWER_CHARMS[0]);
  const [charmLetter, setCharmLetter] = useState('H');
  const [customEngraving, setCustomEngraving] = useState('Handmade for You');
  const [autoRotate, setAutoRotate] = useState(true);
  const autoRotateRef = useRef(true);
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);


  // Three.js References
  const sceneRef = useRef(null);
  const bagMeshRef = useRef(null);
  const handleMeshRef = useRef(null);
  const charmMeshRef = useRef(null);
  const ringMeshRef = useRef(null);
  const flowerMeshRef = useRef(null);
  const stemMeshRef = useRef(null);
  const textTextureRef = useRef(null);
  const groupRef = useRef(null);

  // Total pricing calculation
  const baseBagPrice = 499;
  const resinCharmPrice = 199;
  const flowerPrice = selectedFlower.price;
  const totalPrice = baseBagPrice + resinCharmPrice + flowerPrice;

  // Helper to generate dynamic canvas texture for the resin alphabet charm
  function createLetterTexture(letter, metalHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Background semi-translucent crystal resin gradient
    const grad = ctx.createRadialGradient(256, 256, 40, 256, 256, 256);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.5, '#F9F5EC');
    grad.addColorStop(1, '#E4D6BC');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Decorative golden flakes
    ctx.fillStyle = metalHex;
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = Math.random() * 6 + 2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Border ring
    ctx.strokeStyle = metalHex;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(256, 256, 230, 0, Math.PI * 2);
    ctx.stroke();

    // Bold Serif Letter in center
    ctx.font = 'bold 260px "Fraunces", "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#1E3A3F';
    ctx.fillText((letter || 'H').toUpperCase().charAt(0), 256, 260);

    return new THREE.CanvasTexture(canvas);
  }

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 450;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 5.2);

    // 3. Renderer with high quality & anti-aliasing
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting Setup (Soft Studio Lighting)
    const ambientLight = new THREE.AmbientLight(0xfff8ee, 1.2);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    mainKeyLight.position.set(4, 6, 4);
    mainKeyLight.castShadow = true;
    mainKeyLight.shadow.mapSize.width = 1024;
    mainKeyLight.shadow.mapSize.height = 1024;
    scene.add(mainKeyLight);

    const fillLight = new THREE.PointLight(0xffdfba, 0.8, 20);
    fillLight.position.set(-4, 2, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xd4af37, 1.0);
    rimLight.position.set(0, -3, -4);
    scene.add(rimLight);

    // 5. Build 3D Canvas Bag & Accessories Hierarchy
    const masterGroup = new THREE.Group();
    groupRef.current = masterGroup;
    scene.add(masterGroup);

    // --- A. Main Tote Bag Body (Rounded Chamfer Box) ---
    const bagGeo = new THREE.BoxGeometry(2.2, 2.4, 0.85, 16, 16, 16);
    const bagMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(selectedBagColor.hex),
      roughness: selectedBagColor.rough,
      metalness: 0.05
    });
    const bagMesh = new THREE.Mesh(bagGeo, bagMat);
    bagMesh.castShadow = true;
    bagMesh.receiveShadow = true;
    bagMeshRef.current = bagMesh;
    masterGroup.add(bagMesh);

    // --- B. Bag Top Rim Stitching Detail ---
    const rimGeo = new THREE.TorusGeometry(1.1, 0.04, 16, 32);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x1e3a3f, roughness: 0.9 });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = 1.2;
    rimMesh.scale.set(1.02, 0.4, 1);
    masterGroup.add(rimMesh);

    // --- C. Leather Strap Handles ---
    const handleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.6, 1.15, 0.44),
      new THREE.Vector3(-0.6, 2.1, 0.44),
      new THREE.Vector3(0.6, 2.1, 0.44),
      new THREE.Vector3(0.6, 1.15, 0.44)
    ]);
    const handleGeo = new THREE.TubeGeometry(handleCurve, 40, 0.045, 12, false);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x3d271d, roughness: 0.4, metalness: 0.1 });
    const frontHandle = new THREE.Mesh(handleGeo, handleMat);
    frontHandle.castShadow = true;
    handleMeshRef.current = frontHandle;
    masterGroup.add(frontHandle);

    const backHandleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.6, 1.15, -0.44),
      new THREE.Vector3(-0.6, 2.1, -0.44),
      new THREE.Vector3(0.6, 2.1, -0.44),
      new THREE.Vector3(0.6, 1.15, -0.44)
    ]);
    const backHandle = new THREE.Mesh(new THREE.TubeGeometry(backHandleCurve, 40, 0.045, 12, false), handleMat);
    masterGroup.add(backHandle);

    // --- D. Keyring Ring Loop ---
    const ringGeo = new THREE.TorusGeometry(0.18, 0.025, 16, 32);
    const ringMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(selectedMetal.hex),
      metalness: selectedMetal.metalness,
      roughness: selectedMetal.roughness
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(-0.6, 1.15, 0.52);
    ringMeshRef.current = ringMesh;
    masterGroup.add(ringMesh);

    // --- E. Hanging Resin Alphabet Charm Disc ---
    const charmGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.05, 32);
    const charmTex = createLetterTexture(charmLetter, selectedMetal.hex);
    textTextureRef.current = charmTex;

    const charmMatSide = new THREE.MeshStandardMaterial({
      color: new THREE.Color(selectedMetal.hex),
      metalness: selectedMetal.metalness,
      roughness: selectedMetal.roughness
    });
    const charmMatFace = new THREE.MeshStandardMaterial({
      map: charmTex,
      roughness: 0.1,
      metalness: 0.15,
      transparent: true,
      opacity: 0.96
    });

    const charmMaterials = [charmMatSide, charmMatFace, charmMatFace];
    const charmMesh = new THREE.Mesh(charmGeo, charmMaterials);
    charmMesh.rotation.x = Math.PI / 2;
    charmMesh.position.set(-0.6, 0.72, 0.56);
    charmMesh.castShadow = true;
    charmMeshRef.current = charmMesh;
    masterGroup.add(charmMesh);

    // --- F. Pipe Cleaner Flower Bloom Attachment ---
    const flowerGroup = new THREE.Group();
    flowerGroup.position.set(-0.35, 0.85, 0.55);

    // Stem
    const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 12);
    const stemMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(selectedFlower.stemHex), roughness: 0.8 });
    const stemMesh = new THREE.Mesh(stemGeo, stemMat);
    stemMesh.rotation.z = -0.25;
    stemMeshRef.current = stemMesh;
    flowerGroup.add(stemMesh);

    // Petals / Bloom Sphere Cluster
    const flowerMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(selectedFlower.hex), roughness: 0.9 });
    flowerMeshRef.current = flowerMat;

    const centerGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const centerMesh = new THREE.Mesh(centerGeo, new THREE.MeshStandardMaterial({ color: 0xf4d03f, roughness: 0.6 }));
    centerMesh.position.set(-0.08, 0.24, 0);
    flowerGroup.add(centerMesh);

    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const petalGeo = new THREE.SphereGeometry(0.1, 14, 14);
      petalGeo.scale(1, 1.4, 0.7);
      const petal = new THREE.Mesh(petalGeo, flowerMat);
      petal.position.set(
        -0.08 + Math.cos(angle) * 0.16,
        0.24 + Math.sin(angle) * 0.16,
        0.02
      );
      petal.rotation.z = angle;
      flowerGroup.add(petal);
    }
    masterGroup.add(flowerGroup);

    // --- G. Soft Studio Ground Shadow Plane ---
    const shadowGeo = new THREE.PlaneGeometry(8, 8);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.18 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.4;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // 6. Interactive Mouse Drag / Touch Controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    function onPointerDown(e) {
      isDragging = true;
      previousMousePosition = { x: e.clientX || (e.touches && e.touches[0].clientX) || 0, y: e.clientY || (e.touches && e.touches[0].clientY) || 0 };
    }

    function onPointerMove(e) {
      if (!isDragging || !masterGroup) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

      const deltaX = clientX - previousMousePosition.x;
      const deltaY = clientY - previousMousePosition.y;

      masterGroup.rotation.y += deltaX * 0.008;
      masterGroup.rotation.x += deltaY * 0.004;

      // Clamp vertical tilt
      masterGroup.rotation.x = Math.max(-0.4, Math.min(0.4, masterGroup.rotation.x));

      previousMousePosition = { x: clientX, y: clientY };
    }

    function onPointerUp() {
      isDragging = false;
    }

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    domElem.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // 7. Animation Loop
    let animationFrameId;
    function animate() {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotateRef.current && !isDragging && masterGroup) {
        masterGroup.rotation.y += 0.006;
      }

      renderer.render(scene, camera);
    }

    animate();

    // 8. Resize Observer
    function handleResize() {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    }
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      domElem.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      domElem.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update Bag Color in real-time
  useEffect(() => {
    if (bagMeshRef.current) {
      bagMeshRef.current.material.color.set(selectedBagColor.hex);
      bagMeshRef.current.material.roughness = selectedBagColor.rough;
    }
  }, [selectedBagColor]);

  // Update Charm Metal Finish in real-time
  useEffect(() => {
    if (ringMeshRef.current) {
      ringMeshRef.current.material.color.set(selectedMetal.hex);
      ringMeshRef.current.material.metalness = selectedMetal.metalness;
    }
    if (charmMeshRef.current) {
      const newTex = createLetterTexture(charmLetter, selectedMetal.hex);
      charmMeshRef.current.material[1].map = newTex;
      charmMeshRef.current.material[2].map = newTex;
      charmMeshRef.current.material[1].needsUpdate = true;
      charmMeshRef.current.material[2].needsUpdate = true;
      charmMeshRef.current.material[0].color.set(selectedMetal.hex);
    }
  }, [selectedMetal, charmLetter]);

  // Update Flower Colors in real-time
  useEffect(() => {
    if (flowerMeshRef.current) {
      flowerMeshRef.current.color.set(selectedFlower.hex);
    }
    if (stemMeshRef.current) {
      stemMeshRef.current.material.color.set(selectedFlower.stemHex);
    }
  }, [selectedFlower]);

  function handleAddToCart() {
    const customConfig = {
      id: `3D-BAG-${Date.now()}`,
      title: `3D Custom Bag & Charm (${selectedBagColor.name})`,
      price: totalPrice,
      img: '/images/reelall.jpeg',
      quantity: 1,
      color: selectedBagColor.name,
      customText: `Letter Charm: [${charmLetter.toUpperCase()}], Flower: [${selectedFlower.name}], Metal: [${selectedMetal.name}], Note: [${customEngraving}]`
    };

    addToCart(customConfig);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  }

  return (
    <div className="customizer-3d-layout">
      {/* Left: 3D Interactive WebGL Canvas */}
      <div className="canvas-3d-wrapper">
        <div className="canvas-badge-overlay">
          <span className="live-pill">● Live 3D WebGL Studio</span>
          <button
            className={`btn-spin-toggle ${autoRotate ? 'active' : ''}`}
            onClick={() => setAutoRotate(!autoRotate)}
            title="Toggle 360° Auto-Rotation"
          >
            {autoRotate ? '🔄 Pause Auto-Spin' : '▶ Auto-Spin 360°'}
          </button>
        </div>

        <div className="three-canvas-container" ref={mountRef} />

        <div className="canvas-instruction-bar">
          <span>🖐️ Drag in any direction to inspect the bag &amp; charms in 360°</span>
        </div>
      </div>

      {/* Right: Customization Controls & Live Order Summary */}
      <div className="customizer-3d-controls">
        <div className="c3d-header">
          <span className="tag">Bespoke 3D Studio</span>
          <h2>Craft Your Bag &amp; Charm 🧵</h2>
          <p>Personalize every stitch, resin letter initial, and floral charm stem in real-time.</p>
        </div>

        {/* 1. Bag Base Tone */}
        <div className="c3d-control-group">
          <label className="c3d-label">
            1. Select Bag Canvas Color: <strong>{selectedBagColor.name}</strong>
          </label>
          <div className="c3d-color-swatches">
            {BAG_COLORS.map((c) => (
              <button
                key={c.id}
                className={`c3d-swatch ${selectedBagColor.id === c.id ? 'selected' : ''}`}
                style={{ backgroundColor: c.hex }}
                onClick={() => setSelectedBagColor(c)}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* 2. Resin Alphabet Letter Initial */}
        <div className="c3d-control-group">
          <label className="c3d-label">
            2. Resin Alphabet Charm Letter: <strong>[ {charmLetter.toUpperCase()} ]</strong>
          </label>
          <div className="c3d-letter-picker">
            {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((char) => (
              <button
                key={char}
                className={`letter-chip ${charmLetter.toUpperCase() === char ? 'selected' : ''}`}
                onClick={() => setCharmLetter(char)}
              >
                {char}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Hardware & Ring Finish */}
        <div className="c3d-control-group">
          <label className="c3d-label">
            3. Charm Hardware &amp; Flakes: <strong>{selectedMetal.name}</strong>
          </label>
          <div className="c3d-metal-options">
            {CHARM_METALS.map((m) => (
              <button
                key={m.id}
                className={`metal-btn ${selectedMetal.id === m.id ? 'selected' : ''}`}
                onClick={() => setSelectedMetal(m)}
              >
                <span className="metal-dot" style={{ backgroundColor: m.hex }} />
                {m.name}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Flower Charm Attachment */}
        <div className="c3d-control-group">
          <label className="c3d-label">
            4. Attached Pipe Cleaner Flower: <strong>{selectedFlower.name} (+₹{selectedFlower.price})</strong>
          </label>
          <div className="c3d-flower-grid">
            {FLOWER_CHARMS.map((f) => (
              <button
                key={f.id}
                className={`flower-card-btn ${selectedFlower.id === f.id ? 'selected' : ''}`}
                onClick={() => setSelectedFlower(f)}
              >
                <span className="flower-dot" style={{ backgroundColor: f.hex }} />
                <div className="flower-btn-info">
                  <strong>{f.name}</strong>
                  <small>+₹{f.price}</small>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 5. Custom Note / Ribbon Tag */}
        <div className="c3d-control-group">
          <label className="c3d-label">5. Custom Note / Ribbon Tag (Optional)</label>
          <input
            type="text"
            className="c3d-text-input"
            value={customEngraving}
            onChange={(e) => setCustomEngraving(e.target.value)}
            placeholder="e.g. Happy Birthday Sarah! 🌸"
            maxLength={40}
          />
        </div>

        {/* Pricing Breakdown & Add To Cart CTA */}
        <div className="c3d-summary-card">
          <div className="c3d-price-breakdown">
            <div className="p-row">
              <span>Canvas Handbag Base:</span>
              <span>₹{baseBagPrice}</span>
            </div>
            <div className="p-row">
              <span>Resin Alphabet Initial [{charmLetter.toUpperCase()}]:</span>
              <span>₹{resinCharmPrice}</span>
            </div>
            <div className="p-row">
              <span>{selectedFlower.name}:</span>
              <span>₹{flowerPrice}</span>
            </div>
            <div className="p-row total-row">
              <strong>Total Custom Piece:</strong>
              <strong className="c3d-total-price">₹{totalPrice}</strong>
            </div>
          </div>

          <button className="btn btn-primary c3d-submit-btn" onClick={handleAddToCart}>
            Add Custom 3D Bag to Cart — ₹{totalPrice} 🛍️
          </button>

          {addedToast && (
            <div className="c3d-toast">
              ✨ Custom 3D Handbag added to your cart! Slide open cart to checkout.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
