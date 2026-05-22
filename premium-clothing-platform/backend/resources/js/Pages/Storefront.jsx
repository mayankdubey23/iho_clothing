import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';


// Components
import HeroSection from '@/Components/HeroSection';
import NewArrivals from '@/Components/NewArrivals';
import FranchiseEnquiryBanner from '@/Components/FranchiseEnquiryBanner';
import CustomerReviews from '@/Components/CustomerReviews';
import OffersSection from '@/Components/OffersSection';

export default function Storefront({ categories, featuredCategories, products, newArrivals, bestSellers, allProducts, offers, testimonials }) {
    const productList = Array.isArray(products) ? products : products?.data || [];
    const categoryList = Array.isArray(categories) ? categories : categories?.data || [];
    const featuredCategoryList = Array.isArray(featuredCategories)
        ? featuredCategories
        : featuredCategories?.data || [];

    const newArrivalsList = Array.isArray(newArrivals)
        ? newArrivals
        : newArrivals?.data || productList.slice(0, 4);

    const bestSellersList = Array.isArray(bestSellers)
        ? bestSellers
        : bestSellers?.data || productList;

    const allProductsList = Array.isArray(allProducts)
        ? allProducts
        : allProducts?.data || [...newArrivalsList, ...bestSellersList, ...productList];

    const offersList = Array.isArray(offers) ? offers : offers?.data || [];
    const testimonialList = Array.isArray(testimonials) ? testimonials : testimonials?.data || [];
    const productsByKeyword = (keywords) => {
        const source = allProductsList.length ? allProductsList : [...newArrivalsList, ...bestSellersList];
        const filtered = source.filter((product) => {
            const haystack = `${product.name || ''} ${product.category || ''} ${product.category_name || ''}`.toLowerCase();
            return keywords.some((keyword) => haystack.includes(keyword));
        });

        return filtered.length >= 4 ? filtered : source;
    };

    return (
        <AppLayout verticalNav>
            <Head title="IHO STUDIO | Performance Luxury" />

            {/* 1. Offer marquee and product mentions */}
            <HeroSection offers={offersList} />

            {/* 2. Moving product carousel */}
            <NewArrivals eyebrow="Just Dropped" title="New Arrivals" products={newArrivalsList} href="/shop?sort=newest" />
            <NewArrivals eyebrow="Popular Picks" title="Best Sellers" products={bestSellersList} href="/shop?sort=popular" reverse />
            <NewArrivals eyebrow="Full Catalog" title="More Products" products={allProductsList} href="/shop" />
            <NewArrivals eyebrow="Training Edit" title="Gym Products" products={productsByKeyword(['gym', 'training', 'glove', 'tank'])} href="/shop?category=gym-wear" reverse />
            <NewArrivals eyebrow="Speed Edit" title="Running Products" products={productsByKeyword(['run', 'track', 'jacket', 'short'])} href="/shop?category=running-wear" />
            <CustomerReviews reviews={testimonialList} />
            <OffersSection offers={offersList} />
            <FranchiseEnquiryBanner />
        </AppLayout>
    );
}
