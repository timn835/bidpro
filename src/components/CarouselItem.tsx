import Image from "next/image";

type CarouselItemProps = {
  url: string;
  width: string;
  key: string;
};
const CarouselItem = ({ url, width, key }: CarouselItemProps) => {
  return (
    <div key={key} className="carousel-item" style={{ width: width }}>
      <div className="relative h-full w-full">
        <Image
          src={url}
          alt="lot-image"
          fill
          style={{ objectFit: "cover" }}
          sizes={"600px"}
          // objectPosition="top"
          // width={100}
          // height={100}
          className="rounded-md"
        />
      </div>
    </div>
  );
};

export default CarouselItem;
