import * as THREE from 'three';

export function initBackground(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // --- CONFIGURACIÓN BÁSICA (CÁMARA CON PROFUNDIDAD) ---
    const scene = new THREE.Scene();
    
    // Cámara de perspectiva para que el humo tenga profundidad 3D
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 1000;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // --- GEOMETRÍA DE HUMO DENSO ---
    const numPartículas = 5000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(numPartículas * 3);
    const colors = new Float32Array(numPartículas * 3);
    const sizes = new Float32Array(numPartículas);
    const timeFactorAttribute = new Float32Array(numPartículas);

    // Paleta de colores intensos (Azul neón y Rojo eléctrico)
    const colorsPaleta = [
        new THREE.Color(0xF4B1D2), // Rosa Maquillaje (Ternura)
        new THREE.Color(0xFFF8E1), // Crema de Vainilla (Calidez)
        new THREE.Color(0xFFFFFF)  // Blanco Puro (Limpieza)
    ];

    for (let i = 0; i < numPartículas; i++) {
        // --- 1. CONCENTRACIÓN CENTRAL (FORMA DE NUBE) ---
        // Usamos una función que agrupa los puntos más al centro que a los bordes
        const r = Math.pow(Math.random(), 0.5) * 2000; // Radio central concentrado
        const angle = Math.random() * Math.PI * 2;
        
        const x = r * Math.cos(angle);
        // Cambiamos 'r' por un rango vertical amplio para que no parezca una franja
        const y = (Math.random() - 0.5) * 2000; 
        const z = (Math.random() - 0.5) * 1000;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        // Guardamos un factor de tiempo aleatorio para que cada chispa se mueva distinto
        timeFactorAttribute[i] = Math.random();

        // --- 2. TAMAÑO MUY GRANDE (Look de Nube) ---
        sizes[i] = Math.random() * 200 + 100; // Mucho más grandes que la neblina suave

        // --- 3. COLOR SATURADO ---
        // A la izquierda azul, a la derecha rojo, como en la referencia
        const colorFactor = (x + 400) / 800; // Normalizamos X (-400 a 400) a (0.0 a 1.0)
        
        // Asignamos color basado en la posición X
        let color;
        if (colorFactor < 0.4) {
            color = colorsPaleta[0]; // Izquierda: Azul
        } else if (colorFactor > 0.6) {
            color = colorsPaleta[1]; // Derecha: Rojo
        } else {
            color = colorsPaleta[2]; // Centro: Blanco suave
        }

        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('timeFactor', new THREE.BufferAttribute(timeFactorAttribute, 1));

    // --- SHADERS (LA MÁGICA DEL MOVIMIENTO Y BRILLO) ---
    // Vertex Shader: Mueve las partículas en la GPU
    const vertexShader = `
        uniform float time;
        uniform vec2 mouse;
        attribute float size;
        attribute float timeFactor;
        varying vec3 vColor;
        varying float vOpacity;

        void main() {
            vec3 p = position;
            
            // --- MOVIMIENTO DE SUBIDA (HUMO) ---
            float cycleTime = mod(time * 0.05 + timeFactor, 1.0); // 0.0 a 1.0
            
            p.y = -800.0 + cycleTime * 1600.0; // Suben desde abajo hasta arriba
            
            // --- ONDULACIÓN ORGÁNICA ---
            float waveX = sin(p.y * 0.005 + time * 0.5) * 50.0;
            float waveZ = cos(p.y * 0.003 + time * 0.7) * 40.0;
            p.x += waveX;
            p.z += waveZ;

            // --- INTERACCIÓN CON EL MOUSE (EFECTO DISIPACIÓN) ---
            vec2 m = mouse * 1000.0; // Escalamos el mouse
            float distToMouse = distance(p.xy, m);

            if (distToMouse < 200.0) {
                float force = (200.0 - distToMouse) / 200.0;
                // Las partículas huyen del mouse suavemente
                p.x += force * 100.0 * (p.x > m.x ? 1.0 : -1.0);
                p.y += force * 100.0 * (p.y > m.y ? 1.0 : -1.0);
            }

            // --- COLOR Y OPACIDAD ---
            vColor = color;
            
            // Desvanecimiento radial (el humo se apaga en los bordes)
            vOpacity = smoothstep(1.0, 0.5, cycleTime) * smoothstep(0.0, 0.3, cycleTime) * 0.08;

            vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
            gl_PointSize = size * (400.0 / -mvPosition.z); // Tamaño con perspectiva
            gl_Position = projectionMatrix * mvPosition;
        }
    `;

    // Fragment Shader: Pinta los puntos
    const fragmentShader = `
        varying vec3 vColor;
        varying float vOpacity;

        void main() {
            // Hacemos que los puntos sean circulares y suaves (como vapor)
            float d = distance(gl_PointCoord, vec2(0.5));
            if (d > 0.5) discard;
            
            // Suavizado radial (borde transparente)
            float alpha = smoothstep(0.5, 0.1, d);

            gl_FragColor = vec4(vColor, alpha * vOpacity);
        }
    `;

    // Material personalizado con Shaders y MÁXIMO BRILLO
    const uniforms = {
        time: { value: 0.0 },
        mouse: { value: new THREE.Vector2(-1000, -1000) }
    };

    const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending, // ¡CLAVE PARA COLORES ELÉCTRICOS SOBRE NEGRO!
        depthTest: false,
        vertexColors: true
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // --- INTERACCIÓN CON EL MOUSE ---
    let mouse = new THREE.Vector2(-1000, -1000);
    document.addEventListener('mousemove', (event) => {
        // Normalizamos el mouse (-1 a 1)
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // --- BUCLE DE ANIMACIÓN ---
    function animate(currentTime) {
        requestAnimationFrame(animate);

        // Actualizamos el tiempo para los Shaders
        uniforms.time.value = currentTime * 0.001;

        // Suavizado del movimiento del mouse (Lerp)
        uniforms.mouse.value.x += (mouse.x - uniforms.mouse.value.x) * 0.05;
        uniforms.mouse.value.y += (mouse.y - uniforms.mouse.value.y) * 0.05;

        renderer.render(scene, camera);
    }

    animate(0);

    // --- AJUSTE DE VENTANA AUTOMÁTICO ---
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}