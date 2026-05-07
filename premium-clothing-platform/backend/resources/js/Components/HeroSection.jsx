import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Environment } from '@react-three/drei';

// --- Premium Letter Assembly Component (Unchanged) ---
const AnimatedLetters = ({ text, className, style, baseDelay = 0 }) => {
    const letters = Array.from(text);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: baseDelay }
        }
    };

    const letterVariants = {
        hidden: (i) => {
            const directions = [
                { x: 0, y: -250 }, { x: 250, y: 0 }, { x: 0, y: 250 }, { x: -250, y: 0 },
            ];
            const dir = directions[i % 4];
            return { opacity: 0, x: dir.x, y: dir.y, rotate: i % 2 === 0 ? 45 : -45, scale: 0.2 };
        },
        visible: {
            opacity: 1, x: 0, y: 0, rotate: 0, scale: 1,
            transition: { type: "spring", damping: 14, stiffness: 120 }
        }
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className={`flex flex-wrap justify-center ${className}`} style={style}>
            {letters.map((letter, index) => (
                <motion.span key={index} custom={index} variants={letterVariants} className="inline-block origin-center">
                    {letter === " " ? "\u00A0" : letter}
                </motion.span>
            ))}
        </motion.div>
    );
};

// --- The 3D Background Component ---
const Abstract3DBackground = () => {
    return (
        // The Canvas is our 3D world window
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }} className="w-full h-full">
            {/* Cinematic Lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 10, 5]} intensity={2} color="#E94E3C" /> {/* Brand Orange Light */}
            <directionalLight position={[-5, -10, -5]} intensity={3} color="#2A2A4E" /> {/* Deep Blue Fill Light */}
            <Environment preset="city" /> {/* Adds realistic reflections */}

            {/* The Floating 3D Object */}
            <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
                <Sphere args={[1.8, 128, 128]}>
                    {/* MeshDistortMaterial creates that liquid/morphing shape effect */}
                    <MeshDistortMaterial 
                        color="#0B0B10" // Dark core
                        distort={0.4} // How much it morphs
                        speed={1.5} // Morph speed
                        roughness={0.1} // Glossy surface
                        metalness={0.8} // Metallic reflection
                        wireframe={false} // Set to true if you want a cool grid effect instead!
                    />
                </Sphere>
            </Float>
        </Canvas>
    );
};

// --- Main Hero Component ---
export default function HeroSection() {
    const containerRef = useRef(null);
    const { scrollY } = useScroll();
    
    // Parallax text on scroll
    const yText = useTransform(scrollY, [0, 500], [0, 150]);

    return (
        <section 
            ref={containerRef} 
            className="relative h-[calc(100vh-72px)] w-full flex flex-col items-center justify-center overflow-hidden bg-[#0B0B10]"
        >
            {/* 1. The 3D Canvas Layer */}
            <div className="absolute inset-0 z-0 opacity-80 cursor-pointer">
                <Abstract3DBackground />
            </div>

            {/* 2. Optional SVG Noise Overlay to make the 3D look more cinematic/filmic */}
            <div 
                className="absolute inset-0 z-10 opacity-[0.15] pointer-events-none mix-blend-overlay" 
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />

            {/* Animated Text Container */}
            <motion.div 
                style={{ y: yText }} 
                className="relative z-20 flex flex-col items-center text-center px-4 w-full pointer-events-none"
            >
                <AnimatedLetters 
                    text="PERFORMANCE"
                    baseDelay={0.4}
                    className="text-[12vw] md:text-[8vw] font-black tracking-tighter text-white uppercase leading-none drop-shadow-2xl"
                />

                <AnimatedLetters 
                    text="REDEFINED."
                    baseDelay={1.0}
                    className="text-[12vw] md:text-[8vw] font-light tracking-tighter text-transparent uppercase leading-none italic drop-shadow-lg mt-[-2vw]"
                    style={{ WebkitTextStroke: '2px #E94E3C' }}
                />

                <motion.div 
                    initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }} 
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} 
                    transition={{ delay: 2.4, duration: 1.2, ease: "easeOut" }}
                    className="mt-8 md:mt-12 text-white text-xs md:text-sm uppercase tracking-[0.4em] font-bold px-6 py-3 border border-white/10 rounded-full backdrop-blur-md bg-white/5 shadow-2xl pointer-events-auto"
                >
                    Premium Sports Wear Collection
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.2, duration: 1 }}
                    className="absolute -bottom-32 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
                >
                    <span className="text-[9px] text-white/50 uppercase tracking-[0.3em] font-bold">Scroll</span>
                    <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="w-[1px] h-16 bg-gradient-to-b from-[#E94E3C] to-transparent" />
                </motion.div>
            </motion.div>
        </section>
    );
}