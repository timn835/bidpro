import { type FormEvent, useCallback, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { useDropzone } from "react-dropzone";
import { Cloud, File, FileX, Loader2 } from "lucide-react";
import { computeSHA256 } from "@/lib/utils";
import { getSignedURLForLot } from "@/app/dashboard/auctions/actions";
import { useToast } from "../ui/use-toast";

type AddImagesButtonProps = {
  lotId: string;
  auctionId: string;
  numOfImgsRemaining: number;
  refetch: () => void;
};

const AddImagesButton = ({
  lotId,
  auctionId,
  numOfImgsRemaining,
  refetch,
}: AddImagesButtonProps) => {
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
          disabled={numOfImgsRemaining <= 0}
        >
          Add Images
        </Button>
      </DialogTrigger>
      <DialogContent>
        <AddImagesForm
          lotId={lotId}
          auctionId={auctionId}
          numOfImgsRemaining={numOfImgsRemaining}
          refetch={refetch}
          setIsOpen={setIsOpen}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddImagesButton;

type AddImagesFormProps = {
  lotId: string;
  auctionId: string;
  numOfImgsRemaining: number;
  refetch: () => void;
  setIsOpen: (value: boolean) => void;
};

const AddImagesForm = ({
  lotId,
  auctionId,
  numOfImgsRemaining,
  refetch,
  setIsOpen,
}: AddImagesFormProps) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [files, setFiles] = useState<Array<File>>([]);

  const { toast } = useToast();

  const onDrop = useCallback(
    (files: Array<File>) =>
      setFiles((prevFiles) =>
        prevFiles
          .concat(
            files.filter((file) =>
              prevFiles.every((prevFile) => prevFile.name !== file.name)
            )
          )
          .slice(-numOfImgsRemaining)
      ),
    [setFiles, numOfImgsRemaining]
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (files.length === 0) return;

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
          lotId
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
      refetch();
    } catch (error) {
      toast({
        title: "Something went wrong while uploading images",
        description: "Please try again later",
        variant: "destructive",
      });
      setIsUploading(false);
      setIsOpen(false);
      return;
    }
    setIsUploading(false);
    setIsOpen(false);
  };

  return (
    <div className="w-full mx-auto min-h-[60vh] flex flex-col items-top">
      <form
        className="bg-white rounded px-8 pt-6 pb-8 mb-4 w-full"
        onSubmit={handleSubmit}
      >
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
        <div className="mx-auto text-center">
          <Button size="lg" type="submit" disabled={files.length === 0}>
            <div className="w-12 text-[18px]">
              {isUploading ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              ) : (
                "Add"
              )}
            </div>
          </Button>
        </div>
      </form>
    </div>
  );
};
