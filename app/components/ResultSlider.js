"use client";

import { useId } from 'react';
import Image from "next/image";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

export default function ResultSlider({ results }) {
  const uniqueId = useId();
  
  if (!results || results.length === 0) {
    return null;
  }

  if (results.length === 1) {
    return (
      <div className="mb-4 border border-[#ffffff1a] rounded-xl">
        {results[0].type === "image" && (
          <Image
            src={results[0].src}
            alt="Generated Result"
            width={700}
            height={460}
            className="w-full portfolio-generate-image object-cover rounded-xl"
            unoptimized
          />
        )}
        {results[0].type === "video" && (
          <video
            src={results[0].src}
            autoPlay
            loop
            muted
            playsInline
            className="w-full portfolio-generate-image object-cover rounded-xl"
          />
        )}
      </div>
    );
  }

  // Create unique class names for this slider instance
  const prevButtonClass = `custom-prev-${uniqueId.replace(/:/g, '')}`;
  const nextButtonClass = `custom-next-${uniqueId.replace(/:/g, '')}`;

 return (
    <>

      {/* Custom Buttons - Unique per slider */}
      <button className={`${prevButtonClass} custom-prev absolute right-[50px] top-0 -translate-y-[50px] z-10`}>
        ‹
      </button>

      <button className={`${nextButtonClass} custom-next absolute right-0 top-0 -translate-y-[50px] z-10`}>
        ›
      </button>
      <Swiper
        modules={[Navigation]}
        spaceBetween={16}
        slidesPerView={1}
        navigation={{
          prevEl: `.${prevButtonClass}`,
          nextEl: `.${nextButtonClass}`,
        }}
        className="result-swiper"
      >
        {results.map((result, index) => (
          <SwiperSlide key={index}>
            <div className="border border-[#ffffff1a] rounded-xl overflow-hidden">
              {result.type === "image" && (
                <Image
                  src={result.src}
                  alt="Generated Result"
                  width={700}
                  height={460}
                  className="w-full portfolio-generate-image object-cover rounded-xl"
                  unoptimized
                />
              )}

              {result.type === "video" && (
                <video
                  src={result.src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full portfolio-generate-image object-cover rounded-xl"
                />
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}
