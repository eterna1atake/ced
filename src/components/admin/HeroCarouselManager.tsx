'use client';
import { FormEvent, useState } from 'react';
import SaveButton from './common/SaveButton';
import { FormInput } from "@/components/admin/common/FormInputs";
import { BilingualInput } from './common/BilingualInput';

import HeroCarousel from '@/components/common/HeroCarousel';
import { useHeroCarousel } from '@/components/common/HeroCarouselProvider';
import { useAutoTranslate } from '@/hooks/useAutoTranslate';
import { LocalizedString } from '@/types/common';


// ค่าฟอร์มตั้งต้นเมื่อยังไม่ได้กรอกอะไร
const initialFormState = {
  src: '',
  alt: { th: '', en: '' } as LocalizedString,
};

export default function HeroCarouselManager() {
  const { images, addImage, removeImage, resetImages } = useHeroCarousel();
  const [formState, setFormState] = useState(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const { translate, isTranslating } = useAutoTranslate();

  const handleSrcChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState(prev => ({ ...prev, src: e.target.value }));
  };

  const handleAltChange = (lang: 'th' | 'en', val: string) => {
    setFormState(prev => ({
      ...prev,
      alt: { ...prev.alt, [lang]: val }
    }));
  };


  const handleTranslate = () => {
    translate('alt', formState.alt.th, (translated) => {
      handleAltChange('en', translated);
    });
  };

  // เมื่อส่งฟอร์มจะตรวจสอบและเพิ่มสไลด์ใหม่
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedSrc = formState.src.trim();

    if (!trimmedSrc) {
      setError('Please provide an image URL or path.');
      return;
    }

    addImage({
      src: trimmedSrc,
      alt: formState.alt.th || formState.alt.en ? formState.alt : undefined,
    });
    setFormState(initialFormState);
    setError(null);
  };


  // ลบสไลด์ที่เลือกตาม id
  const handleRemove = (id: string) => {
    removeImage(id);
  };

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <header className="space-y-1">
          <h2 className="text-2xl font-semibold text-slate-900">Hero carousel</h2>
          <p className="text-sm text-slate-600">
            Add or remove images that appear in the public hero carousel. Updates are saved automatically.
          </p>
        </header>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4">
          <HeroCarousel images={images} className="h-[320px]" intervalMs={4000} />
        </div>
      </section>

      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Current slides</h3>
          <button
            type="button"
            onClick={resetImages}
            className="text-sm font-medium text-primary-nav hover:underline"
          >
            Reset to defaults
          </button>
        </header>

        <div className="space-y-3">
          {images.length === 0 && (
            <p className="text-sm text-slate-500">The carousel is empty. Add an image to get started.</p>
          )}

          {images.map((image, index) => (
            <div
              key={image.id}
              className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Slide {index + 1}
                </p>
                <p className="text-xs text-slate-500 break-words">{image.src}</p>
                {image.alt && (
                  <p className="text-xs text-slate-400">
                    Alt text: {typeof image.alt === 'string' ? image.alt : `${image.alt.th} / ${image.alt.en}`}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleRemove(image.id)}
                className="self-start rounded-md border border-red-200 px-3 py-1 text-sm font-medium text-red-600 transition hover:border-red-300 hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6 bg-white p-6 rounded-lg">
        <h3 className="text-xl font-bold text-slate-900">Add new slide</h3>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <FormInput
            label="Image URL or path"
            name="src"
            value={formState.src}
            onChange={handleSrcChange}
            placeholder="/images/hero/new-image.jpg"
            required
          />

          <BilingualInput
            label="Alt text"
            value={formState.alt}
            onChange={handleAltChange}
            onTranslate={handleTranslate}
            isTranslating={isTranslating.alt}
            placeholder={{ th: "คำอธิบายรูปภาพ", en: "Image description" }}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}


          <div className="flex justify-end">
            <SaveButton
              label="Add slide"
              loadingLabel="Adding..."
            />
          </div>
        </form>
      </section>
    </div>
  );
}
