import { ArrowBigLeft, ArrowBigRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type ImageSliderProps = {
  imageUrls: string[];
};

const ImageSlider = ({ imageUrls }: ImageSliderProps) => {
  const [imgIdx, setImgIdx] = useState<number>(0);
  return (
    <div>
      <div className="relative h-80 w-80 mx-auto">
        <Image
          src={imageUrls[imgIdx]}
          alt="image of lot"
          fill
          style={{ objectFit: "cover" }}
          sizes={"800px"}
        />
      </div>

      <button>
        <ArrowBigLeft />
      </button>
      <button>
        <ArrowBigRight />
      </button>
    </div>
  );
};

export default ImageSlider;
