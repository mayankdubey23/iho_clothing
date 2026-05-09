'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Environment, Sphere } from '@react-three/drei';

// ─── Animated Letters (upgraded with blur + scale entry) ──────────────────────
const AnimatedLetters = ({
    text,
    className = '',
    style,
    baseDelay = 0,
    variant = 'solid',
}) => {
    const letters = Array.from(text);

    const container = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.06, delayChildren: baseDelay },
        },
    };

    const letter = {
        hidden: (i) => {
            const dirs = [
                { x: 0, y: -180 },
                { x: 180, y: 0 },
                { x: 0, y: 180 },
                { x: -180, y: 0 },
            ];
            return {
                opacity: 0,
                ...dirs[i % 4],
                rotate: i % 2 === 0 ? 30 : -30,
                scale: 0.3,
                filter: 'blur(8px)',
            };
        },
        visible: {
            opacity: 1,
            x: 0,
            y: 0,
            rotate: 0,
            scale: 1,
            filter: 'blur(0px)',
            transition: { type: 'spring', damping: 16, stiffness: 140 },
        },
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className={`flex flex-wrap justify-center ${className}`}
            style={style}
        >
            {letters.map((char, i) => (
                <motion.span
                    key={i}
                    custom={i}
                    variants={letter}
                    className="inline-block origin-center"
                    whileHover={{
                        scale: 1.08,
                        color: variant === 'outline' ? '#E94E3C' : '#FF6B5B',
                        transition: { duration: 0.15 },
                    }}
                >
                    {char === ' ' ? '\u00A0' : char}
                </motion.span>
            ))}
        </motion.div>
    );
};

// ─── Orbiting ring particle ────────────────────────────────────────────────────
const OrbitRing = ({ radius, speed, color }) => {
    const ref = useRef(null);
    useFrame((_, delta) => {
        if (ref.current) {
            ref.current.rotation.x += delta * speed * 0.4;
            ref.current.rotation.y += delta * speed * 0.7;
            ref.current.rotation.z += delta * speed * 0.2;
        }
    });
    return (
        <mesh ref={ref}>
            <torusGeometry args={[radius, 0.012, 16, 120]} />
            <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} emissive={color} emissiveIntensity={0.4} />
        </mesh>
    );
};

// ─── Core distort sphere ──────────────────────────────────────────────────────
const DistortCore = () => {
    const ref = useRef(null);
    useFrame(({ clock }) => {
        if (ref.current) {
            ref.current.rotation.y = clock.getElapsedTime() * 0.15;
            ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.15;
        }
    });
    return (
        <Float speed={1.8} rotationIntensity={0.6} floatIntensity={1.2}>
            <mesh ref={ref}>
                <Sphere args={[1.6, 128, 128]}>
                    <MeshDistortMaterial
                        color="#0B0B10"
                        distort={0.45}
                        speed={1.8}
                        roughness={0.05}
                        metalness={0.95}
                        wireframe={false}
                    />
                </Sphere>
            </mesh>

            {/* Orbiting energy rings */}
            <OrbitRing radius={2.1} speed={0.5} color="#E94E3C" />
            <OrbitRing radius={2.5} speed={0.3} color="#FF8C00" />
            <OrbitRing radius={2.9} speed={0.2} color="#E94E3C" />
        </Float>
    );
};

// ─── 3D Background Scene ──────────────────────────────────────────────────────
const Abstract3DBackground = () => (
    <Canvas camera={{ position: [0, 0, 6], fov: 42 }} className="w-full h-full">
        <ambientLight intensity={0.3} />
        <directionalLight position={[6, 8, 4]} intensity={3} color="#E94E3C" />
        <directionalLight position={[-6, -8, -4]} intensity={2.5} color="#1A1A4E" />
        <pointLight position={[0, 0, 3]} intensity={1.5} color="#FF4422" />
        <Environment preset="night" />
        <DistortCore />
    </Canvas>
);

// ─── Animated stat counter ─────────────────────────────────────────────────────
const StatCounter = ({ value, suffix, label, delay }) => {
    const [count, setCount] = useState(0);
    const [started, setStarted] = useState(false);

    useEffect(() => {
        if (!started) return;
        let start = 0;
        const duration = 1800;
        const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * value));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [started, value]);

    return (
        <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.7, ease: 'easeOut' }}
            onAnimationComplete={() => setStarted(true)}
        >
            <div className="flex items-end gap-0.5">
                <span className="font-black text-3xl md:text-4xl text-white tracking-tight tabular-nums">
                    {count}
                </span>
                <span className="text-[#E94E3C] font-black text-2xl md:text-3xl mb-0.5">{suffix}</span>
            </div>
            <span className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.25em] text-white/40 mt-1">
                {label}
            </span>
        </motion.div>
    );
};

// ─── Magnetic CTA Button ──────────────────────────────────────────────────────
const MagneticButton = ({ children, primary = true, onClick }) => {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 300, damping: 30 });
    const springY = useSpring(y, { stiffness: 300, damping: 30 });

    const handleMouseMove = (e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        x.set((e.clientX - cx) * 0.35);
        y.set((e.clientY - cy) * 0.35);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.button
            ref={ref}
            style={{ x: springX, y: springY }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            whileTap={{ scale: 0.96 }}
            className={`
        relative overflow-hidden px-8 py-4 text-xs font-bold uppercase tracking-[0.22em]
        transition-colors duration-300 group cursor-pointer
        ${primary
                    ? 'bg-[#E94E3C] text-white border border-[#E94E3C] hover:bg-[#FF6B5B]'
                    : 'bg-transparent text-white border border-white/20 hover:border-white/50'
                }
      `}
        >
            {/* Shimmer sweep */}
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-white/10 skew-x-12 pointer-events-none" />
            <span className="relative z-10">{children}</span>
        </motion.button>
    );
};

// ─── Ticker tape ──────────────────────────────────────────────────────────────
const tags = [
    'AEROFLEX PRO', 'VELOCITY SERIES', 'ENGINEERED PERFORMANCE', 'ELITE COMPRESSION',
    'PRO MESH TECH', 'THERMAL ADAPT', 'CARBON WEAVE', 'RACE READY',
];

const Ticker = () => (
    <div className="relative overflow-hidden border-y border-white/8 py-3 bg-[#E94E3C]/5">
        <motion.div
            className="flex gap-12 whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 22, ease: 'linear', repeat: Infinity }}
        >
            {[...tags, ...tags].map((tag, i) => (
                <span key={i} className="flex items-center gap-3 text-[10px] font-bold tracking-[0.3em] text-white/50 uppercase">
                    <span className="w-1 h-1 rounded-full bg-[#E94E3C] inline-block" />
                    {tag}
                </span>
            ))}
        </motion.div>
    </div>
);

// ─── Collection spotlight pills ───────────────────────────────────────────────
const collections = ['Running', 'Training', 'Yoga', 'Team Sport', 'Outdoor'];
const CollectionPills = () => {
    const [active, setActive] = useState(0);

    useEffect(() => {
        const t = setInterval(() => setActive(a => (a + 1) % collections.length), 2200);
        return () => clearInterval(t);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.6, duration: 0.8 }}
            className="flex flex-wrap gap-2 justify-center"
        >
            {collections.map((c, i) => (
                <motion.button
                    key={c}
                    onClick={() => setActive(i)}
                    animate={{
                        background: active === i ? 'rgba(233,78,60,0.18)' : 'rgba(255,255,255,0.04)',
                        borderColor: active === i ? 'rgba(233,78,60,0.6)' : 'rgba(255,255,255,0.1)',
                        color: active === i ? '#E94E3C' : 'rgba(255,255,255,0.4)',
                    }}
                    transition={{ duration: 0.3 }}
                    className="px-4 py-1.5 rounded-full border text-[10px] font-bold tracking-[0.18em] uppercase cursor-pointer"
                >
                    {c}
                </motion.button>
            ))}
        </motion.div>
    );
};

// ─── Main Hero ────────────────────────────────────────────────────────────────
export default function HeroSection() {
    const containerRef = useRef(null);
    const { scrollY } = useScroll();

    // Layered parallax
    const yText = useTransform(scrollY, [0, 600], [0, 180]);
    const yCanvas = useTransform(scrollY, [0, 600], [0, 80]);
    const scaleCanvas = useTransform(scrollY, [0, 600], [1, 1.12]);
    const opacityCanvas = useTransform(scrollY, [0, 400], [1, 0]);

    // Cursor glow
    const cursorX = useMotionValue(0);
    const cursorY = useMotionValue(0);
    const cursorSX = useSpring(cursorX, { stiffness: 80, damping: 20 });
    const cursorSY = useSpring(cursorY, { stiffness: 80, damping: 20 });

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        cursorX.set(e.clientX - rect.left);
        cursorY.set(e.clientY - rect.top);
    };

    return (
        <section
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="relative w-full overflow-hidden bg-[#0B0B10]"
            style={{ minHeight: 'calc(100vh - 72px)' }}
        >
            {/* ── Cursor glow ── */}
            <motion.div
                className="absolute pointer-events-none z-10 rounded-full"
                style={{
                    x: cursorSX,
                    y: cursorSY,
                    translateX: '-50%',
                    translateY: '-50%',
                    width: 420,
                    height: 420,
                    background: 'radial-gradient(circle, rgba(233,78,60,0.09) 0%, transparent 70%)',
                }}
            />

            {/* ── 3D Canvas ── */}
            <motion.div
                className="absolute inset-0 z-0"
                style={{ y: yCanvas, scale: scaleCanvas, opacity: opacityCanvas }}
            >
                <Abstract3DBackground />
            </motion.div>

            {/* ── Geometric grid overlay ── */}
            <div
                className="absolute inset-0 z-[1] pointer-events-none"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(233,78,60,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(233,78,60,0.04) 1px, transparent 1px)
          `,
                    backgroundSize: '72px 72px',
                }}
            />

            {/* ── Vignette edges ── */}
            <div className="absolute inset-0 z-[2] pointer-events-none"
                style={{
                    background: `
            radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, #0B0B10 100%)
          `,
                }}
            />

            {/* ── Noise film grain ── */}
            <div
                className="absolute inset-0 z-[3] opacity-[0.08] pointer-events-none mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundSize: '180px 180px',
                }}
            />

            {/* ── Accent diagonal stripe ── */}
            <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ delay: 0.5, duration: 1.2, ease: 'easeOut' }}
                    className="absolute right-[-10%] top-[-5%] w-[1px] h-[130%] origin-top"
                    style={{
                        background: 'linear-gradient(to bottom, transparent, rgba(233,78,60,0.35), transparent)',
                        transform: 'rotate(12deg)',
                    }}
                />
                <motion.div
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ delay: 0.7, duration: 1.2, ease: 'easeOut' }}
                    className="absolute right-[-6%] top-[-5%] w-[1px] h-[130%] origin-top"
                    style={{
                        background: 'linear-gradient(to bottom, transparent, rgba(233,78,60,0.12), transparent)',
                        transform: 'rotate(12deg)',
                    }}
                />
            </div>

            {/* ── Main content ── */}
            <motion.div
                className="relative z-20 flex flex-col items-center justify-center text-center px-4 w-full pointer-events-none"
                style={{ paddingTop: '10vh', paddingBottom: '4vh', y: yText }}
            >
                {/* Season badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.7, ease: 'backOut' }}
                    className="mb-8 flex items-center gap-3 pointer-events-auto"
                >
                    <span className="w-6 h-[1px] bg-[#E94E3C]" />
                    <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#E94E3C]">
                        S/S 2026 Collection
                    </span>
                    <span className="w-6 h-[1px] bg-[#E94E3C]" />
                </motion.div>

                {/* Headline */}
                <AnimatedLetters
                    text="PERFORMANCE"
                    baseDelay={0.35}
                    className="font-black uppercase leading-none tracking-tighter text-white"
                    style={{ fontSize: 'clamp(3.5rem, 11vw, 9rem)', lineHeight: 0.9 }}
                />

                <AnimatedLetters
                    text="REDEFINED."
                    baseDelay={0.95}
                    variant="outline"
                    className="font-light italic uppercase leading-none tracking-tighter"
                    style={{
                        fontSize: 'clamp(3.5rem, 11vw, 9rem)',
                        lineHeight: 0.9,
                        marginTop: '-0.05em',
                        WebkitTextStroke: '1.5px #E94E3C',
                        color: 'transparent',
                    }}
                />

                {/* Sub tagline */}
                <motion.p
                    initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ delay: 2.0, duration: 1, ease: 'easeOut' }}
                    className="mt-8 max-w-md text-sm md:text-base font-light text-white/50 leading-relaxed tracking-wide"
                >
                    Engineered for athletes who refuse to compromise between{' '}
                    <em className="text-white/75 not-italic font-medium">aesthetics</em> and{' '}
                    <em className="text-white/75 not-italic font-medium">performance</em>.
                </motion.p>

                {/* Collection pills */}
                <div className="mt-6 pointer-events-auto">
                    <CollectionPills />
                </div>

                {/* CTA row */}
                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.3, duration: 0.8, ease: 'easeOut' }}
                    className="mt-10 flex flex-wrap items-center gap-4 justify-center pointer-events-auto"
                >
                    <MagneticButton primary>Shop Collection</MagneticButton>
                    <MagneticButton primary={false}>View Lookbook</MagneticButton>
                </motion.div>

                {/* Stats row */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.8, duration: 0.8 }}
                    className="mt-16 flex items-center gap-10 md:gap-16 justify-center"
                >
                    <div className="w-[1px] h-12 bg-white/10 hidden md:block" />
                    <StatCounter value={12} suffix="K+" label="Athletes" delay={2.9} />
                    <div className="w-[1px] h-12 bg-white/10" />
                    <StatCounter value={150} suffix="+" label="Products" delay={3.0} />
                    <div className="w-[1px] h-12 bg-white/10" />
                    <StatCounter value={48} suffix="" label="Franchises" delay={3.1} />
                    <div className="w-[1px] h-12 bg-white/10" />
                    <StatCounter value={6} suffix="★" label="Avg. Rating" delay={3.2} />
                    <div className="w-[1px] h-12 bg-white/10 hidden md:block" />
                </motion.div>

                {/* Scroll cue */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3.5, duration: 1 }}
                    className="mt-16 flex flex-col items-center gap-2"
                >
                    <span className="text-[9px] font-bold tracking-[0.35em] uppercase text-white/25">
                        Scroll
                    </span>
                    <motion.div
                        animate={{ y: [0, 12, 0] }}
                        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                        className="w-[1px] h-14"
                        style={{
                            background: 'linear-gradient(to bottom, #E94E3C, transparent)',
                        }}
                    />
                </motion.div>
            </motion.div>

            {/* ── Ticker tape at the bottom ── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3.6, duration: 1 }}
                className="relative z-20"
            >
                <Ticker />
            </motion.div>
        </section>
    );
}