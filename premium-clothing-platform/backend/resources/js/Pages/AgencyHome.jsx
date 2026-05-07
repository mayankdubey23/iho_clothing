import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Head } from '@inertiajs/react';
import Lenis from '@studio-freight/lenis';
import Spline from '@splinetool/react-spline';
import { ArrowRight } from 'lucide-react';

export default function AgencyHome() {
    // 1. BUTTERY SMOOTH SCROLLING (Lenis)
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        return () => lenis.destroy();
    }, []);

    // 2. CUSTOM CURSOR TRACKING
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const updateMousePosition = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', updateMousePosition);
        return () => window.removeEventListener('mousemove', updateMousePosition);
    }, []);

    const cursorX = useSpring(mousePosition.x, { stiffness: 500, damping: 28 });
    const cursorY = useSpring(mousePosition.y, { stiffness: 500, damping: 28 });

    // 3. PARALLAX SCROLL MATH
    const { scrollYProgress } = useScroll();
    const yText = useTransform(scrollYProgress, [0, 1], [0, 400]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    // Typography Stagger Animation
    const titleContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
    };
    const titleChar = {
        hidden: { opacity: 0, y: 100, rotateX: -90 },
        visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
    };

    return (
        <div className="bg-[#0f0f0f] text-[#f4f4f4] min-h-screen selection:bg-white selection:text-black cursor-none">
            <Head title="Digital Experience Agency" />

            {/* Custom Animated Cursor */}
            <motion.div 
                className="fixed top-0 left-0 w-6 h-6 bg-white rounded-full mix-blend-difference pointer-events-none z-[100] flex items-center justify-center"
                style={{ x: cursorX, y: cursorY, translateX: '-50%', translateY: '-50%' }}
                animate={{ scale: isHovering ? 3 : 1 }}
                transition={{ duration: 0.2 }}
            >
                {isHovering && <span className="text-[4px] text-black font-bold uppercase tracking-widest">View</span>}
            </motion.div>

            {/* Nixtio-Style Minimal Navbar */}
            <nav className="fixed top-0 w-full z-50 p-6 md:p-10 flex justify-between items-center mix-blend-difference">
                <div className="text-xl font-bold tracking-tighter">NIXTIO<span className="font-light">INSPIRED</span></div>
                <div className="flex gap-8 text-sm font-medium uppercase tracking-widest">
                    <a href="#work" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} className="hover:opacity-50 transition-opacity">Work</a>
                    <a href="#studio" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} className="hover:opacity-50 transition-opacity">Studio</a>
                    <a href="#contact" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} className="hover:opacity-50 transition-opacity">Contact</a>
                </div>
            </nav>

            {/* HERO SECTION: 3D + Kinetic Typography */}
            <section className="relative h-screen w-full flex flex-col justify-center items-center overflow-hidden">
                
                {/* Interactive 3D Background (Spline) */}
                <div className="absolute inset-0 z-0 opacity-60">
                    <Spline scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" />
                </div>

                <motion.div style={{ y: yText, opacity: opacityHero }} className="relative z-10 flex flex-col items-center pointer-events-none">
                    <div className="overflow-hidden pb-4">
                        <motion.div variants={titleContainer} initial="hidden" animate="visible" className="flex">
                            {Array.from("DIGITAL").map((char, i) => (
                                <motion.span key={i} variants={titleChar} className="text-[12vw] font-black leading-none tracking-tighter">
                                    {char}
                                </motion.span>
                            ))}
                        </motion.div>
                    </div>
                    <div className="overflow-hidden mt-[-4vw]">
                        <motion.div variants={titleContainer} initial="hidden" animate="visible" className="flex">
                            {Array.from("EXPERIENCES.").map((char, i) => (
                                <motion.span key={i} variants={titleChar} className="text-[12vw] font-light italic leading-none tracking-tighter text-transparent" style={{ WebkitTextStroke: '2px #f4f4f4' }}>
                                    {char}
                                </motion.span>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {/* SERVICES / MANIFESTO SECTION */}
            <section className="relative py-32 px-6 md:px-20 z-10 bg-[#0f0f0f]">
                <div className="max-w-5xl mx-auto">
                    <motion.p 
                        initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1 }}
                        className="text-3xl md:text-5xl font-light leading-tight tracking-tight"
                    >
                        We build world-changing digital products. From <span className="font-bold italic">SaaS dashboards</span> to high-end <span className="font-bold italic">eCommerce</span>, we bring innovation and usability together.
                    </motion.p>
                </div>

                <div className="mt-32 grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Magnetic Agency Card 1 */}
                    <motion.div 
                        onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}
                        whileHover={{ scale: 0.98 }}
                        className="bg-[#1a1a1a] p-12 rounded-3xl cursor-none"
                    >
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-8">001. Web & App Design</p>
                        <h3 className="text-4xl font-black mb-6">Visual Identity</h3>
                        <div className="w-full h-64 bg-gray-800 rounded-xl overflow-hidden mb-8">
                            <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop" alt="Abstract 3D" className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000" />
                        </div>
                    </motion.div>

                    {/* Magnetic Agency Card 2 (Offset for parallax effect) */}
                    <motion.div 
                        onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}
                        whileHover={{ scale: 0.98 }}
                        className="bg-[#1a1a1a] p-12 rounded-3xl md:mt-24 cursor-none"
                    >
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-8">002. Development</p>
                        <h3 className="text-4xl font-black mb-6">Creative Engineering</h3>
                        <div className="w-full h-64 bg-gray-800 rounded-xl overflow-hidden mb-8">
                            <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop" alt="Cyberpunk Tech" className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000" />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* MASSIVE FOOTER */}
            <footer className="py-32 px-6 md:px-20 bg-[#f4f4f4] text-[#0f0f0f] rounded-t-[3rem] mt-20">
                <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
                    <h2 className="text-[10vw] font-black tracking-tighter leading-none mb-10">LET'S TALK</h2>
                    
                    <button 
                        onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}
                        className="w-40 h-40 bg-[#0f0f0f] text-[#f4f4f4] rounded-full flex items-center justify-center text-lg font-bold hover:scale-110 transition-transform duration-500 group"
                    >
                        Start Project <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                    </button>
                </div>
            </footer>
        </div>
    );
}