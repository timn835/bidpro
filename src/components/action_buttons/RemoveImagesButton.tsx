import { type FormEvent, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { trpc } from "@/app/_trpc/client";
import { type Image as ImageType } from "@/lib/types";
import { Loader2 } from "lucide-react";
import Image from "next/image";

type RemoveImagesButtonProps = {
  images: ImageType[];
  refetch: () => void;
};

const RemoveImagesButton = ({ images, refetch }: RemoveImagesButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) setIsOpen(v);
      }}
    >
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        <Button size="lg" variant="destructive" className="hover:bg-red-100">
          Remove Images
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-y-scroll max-h-screen">
        <RemoveImagesForm
          images={images}
          refetch={refetch}
          setIsOpen={setIsOpen}
        />
      </DialogContent>
    </Dialog>
  );
};

export default RemoveImagesButton;

type RemoveImagesFormProps = {
  images: ImageType[];
  refetch: () => void;
  setIsOpen: (value: boolean) => void;
};

const RemoveImagesForm = ({
  images,
  refetch,
  setIsOpen,
}: RemoveImagesFormProps) => {
  const [serverError, setServerError] = useState("");
  const [selectedIndices, setSelectedIndices] = useState(new Set());
  const { mutate: removeImages, isLoading: areImagesDeleting } =
    trpc.removeImages.useMutation({
      onSuccess: () => {
        refetch();
        setIsOpen(false);
      },
      onError: (err) => {
        setServerError("Something went wrong, please try again.");
      },
    });

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError("");
    removeImages(images.filter((_, idx) => selectedIndices.has(idx)));
  };

  return (
    <div className="w-full mx-auto min-h-[80vh]">
      <form
        onSubmit={(e) => onSubmit(e)}
        className="bg-white rounded px-8 pt-6 pb-8 mb-4 w-full"
      >
        {images.map((image, idx) => (
          <div className="mb-4 flex justify-center" key={image.id}>
            <input
              id="default-checkbox"
              type="checkbox"
              onChange={() =>
                setSelectedIndices((prev) => {
                  const newIndices = new Set(prev);
                  if (prev.has(idx)) newIndices.delete(idx);
                  else newIndices.add(idx);
                  return newIndices;
                })
              }
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="default-checkbox"
              className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              <div className="relative h-36 w-36">
                <Image
                  src={image.imgUrl}
                  alt="auction-image"
                  fill
                  style={{ objectFit: "cover" }}
                  sizes={"200px"}
                  className="rounded-md"
                />
              </div>
            </label>
          </div>
        ))}

        <div className="flex flex-col items-center">
          <h1 className="text-gray-600 mb-4">
            Are you sure you want to remove the selected images?
          </h1>
          <div className="mb-4">
            {serverError && <p className="text-red-500">{serverError}</p>}
          </div>
          <Button variant="destructive" size="lg" className="hover:bg-red-100">
            <div className="w-14 text-[18px]">
              {areImagesDeleting ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              ) : (
                "Remove"
              )}
            </div>
          </Button>
        </div>
      </form>
    </div>
  );
};
