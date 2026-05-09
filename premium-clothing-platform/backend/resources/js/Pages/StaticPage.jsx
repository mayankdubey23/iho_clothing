import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';

export default function StaticPage({ title, eyebrow, body }) {
    return (
        <AppLayout>
            <Head title={`${title} | IHO Clothing`} />
            <section className="mx-auto grid min-h-[70vh] max-w-5xl place-items-center px-6 py-24 text-center lg:px-8">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.35em] text-[#E94E3C]">{eyebrow}</p>
                    <h1 className="mt-5 text-4xl font-black uppercase tracking-tight text-[#1A1A2E] md:text-6xl">{title}</h1>
                    <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-8 text-[#7A756B]">{body}</p>
                    <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Link href="/shop" className="inline-flex items-center gap-2 bg-[#1A1A2E] px-7 py-4 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-[#E94E3C]">
                            Shop Collection <ArrowRight size={16} />
                        </Link>
                        <Link href="/" className="inline-flex items-center gap-2 border border-[#E8E4D9] bg-white px-7 py-4 text-xs font-black uppercase tracking-widest text-[#1A1A2E] transition-colors hover:border-[#1A1A2E]">
                            Back Home
                        </Link>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
