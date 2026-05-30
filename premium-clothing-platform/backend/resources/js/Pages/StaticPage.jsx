import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';

export default function StaticPage({ title, eyebrow, body, meta_title, meta_description }) {
    const hasHtml = /<\/?[a-z][\s\S]*>/i.test(body || '');

    return (
        <AppLayout>
            <Head title={meta_title || `${title} | IHO Clothing`}>
                {meta_description && <meta name="description" content={meta_description} />}
            </Head>
            <section className="mx-auto min-h-[70vh] max-w-5xl px-6 py-24 lg:px-8">
                <div className="text-center">
                    <p className="text-xs font-black uppercase tracking-[0.35em] text-[#E94E3C]">{eyebrow}</p>
                    <h1 className="mt-5 text-4xl font-black uppercase tracking-tight text-[#1A1A2E] md:text-6xl">{title}</h1>
                </div>

                <div className="mx-auto mt-10 max-w-3xl rounded-none border border-slate-100 bg-white p-8 shadow-sm">
                    {hasHtml ? (
                        <div
                            className="prose prose-slate max-w-none text-[#475569] prose-headings:font-black prose-headings:uppercase prose-a:text-[#E94E3C]"
                            dangerouslySetInnerHTML={{ __html: body || '' }}
                        />
                    ) : (
                        <p className="whitespace-pre-line text-base font-medium leading-8 text-[#7A756B]">{body}</p>
                    )}
                </div>

                <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Link href="/shop" className="inline-flex items-center gap-2 bg-[#1A1A2E] px-7 py-4 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-[#E94E3C]">
                        Shop Collection <ArrowRight size={16} />
                    </Link>
                    <Link href="/" className="inline-flex items-center gap-2 border border-[#E8E4D9] bg-white px-7 py-4 text-xs font-black uppercase tracking-widest text-[#1A1A2E] transition-colors hover:border-[#1A1A2E]">
                        Back Home
                    </Link>
                </div>
            </section>
        </AppLayout>
    );
}
