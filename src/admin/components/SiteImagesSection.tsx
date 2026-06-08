import React from 'react';
import ImageUploadCard from './ImageUploadCard';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface SiteImagesSectionProps {
  siteImages: Record<string, { url: string; updatedAt?: any }>;
}

const STATIC_IMAGE_CARDS_METADATA = [
  {
    idKey: 'hero',
    label: 'Hero Banner',
    usageNote: 'Homepage hero section · Gallery detail card',
  },
  {
    idKey: 'secondary',
    label: 'Secondary Studio',
    usageNote: 'Homepage right column · Instagram mock strip',
  },
  {
    idKey: 'leticia',
    label: 'Leticia Portrait',
    usageNote: 'About page main photo · Instagram mock strip',
  },
  {
    idKey: 'studio',
    label: 'Studio Interior',
    usageNote: 'Homepage backdrop cards',
  },
  {
    idKey: 'cozyStudio',
    label: 'Cosy Studio',
    usageNote: 'First Visit timeline background · Instagram mock',
  },
  {
    idKey: 'eyeMask',
    label: 'Eye Mask Treatment',
    usageNote: 'Gallery luxury add-on card · Instagram mock',
  },
];

export default function SiteImagesSection({ siteImages }: SiteImagesSectionProps) {

  const handleUpdateImage = async (idKey: string, secureUrl: string) => {
    const docPath = `siteImages/${idKey}`;
    try {
      await setDoc(doc(db, 'siteImages', idKey), {
        url: secureUrl,
        updatedAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.warn((err && err.message) || err);
    }
  };

  return (
    <section id="site-images-section" className="scroll-mt-24 space-y-6">
      <div>
        <h2 className="serif text-2xl sm:text-3xl text-charcoal font-light">Site Images</h2>
        <p className="text-sm text-charcoal-light/75 mt-1">
          These are the fixed named images used across the website. Replace any image to update it everywhere it appears.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {STATIC_IMAGE_CARDS_METADATA.map((img) => {
          const currentUrl = siteImages[img.idKey]?.url || '';
          const updatedAt = siteImages[img.idKey]?.updatedAt;

          return (
            <ImageUploadCard
              key={img.idKey}
              idKey={img.idKey}
              label={img.label}
              usageNote={img.usageNote}
              currentUrl={currentUrl}
              updatedAt={updatedAt}
              folder="in-bloom/site-images"
              onUpdate={(secureUrl) => handleUpdateImage(img.idKey, secureUrl)}
            />
          );
        })}
      </div>
    </section>
  );
}
