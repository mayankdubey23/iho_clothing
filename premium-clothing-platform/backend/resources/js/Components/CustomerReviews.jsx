import React from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle2, MessageSquareQuote } from 'lucide-react';

const fallbackReviews = [
    {
        id: 'fallback-1',
        name: 'Rahul Sharma',
        rating: 5,
        text: "The Aero-Weave tee is incredibly light. I use it for my marathon training and it barely feels like it's there. The sweat-wicking is next level.",
        product: 'Titanium Aero-Weave Running Tee',
        image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=400&auto=format&fit=crop',
    },
    {
        id: 'fallback-2',
        name: 'Priya Malik',
        rating: 5,
        text: "Perfect fit. Finally found premium gym wear that doesn't cost a kidney. The fabric stretch is amazing for deep squats.",
        product: 'Core Tech Track Pants',
        image: null,
    },
    {
        id: 'fallback-3',
        name: 'Amit Kumar',
        rating: 4,
        text: 'Good quality fabric. The packaging was also very premium. Delivery took one extra day but the product completely makes up for it.',
        product: 'Signature Black Hoodie',
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=400&auto=format&fit=crop',
    },
    {
        id: 'fallback-4',
        name: 'Vikram S.',
        rating: 5,
        text: 'Bought this for my daily workouts. The material feels cold to the touch and super breathable. Will definitely buy more colors.',
        product: 'Thermal Adapt Base Layer',
        image: null,
    },
    {
        id: 'fallback-5',
        name: 'Neha D.',
        rating: 5,
        text: "The compression shorts are fantastic. They don't ride up while running and the pocket placement is perfect for my phone.",
        product: 'Titanium Compression Shorts',
        image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?q=80&w=400&auto=format&fit=crop',
    },
];

const imageUrl = (path) => {
    if (!path) return null;
    if (String(path).startsWith('http') || String(path).startsWith('/storage/')) return path;
    return `/storage/${String(path).replace(/^\/+/, '')}`;
};

const normalizeReview = (review) => ({
    id: review.id,
    name: review.name || review.customer_name || 'Customer',
    rating: Number(review.rating) || 5,
    text: review.text || review.review_text || review.review || '',
    product: review.product || review.product_purchased || 'Verified Purchase',
    image: imageUrl(review.image || review.image_path),
});

export default function CustomerReviews({ reviews = [] }) {
    const displayReviews = (reviews.length > 0 ? reviews : fallbackReviews).map(normalizeReview);
    const marqueeReviews = [...displayReviews, ...displayReviews];
    const averageRating = displayReviews.length
        ? (displayReviews.reduce((sum, review) => sum + review.rating, 0) / displayReviews.length).toFixed(1)
        : '5.0';

    return (
        <section className="py-24 bg-[#F8FAFC] border-t border-slate-200 overflow-hidden relative">
            <div className="max-w-[1400px] mx-auto px-6 mb-16 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-[1px] w-8 bg-[#1E293B]" />
                            <span className="text-[10px] font-black tracking-[0.4em] uppercase text-[#1E293B] flex items-center gap-2">
                                <MessageSquareQuote size={12} /> Community Voice
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-[#1E293B] uppercase tracking-tighter italic">
                            Athlete Feedback.
                        </h2>
                    </div>

                    <div className="flex items-center gap-4 bg-white px-6 py-4 border border-slate-200 shadow-sm">
                        <div className="flex text-[#1E293B]">
                            {[...Array(5)].map((_, i) => <Star key={i} size={18} className="fill-[#1E293B]" />)}
                        </div>
                        <div className="h-8 w-[1px] bg-slate-200" />
                        <div>
                            <p className="text-xl font-black tracking-tight text-[#1E293B]">{averageRating}/5</p>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Based on customer reviews</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute left-0 top-0 bottom-0 w-12 md:w-32 bg-gradient-to-r from-[#F8FAFC] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 md:w-32 bg-gradient-to-l from-[#F8FAFC] to-transparent z-10 pointer-events-none" />

            <div className="flex overflow-hidden">
                <motion.div
                    animate={{ x: ['0%', '-50%'] }}
                    transition={{ ease: 'linear', duration: 40, repeat: Infinity }}
                    className="flex gap-6 w-max px-6"
                >
                    {marqueeReviews.map((review, index) => (
                        <ReviewCard key={`${review.id}-${index}`} review={review} />
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

function ReviewCard({ review }) {
    return (
        <div className="w-[350px] md:w-[450px] bg-white border border-slate-200 p-8 shadow-sm shrink-0 flex flex-col justify-between group hover:border-[#1E293B] transition-colors">
            <div className="mb-6 border-b border-slate-100 pb-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={14}
                                className={i < review.rating ? 'text-[#1E293B] fill-[#1E293B]' : 'text-slate-200 fill-slate-200'}
                            />
                        ))}
                    </div>
                    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-2 py-1">
                        <CheckCircle2 size={10} /> Verified
                    </span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">
                    Purchased: <span className="text-[#1E293B]">{review.product}</span>
                </p>
            </div>

            <div className="flex gap-4 mb-6 grow">
                <p className="text-sm font-medium text-slate-600 leading-relaxed italic relative z-10">
                    "{review.text}"
                </p>
                {review.image && (
                    <div className="w-20 h-20 shrink-0 bg-slate-100 overflow-hidden border border-slate-200 relative group-hover:border-[#1E293B] transition-colors">
                        <img src={review.image} alt="Customer review" className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all" />
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3">
                <div className="size-8 bg-[#1E293B] text-white flex items-center justify-center text-xs font-black uppercase rounded-none">
                    {review.name.charAt(0)}
                </div>
                <h4 className="text-xs font-black text-[#1E293B] uppercase tracking-widest">
                    {review.name}
                </h4>
            </div>
        </div>
    );
}
