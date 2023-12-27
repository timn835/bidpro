"use client";

import { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type TCreateLotSchema,
  createLotSchema,
  CATEGORIES,
} from "@/lib/types";
import { computeSHA256 } from "@/lib/utils";
import { Cloud, File, FileX, Loader2 } from "lucide-react";
import { Form } from "@/components/ui/form";
import { trpc } from "@/app/_trpc/client";
import { useToast } from "../ui/use-toast";
import { getSignedURLForLot } from "@/app/dashboard/auctions/actions";
import { useDropzone } from "react-dropzone";

type CreateLotButtonProps = {
  auctionId: string;
};

const CreateLotButton = ({ auctionId }: CreateLotButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) setIsOpen(v);
      }}
    >
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        <Button
          size="lg"
          variant="secondary"
          className="bg-emerald-200 hover:bg-emerald-300"
        >
          Add a Lot
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-y-scroll max-h-screen">
        <CreateLotForm auctionId={auctionId} setIsOpen={setIsOpen} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateLotButton;

type CreateLotFormProps = {
  auctionId: string;
  setIsOpen: (value: boolean) => void;
};

function CreateLotForm({ auctionId, setIsOpen }: CreateLotFormProps) {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string>("");
  const [files, setFiles] = useState<Array<File>>([]);
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const onDrop = useCallback(
    (files: Array<File>) =>
      setFiles((prevFiles) =>
        prevFiles
          .concat(
            files.filter((file) =>
              prevFiles.every((prevFile) => prevFile.name !== file.name)
            )
          )
          .slice(-5)
      ),
    [setFiles]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpeg", ".jpg"],
      "image/gif": [".gif"],
      "image/bmp": [".bmp"],
      "image/svg+xml": [".svg"],
    },
  });

  const { mutate: createLot, isLoading: isLotCreating } =
    trpc.createLot.useMutation({
      onSuccess: async (newLot) => {
        if (!files || !files.length) {
          setIsOpen(false);
          return;
        }

        setIsUploading(true);
        try {
          // Create checksums
          const checksums = await Promise.all(
            files.map(async (file) => computeSHA256(file))
          );
          if (!checksums) throw new Error("Error with checksums");

          // Get presigned urls from AWS
          const presignedUrlPromises = files.map((file, idx) => {
            return getSignedURLForLot(
              idx,
              file.type,
              file.size,
              checksums[idx],
              auctionId,
              newLot.id
            );
          });
          const presignedUrls = await Promise.all(presignedUrlPromises);
          if (!presignedUrls.every((urlResult) => urlResult.success))
            throw new Error("Error getting presigned urls");

          // Upload images to S3
          const uploadImagePromises = files.map(async (file, idx) => {
            await fetch(presignedUrls[idx].success!.url, {
              method: "PUT",
              body: file,
              headers: {
                "Content-Type": file.type,
              },
            });
          });
          await Promise.all(uploadImagePromises);
        } catch (error) {
          toast({
            title: "Something went wrong while uploading images",
            description: "Please try again later",
            variant: "destructive",
          });
          setIsUploading(false);
          return;
        }
        utils.getAuctionLots.invalidate();
        setIsUploading(false);
        setIsOpen(false);
      },
      onError: (err) => {
        console.error(err);
        setServerError(
          "Something went wrong while creating the lot, please try again."
        );
      },
    });
  const form = useForm<TCreateLotSchema>({
    resolver: zodResolver(createLotSchema),
  });

  useEffect(() => {
    form.setValue("auctionId", auctionId);
  }, [auctionId, form]);

  const onSubmit = async (data: TCreateLotSchema) => {
    setServerError("");
    createLot(data);
  };

  return (
    <div className="w-full mx-auto min-h-[60vh] flex flex-col items-top">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-white rounded px-8 pt-6 pb-8 mb-4 w-full"
        >
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="title"
            >
              Title
            </label>
            <input
              {...form.register("title")}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="title"
              type="text"
              placeholder="Title"
            />
            {form.formState.errors.title && (
              <p className="text-red-500">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="description"
            >
              Description
            </label>
            <textarea
              {...form.register("description")}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="description"
              placeholder="Describe your product"
            />
            {form.formState.errors.description && (
              <p className="text-red-500">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="description"
            >
              Category
            </label>

            <select
              {...form.register("category")}
              aria-label="Choose a category"
              style={{ maxWidth: "500px" }}
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {form.formState.errors.category && (
              <p className="text-red-500">
                {form.formState.errors.category.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="minBid"
            >
              Minimal Bid
            </label>
            <input
              {...form.register("minBid", { valueAsNumber: true })}
              className="remove-arrow shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="minBid"
              type="number"
              step=".01"
              defaultValue={1.0}
              onBlur={() =>
                form.setValue(
                  "minBid",
                  Number(Number(form.getValues().minBid).toFixed(2))
                )
              }
            />
            {form.formState.errors.minBid && (
              <p className="text-red-500">
                {form.formState.errors.minBid.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <div
              {...getRootProps()}
              className="border min-h-64 m-4 border-dashed border-gray-300 rounded-lg"
            >
              <div className="flex items-center justify-center min-h-full min-w-full">
                <div className="pb-4 flex flex-col items-center justify-center min-w-full min-h-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Cloud className="h-6 w-6 text-zinc-500 mb-2 " />
                    <p className="mb-2 text-sm text-zinc-700">
                      <span className="font-semibold">Click to upload</span> or
                      drag-and-drop
                    </p>
                    <p className="text-xs text-zinc-500">
                      Images in png/jpeg format
                    </p>
                  </div>
                  {files
                    ? files.map((file) => (
                        <div
                          key={file.name}
                          className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline-[1px] outline-zinc-200 divide-x divide-zinc-200"
                        >
                          <div className="px-3 py-2 h-full grid place-items-center">
                            <File className="h-4 w-4 text-blue-500" />
                          </div>
                          <div className="px-3 py-2 h-full text-sm truncate w-40 mx-auto">
                            <div>{file.name}</div>
                          </div>
                          <div
                            className="px-3 py-2 h-full grid place-items-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFiles((prevFiles) =>
                                prevFiles.filter(
                                  (prevFile) => prevFile.name !== file.name
                                )
                              );
                            }}
                          >
                            <FileX className="h-4 w-4 text-red-500" />
                          </div>
                        </div>
                      ))
                    : null}
                  {isLotCreating && !isUploading ? (
                    <div className="w-full mt-4 max-w-xs mx-auto">
                      <div className="flex gap-1 items-center justify-center text-sm text-zinc-700 text-centr pt-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Creating lot...
                      </div>
                    </div>
                  ) : null}
                  {isUploading ? (
                    <div className="w-full mt-4 max-w-xs mx-auto">
                      <div className="flex gap-1 items-center justify-center text-sm text-zinc-700 text-centr pt-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Uploading images...
                      </div>
                    </div>
                  ) : null}
                  <input
                    {...getInputProps}
                    type="file"
                    id="dropzone-file"
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            {serverError && <p className="text-red-500">{serverError}</p>}
          </div>
          <div className="flex items-center">
            <Button size="lg" type="submit">
              <div className="w-12 text-[18px]">
                {isLotCreating || isUploading ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : (
                  "Create"
                )}
              </div>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
