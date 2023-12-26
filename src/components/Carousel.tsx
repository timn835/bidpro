"use client";

import { ArrowBigLeft, ArrowBigRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import CarouselItem from "./CarouselItem";

type CarouselProps = {
  imgUrls: string[];
};

const Carousel = ({ imgUrls }: CarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const updateIndex = (newIndex: number) => {
    if (newIndex < 0) {
      newIndex = 0;
    } else if (newIndex >= imgUrls.length) {
      newIndex = imgUrls.length - 1;
    }

    setActiveIndex(newIndex);
  };
  return (
    <div className="carousel">
      <div
        className="inner"
        style={{ transform: `translate(-${activeIndex * 100}%)` }}
      >
        {imgUrls.map((url) => {
          return <CarouselItem key={url} url={url} width={"100%"} />;
        })}
      </div>

      <div className="carousel-buttons">
        <button
          className="button-arrow"
          onClick={() => {
            updateIndex(activeIndex - 1);
          }}
        >
          <ArrowBigLeft />
        </button>
        <div className="indicators">
          {imgUrls.map((url, index) => {
            return (
              <button
                key={url}
                className="indicator-buttons"
                onClick={() => {
                  updateIndex(index);
                }}
              >
                <span
                  className={`material-symbols-outlined ${
                    index === activeIndex
                      ? "indicator-symbol-active"
                      : "indicator-symbol"
                  }`}
                >
                  radio_button_checked
                </span>
              </button>
            );
          })}
        </div>
        <button
          className="button-arrow"
          onClick={() => {
            updateIndex(activeIndex + 1);
          }}
        >
          <ArrowBigRight />
        </button>
      </div>
    </div>
  );
};

export default Carousel;
