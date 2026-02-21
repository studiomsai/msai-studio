"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function ResultSlider({ results }) {
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
            controls
            className="w-full portfolio-generate-image object-cover rounded-xl"
          />
        )}
      </div>
    );
  }

 return (
    <>

      {/* Custom Buttons */}
      <button className="custom-prev absolute right-[50px] top-0 -translate-y-[50px] z-10">
        ‹
      </button>

      <button className="custom-next absolute right-0 top-0 -translate-y-[50px] z-10">
        ›
      </button>
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={16}
        slidesPerView={1}
        navigation={{
          prevEl: ".custom-prev",
          nextEl: ".custom-next",
        }}
        pagination={{ clickable: true }}
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
                  controls
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
