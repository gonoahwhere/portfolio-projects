import { useEffect, useRef } from 'react'
import '../styles/background.css'

const PixelStar = ({ size = 22, color = 'rgba(102,201,255,0.6)' }) => (
    <svg viewBox="0 0 5 5" width={size} height={size} style={{ imageRendering: 'pixelated' }}>
        <rect x="2" y="0" width="1" height="1" fill={color}/>
        <rect x="1" y="1" width="3" height="1" fill={color}/>
        <rect x="0" y="2" width="5" height="1" fill={color} opacity="1.3"/>
        <rect x="1" y="3" width="3" height="1" fill={color}/>
        <rect x="2" y="4" width="1" height="1" fill={color}/>
    </svg>
);

const PixelHeart = () => (
    <svg viewBox="0 0 7 6" width="22" height="22" style={{ imageRendering: 'pixelated' }}>
        <rect x="1" y="0" width="2" height="1" fill="rgba(255,140,180,0.55)"/>
        <rect x="4" y="0" width="2" height="1" fill="rgba(255,140,180,0.55)"/>
        <rect x="0" y="1" width="3" height="1" fill="rgba(255,140,180,0.55)"/>
        <rect x="3" y="1" width="4" height="1" fill="rgba(255,140,180,0.55)"/>
        <rect x="0" y="2" width="7" height="1" fill="rgba(255,140,180,0.65)"/>
        <rect x="1" y="3" width="5" height="1" fill="rgba(255,140,180,0.55)"/>
        <rect x="2" y="4" width="3" height="1" fill="rgba(255,140,180,0.55)"/>
        <rect x="3" y="5" width="1" height="1" fill="rgba(255,140,180,0.55)"/>
    </svg>
);

const PixelDiamond = () => (
    <svg viewBox="0 0 5 5" width="18" height="18" style={{ imageRendering: 'pixelated' }}>
        <rect x="2" y="0" width="1" height="1" fill="rgba(180,200,255,0.55)"/>
        <rect x="1" y="1" width="3" height="1" fill="rgba(180,200,255,0.55)"/>
        <rect x="0" y="2" width="5" height="1" fill="rgba(180,200,255,0.7)"/>
        <rect x="1" y="3" width="3" height="1" fill="rgba(180,200,255,0.55)"/>
        <rect x="2" y="4" width="1" height="1" fill="rgba(180,200,255,0.55)"/>
    </svg>
);

const PixelMushroom = () => (
    <svg viewBox="0 0 7 8" width="26" height="26" style={{ imageRendering: 'pixelated' }}>
        <rect x="1" y="0" width="5" height="1" fill="rgba(200,100,100,0.5)"/>
        <rect x="0" y="1" width="7" height="1" fill="rgba(200,100,100,0.5)"/>
        <rect x="0" y="2" width="7" height="1" fill="rgba(200,100,100,0.55)"/>
        <rect x="0" y="3" width="7" height="1" fill="rgba(200,100,100,0.5)"/>
        <rect x="2" y="1" width="1" height="1" fill="rgba(255,255,255,0.45)"/>
        <rect x="5" y="2" width="1" height="1" fill="rgba(255,255,255,0.45)"/>
        <rect x="2" y="4" width="3" height="1" fill="rgba(230,210,180,0.5)"/>
        <rect x="2" y="5" width="3" height="1" fill="rgba(230,210,180,0.5)"/>
        <rect x="2" y="6" width="3" height="1" fill="rgba(230,210,180,0.45)"/>
        <rect x="1" y="7" width="5" height="1" fill="rgba(230,210,180,0.4)"/>
    </svg>
);

const DECOS = [
    { id: 'star1', Component: PixelStar, style: { top: '40px', left: '35px' }, anim: 'floatA', twinkleDelay: '0s', floatDelay: '0s', depth: 0.12 },
    { id: 'star2', Component: PixelStar, style: { top: '60px', right: '45px' }, anim: 'floatB', twinkleDelay: '1s', floatDelay: '0.8s', depth: 0.10, props: { size: 16, color: 'rgba(102,201,255,0.5)' } },
    { id: 'star3', Component: PixelStar, style: { top: '38%', right: '20px' }, anim: 'floatC', twinkleDelay: '0.7s', floatDelay: '2s', depth: 0.08, props: { size: 14, color: 'rgba(102,201,255,0.5)' } },
    { id: 'heart', Component: PixelHeart, style: { bottom: '70px', left: '30px' }, anim: 'floatC', twinkleDelay: '0.5s', floatDelay: '0.4s', depth: 0.15 },
    { id: 'diamond', Component: PixelDiamond, style: { bottom: '90px', right: '35px' }, anim: 'floatA', twinkleDelay: '2s', floatDelay: '1.2s', depth: 0.11 },
    { id: 'mushroom', Component: PixelMushroom,style: { top: '45%', left: '22px' }, anim: 'floatB', twinkleDelay: '1.5s', floatDelay: '0.3s', depth: 0.14 },
]

const BURST_COLOURS = [
    // Cyans & blues
    [102, 201, 255],
    [180, 200, 255],
    [70, 160, 230],
    [140, 220, 255],
    [60, 130, 200],
    [180, 230, 255],
    [90, 180, 220],

    // Pinks & reds
    [255, 140, 180],
    [200, 100, 100],
    [255, 105, 150],
    [230, 80, 120],
    [255, 170, 200],
    [200, 60, 90],
    [255, 180, 195],

    // Greens
    [150, 220, 150],
    [100, 200, 130],
    [170, 240, 170],
    [80, 180, 110],
    [200, 240, 180],

    // Yellows & oranges
    [255, 220, 100],
    [255, 180, 60],
    [240, 200, 80],
    [255, 210, 140],
    [230, 160, 50],
    [255, 240, 150],

    // Purples & magentas
    [180, 130, 255],
    [210, 150, 240],
    [150, 100, 220],
    [230, 180, 255],
    [170, 80, 200],
    [200, 160, 255],

    // Warm & cosy
    [230, 210, 180],
    [210, 180, 140],
    [240, 220, 200],
    [200, 160, 120],

    // Whites & soft greys
    [230, 235, 240],
    [210, 220, 230],
    [245, 245, 250],
    [200, 210, 220],
    [255, 250, 240],
]

export default function Background() {
    const starRef = useRef(null);
    const burstRef = useRef(null);
    const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const burstsRef = useRef([]);
    const decoRefs = useRef({})

    useEffect(() => {
        const starCanvas = starRef.current;
        const burstCanvas = burstRef.current;
        const starCtx = starCanvas.getContext('2d');
        const burstCtx = burstCanvas.getContext('2d');

        const resize = () => {
            starCanvas.width = burstCanvas.width = window.innerWidth;
            starCanvas.height = burstCanvas.height = window.innerHeight;
        };

        resize();
        window.addEventListener('resize', resize);

        const onMouseMove = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
        window.addEventListener('mousemove', onMouseMove);

        const layers = [
            { stars: [], count: 80, speedFactor: 0.008, sizeRange: [0.3, 0.9] },
            { stars: [], count: 60, speedFactor: 0.018, sizeRange: [0.6, 1.3] },
            { stars: [], count: 40, speedFactor: 0.035, sizeRange: [1.0, 2.0] },
        ]

        layers.forEach(layer => {
            for (let i = 0; i < layer.count; i++) {
                layer.stars.push({
                    bx: Math.random(),
                    by: Math.random(),
                    r: layer.sizeRange[0] + Math.random() * (layer.sizeRange[1] - layer.sizeRange[0]),
                    phase: Math.random() * Math.PI * 2,
                    speed: Math.random() * 0.4 + 0.7,
                    hue: Math.random() > 0.65 ? '102, 201, 255' : '200, 215, 235',
                });
            }
        });

        let animId1, animId2;

        const drawStars = (time) => {
            starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            const dx = mouseRef.current.x - cx;
            const dy = mouseRef.current.y - cy;

            layers.forEach(layer => {
                layer.stars.forEach(s => {
                    let x = (s.bx * starCanvas.width + dx * layer.speedFactor) % starCanvas.width;
                    let y = (s.by * starCanvas.height + dy * layer.speedFactor) % starCanvas.height;
                    if (x < 0) x += starCanvas.width;
                    if (y < 0) y += starCanvas.height;

                    const osc = (Math.sin(time * 0.001 * s.speed + s.phase) + 1) / 2;
                    const alpha = 0.15 + osc * 0.55;

                    starCtx.beginPath();
                    starCtx.arc(x, y, s.r, 0, Math.PI * 2);
                    starCtx.fillStyle = `rgba(${s.hue}, ${alpha})`;
                    starCtx.fill();
                });
            });

            animId1 = requestAnimationFrame(drawStars);
        };

        animId1 = requestAnimationFrame(drawStars);

        const drawBursts = () => {
            burstCtx.clearRect(0, 0, burstCanvas.width, burstCanvas.height);
            burstsRef.current = burstsRef.current.filter(g => g.length > 0);
            burstsRef.current.forEach(group => {
                for (let i = group.length - 1; i >= 0; i--) {
                    const p = group[i];
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += 0.06;
                    p.life -= p.decay;
                    if (p.life <= 0) {
                        group.splice(i, 1); 
                        continue 
                    }

                    burstCtx.fillStyle = `rgba(${p.col[0]}, ${p.col[1]}, ${p.col[2]}, ${p.life})`;
                    burstCtx.fillRect(Math.round(p.x - p.size / 2), Math.round(p.y - p.size / 2), p.size, p.size);
                }
            });
            
            animId2 = requestAnimationFrame(drawBursts);
        }
        
        animId2 = requestAnimationFrame(drawBursts);

        const onCLickBurst = (e) => {
            const count = 12 + Math.floor(Math.random() * 8);
            const col = BURST_COLOURS[Math.floor(Math.random() * BURST_COLOURS.length)];
            const particles = [];
            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.6;
                const speed = 1.5 + Math.random() * 3;
                particles.push({
                    x: e.clientX, y: e.clientY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 1,
                    decay: 0.015 + Math.random() * 0.02,
                    size: 3 + Math.random() * 3,
                    col,
                });
            }

            burstsRef.current.push(particles);
        };

        window.addEventListener('click', onCLickBurst);

        let animId3;

        const updateDecos = () => {
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            const dx = mouseRef.current.x - cx;
            const dy = mouseRef.current.y - cy;

            DECOS.forEach(d => {
                const el = decoRefs.current[d.id];

                if (el) {
                    el.style.transform = `translate(${dx * d.depth}px, ${dy * d.depth}px)`;
                }
            });

            animId3 = requestAnimationFrame(updateDecos)
        }

        animId3 = requestAnimationFrame(updateDecos);
        
        return () => {
            cancelAnimationFrame(animId1);
            cancelAnimationFrame(animId2);
            cancelAnimationFrame(animId3);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('click', onCLickBurst)
        }
    }, [])

    return (
        <>
            <canvas ref={starRef} className="bg-starfield" />
            
            <canvas ref={burstRef} className="bg-burst" />

            {DECOS.map(d => (
                <div key={d.id}
                ref={el => decoRefs.current[d.id] = el}
                className="bg-pixel-deco"
                style={{
                    ...d.style,
                    animation: `${d.anim} 5s ease-in-out infinite ${d.floatDelay}, twinkle 4s ease-in-out infinite ${d.twinkleDelay}`,
                }}>
                    <d.Component {...(d.props || {})} />
                </div>
            ))}
        </>
    )
}