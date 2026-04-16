import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import config from './firebase-applet-config.json' assert { type: 'json' };

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

const seed = async () => {
    console.log("Seeding database with initial data...");
    
    // Seed vendors
    const v1 = {
        id: 'v1',
        name: 'Atelier Lagos',
        email: 'atelier@lagos.com',
        bio: 'Merging digital craftsmanship with sustainable organic fibers.',
        visualTheme: 'MINIMALIST',
        avatar: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600',
        location: 'Lagos, Nigeria',
        website: 'www.atelier-lagos.com',
        verificationStatus: 'VERIFIED',
        subscriptionStatus: 'ACTIVE',
        subscriptionPlan: 'Atelier'
    };
    await setDoc(doc(db, 'vendors', v1.id), v1);

    const v2 = {
        id: 'v2',
        name: 'Accra Avant-Garde',
        email: 'accra@avant.com',
        bio: 'Monochromatic minimalism for the modern avant-garde.',
        visualTheme: 'DARK',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600',
        location: 'Accra, Ghana',
        website: 'www.accra-avant.com',
        verificationStatus: 'VERIFIED',
        subscriptionStatus: 'ACTIVE',
        subscriptionPlan: 'Maison'
    };
    await setDoc(doc(db, 'vendors', v2.id), v2);
    
    // Seed products
    const p1 = {
        id: 'p1',
        name: 'Lagos Silk Dress',
        price: 250,
        vendorId: 'v1',
        designer: 'Atelier Lagos',
        description: 'Hand-woven silk dress with asymmetrical cut.',
        createdAt: new Date().toISOString(),
        images: ['https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=600'],
        isNewSeason: true,
        votes: 0
    };
    await setDoc(doc(db, 'products', p1.id), p1);

    const p2 = {
        id: 'p2',
        name: 'Avant-Garde Tunic',
        price: 180,
        vendorId: 'v2',
        designer: 'Accra Avant-Garde',
        description: 'Structured tunic in deep charcoal.',
        createdAt: new Date().toISOString(),
        images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600'],
        isNewSeason: false,
        votes: 0
    };
    await setDoc(doc(db, 'products', p2.id), p2);

    const p3 = {
        id: 'p3',
        name: 'Desert Nomad Jacket',
        price: 320,
        vendorId: 'v1',
        designer: 'Atelier Lagos',
        description: 'Lightweight jacket inspired by Saharan silhouettes.',
        createdAt: new Date().toISOString(),
        images: ['https://images.unsplash.com/photo-1550614000-4b95d466f166?q=80&w=600'],
        isNewSeason: true,
        votes: 0
    };
    await setDoc(doc(db, 'products', p3.id), p3);

    // Seed CMS
    const cms = {
        heroTitle: "Discover the Future of African Fashion",
        heroSubtitle: "Curated collections from the continent's most innovative designers.",
        featuredProducts: ['p1', 'p2'],
        promotionalBanners: []
    };
    await setDoc(doc(db, 'cms', 'main'), cms);

    console.log("Seeding complete.");
};

seed().catch(console.error);
