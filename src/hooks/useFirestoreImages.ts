import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, writeBatch, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { IMAGES, SERVICES } from '../data';
import { Service } from '../types';

const DEFAULT_SITE_IMAGES: Record<string, { url: string; updatedAt?: any }> = {
  hero:             { url: IMAGES.hero },
  secondary:        { url: IMAGES.secondary },
  leticia:          { url: IMAGES.leticia },
  studio:           { url: IMAGES.studio },
  lamination:       { url: IMAGES.lamination },
  dyeSculpt:        { url: IMAGES.dyeSculpt },
  cozyStudio:       { url: IMAGES.cozyStudio },
  eyeMask:          { url: IMAGES.eyeMask },
  beforeLamination: { url: IMAGES.beforeLamination },
  beforeSculpt:     { url: IMAGES.beforeSculpt },
};

const FALLBACK_GALLERY_ITEMS = [
  { id: 'g1', title: 'Signature Brow Lamination & Dye/Tint', serviceName: 'Brow Wax, Sculpt, Lamination & Dye/Tint', categories: ['lamination', 'tint'], type: 'slider' as const, isSlider: true, afterImg: IMAGES.lamination, beforeImg: IMAGES.beforeLamination, order: 1 },
  { id: 'g2', title: 'Precision Wax & Sculpting', serviceName: 'Brow Wax & Sculpt', categories: ['sculpt'], type: 'slider' as const, isSlider: true, afterImg: IMAGES.dyeSculpt, beforeImg: IMAGES.beforeSculpt, order: 2 },
  { id: 'g3', title: 'Hybrid Custom Brow Dye', serviceName: 'Brow Wax, Sculpt & Dye/Tint', categories: ['tint', 'sculpt'], type: 'single' as const, imageUrl: IMAGES.dyeSculpt, order: 3 },
  { id: 'g4', title: 'Fluffy Naked Lamination', serviceName: 'Brow Wax, Sculpt & Naked Lamination', categories: ['lamination', 'sculpt'], type: 'single' as const, imageUrl: IMAGES.lamination, order: 4 },
  { id: 'g5', title: 'Luxury Collagen Under-Eye Mask Integration', serviceName: 'Under Eye Mask LUXURY Add-on', categories: ['addon'], type: 'single' as const, imageUrl: IMAGES.eyeMask, order: 5 },
  { id: 'g6', title: 'Detail Tweezing & Post-Wax Treatment', serviceName: 'Brow Wax & Sculpt', categories: ['sculpt'], type: 'single' as const, imageUrl: IMAGES.hero, order: 6 },
];

const FALLBACK_INSTAGRAM_POSTS = [
  { id: 'ig1', img: IMAGES.lamination, link: 'https://www.instagram.com/thebrowmanorr/', caption: 'Blowing brows out of this world! Pure sculptural symmetry for this beautiful client. 🥰✨ #InBloom #Bongaree', likes: '143', order: 1 },
  { id: 'ig2', img: IMAGES.dyeSculpt, link: 'https://www.instagram.com/thebrowmanorr/', caption: 'Process makes perfect. We prioritize careful skin protection oils before touching warm wax to skin.', likes: '98', order: 2 },
  { id: 'ig3', img: IMAGES.eyeMask, link: 'https://www.instagram.com/thebrowmanorr/', caption: 'Drenched in custom hybrid dye. Custom mapping built exactly for these striking facial lines.', likes: '185', order: 3 },
  { id: 'ig4', img: IMAGES.cozyStudio, link: 'https://www.instagram.com/thebrowmanorr/', caption: 'A view from the sanctuary. Unwind, relax, and let your brows blossom.', likes: '112', order: 4 },
  { id: 'ig5', img: IMAGES.leticia, link: 'https://www.instagram.com/thebrowmanorr/', caption: 'Before vs After lamination. That incredible fluffy, full texture we are all obsessed with!', likes: '231', order: 5 },
  { id: 'ig6', img: IMAGES.hero, link: 'https://www.instagram.com/thebrowmanorr/', caption: 'Our Luxury Lip & Under Eye Collagen Masks will have you leaving completely floating in bliss.', likes: '154', order: 6 },
];

export function useFirestoreImages() {
  const [siteImages, setSiteImages] = useState<Record<string, { url: string; updatedAt?: any }>>(DEFAULT_SITE_IMAGES);
  const [galleryItems, setGalleryItems] = useState<any[]>(FALLBACK_GALLERY_ITEMS);
  const [instagramPosts, setInstagramPosts] = useState<any[]>(FALLBACK_INSTAGRAM_POSTS);
  const [instagramUsername, setInstagramUsername] = useState<string>('thebrowmanorr');
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let resolvedCount = 0;
    const totalSubscriptions = 4;

    const checkAllResolved = () => {
      resolvedCount += 1;
      if (resolvedCount >= totalSubscriptions) {
        setLoading(false);
      }
    };

    const unsubSiteImages = onSnapshot(
      collection(db, 'siteImages'),
      (snapshot) => {
        const loaded: Record<string, { url: string; updatedAt?: any }> = { ...DEFAULT_SITE_IMAGES };
        let loadedUsername = 'thebrowmanorr';
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (doc.id === 'instagramUsername') {
            if (data.username) {
              loadedUsername = data.username;
            }
          } else if (data.url) {
            loaded[doc.id] = { url: data.url, updatedAt: data.updatedAt };
          }
        });
        setSiteImages(loaded);
        setInstagramUsername(loadedUsername);
        checkAllResolved();
      },
      (err) => {
        console.warn('siteImages snapshot error — using defaults:', err.message);
        checkAllResolved();
      }
    );

    const unsubGallery = onSnapshot(
      collection(db, 'galleryItems'),
      (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            isSlider: doc.data().type === 'slider',
          } as any));
          items.sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));
          setGalleryItems(items);
        } else {
          setGalleryItems(FALLBACK_GALLERY_ITEMS);
        }
        checkAllResolved();
      },
      (err) => {
        console.warn('galleryItems snapshot error — using fallback:', err.message);
        checkAllResolved();
      }
    );

    const unsubInsta = onSnapshot(
      collection(db, 'instagramPosts'),
      (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          } as any));
          items.sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));
          setInstagramPosts(items);
        } else {
          setInstagramPosts(FALLBACK_INSTAGRAM_POSTS);
        }
        checkAllResolved();
      },
      (err) => {
        console.warn('instagramPosts snapshot error — using fallback:', err.message);
        checkAllResolved();
      }
    );

    const unsubServices = onSnapshot(
      collection(db, 'services'),
      async (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          } as any));
          items.sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));
          setServices(items as Service[]);
        } else {
          try {
            const batch = writeBatch(db);
            SERVICES.forEach((service, index) => {
              const { id, ...serviceData } = service;
              const serviceRef = doc(db, 'services', id);
              batch.set(serviceRef, { ...serviceData, order: index + 1 });
            });
            await batch.commit();
            console.log('[useFirestoreImages] Default services batched into Firestore successfully.');
          } catch (writeErr) {
            console.error('[useFirestoreImages] Error batch writing default services:', writeErr);
          }
          setServices(SERVICES);
        }
        checkAllResolved();
      },
      (err) => {
        console.warn('services snapshot error — using fallback:', err.message);
        checkAllResolved();
      }
    );

    return () => {
      unsubSiteImages();
      unsubGallery();
      unsubInsta();
      unsubServices();
    };
  }, []);

  return { siteImages, galleryItems, instagramPosts, instagramUsername, services, loading, error };
}
