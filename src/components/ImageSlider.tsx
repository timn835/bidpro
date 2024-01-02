import { ArrowBigLeft, ArrowBigRight, Dot } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import Image from "next/image";

type ImageSliderProps = {
  imgUrls: string[];
  imgBlurUrls?: (string | null)[];
};

const ImageSlider = ({ imgUrls, imgBlurUrls }: ImageSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };
  return (
    <div className="w-full h-[60vh] mb-12 p-2 rounded-md bg-white relative group">
      <Dialog
        open={isOpen}
        onOpenChange={(v) => {
          if (!v) setIsOpen(v);
        }}
      >
        <DialogTrigger asChild onClick={() => setIsOpen(true)}>
          <div className="relative h-full w-full">
            <Image
              src={imgUrls[currentIndex]}
              alt="lot-image"
              fill
              style={{ objectFit: "cover" }}
              sizes={"600px"}
              className="rounded-md"
              placeholder="blur"
              blurDataURL={
                imgBlurUrls!.length > 0
                  ? imgBlurUrls![currentIndex]!
                  : "/standard-lot-small.jpg"
              }
            />
          </div>
        </DialogTrigger>
        <DialogContent className="h-screen min-w-full">
          <div className="relative h-[90vh] w-[85vw]">
            <Image
              src={imgUrls[currentIndex]}
              alt="lot-image"
              fill
              style={{ objectFit: "cover" }}
              sizes={"2000px"}
              className="rounded-md"
              placeholder="blur"
              blurDataURL={
                imgBlurUrls!.length > 0
                  ? imgBlurUrls![currentIndex]!
                  : "/standard-lot-small.jpg"
              }
            />
          </div>
        </DialogContent>
      </Dialog>
      {/* Left Arrow */}
      <div className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] left-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer">
        <ArrowBigLeft
          onClick={() =>
            setCurrentIndex((prevIdx) =>
              prevIdx === 0 ? imgUrls.length - 1 : prevIdx - 1
            )
          }
          size={30}
        />
      </div>
      {/* Right Arrow */}
      <div className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] right-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer">
        <ArrowBigRight
          onClick={() =>
            setCurrentIndex((prevIdx) =>
              prevIdx === imgUrls.length - 1 ? 0 : prevIdx + 1
            )
          }
          size={30}
        />
      </div>
      <div className="flex top-4 justify-center py-2">
        {imgUrls.map((slide, slideIndex) => (
          <div
            key={slideIndex}
            onClick={() => goToSlide(slideIndex)}
            className="text-2xl cursor-pointer"
          >
            {slideIndex === currentIndex ? (
              <Dot size={60} />
            ) : (
              <Dot size={60} className="text-gray-500" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
