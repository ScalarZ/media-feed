import React, { useState, useCallback, useMemo } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";
import { getCroppedImg } from "./ImageCropper/CanvasUtils";
import { Label } from "./ui/label";
import NextImage from "./common/Image";
import { useCreatePost } from "@/context/CreatePostProvider";
import useImageUrl from "@/hooks/useImageUrl";

export default function ImageCropper() {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const { postImage, setPostImage, setCropImage } = useCreatePost();
  const imageUrl = useMemo(
    () => (postImage ? URL.createObjectURL(postImage) : ""),
    [postImage]
  );

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const showCroppedImage = useCallback(async () => {
    if (!croppedAreaPixels) return;
    try {
      const croppedImage = await getCroppedImg(
        imageUrl,
        croppedAreaPixels,
        rotation,
        setPostImage
      );
      console.log("donee", { croppedImage });
      setCroppedImage(croppedImage as unknown as string);
      setCropImage();
      onClose();
    } catch (e) {
      console.error(e);
    }
  }, [croppedAreaPixels, rotation]);

  const onClose = useCallback(() => {
    setCroppedImage(null);
  }, []);

  return (
    <div className="h-full max-w-md w-full">
      <div className="p-4 relative grid gap-y-4 z-20">
        <div className="space-y-2">
          <Label>Zoom</Label>
          <Slider
            value={[zoom]}
            min={1}
            max={3}
            step={0.1}
            onValueChange={(values) => setZoom(values[0])}
          />
        </div>
        <div className="space-y-2">
          <Label>Rotation</Label>
          <Slider
            value={[rotation]}
            min={0}
            max={360}
            step={1}
            onValueChange={(values) => setRotation(values[0])}
          />
        </div>
        <div className="grid gap-y-2">
          <Button onClick={showCroppedImage}>Save</Button>
          <Button variant="secondary" onClick={setCropImage}>
            Cancel
          </Button>
        </div>
      </div>
      <Cropper
        image={imageUrl}
        crop={crop}
        rotation={rotation}
        zoom={zoom}
        onCropChange={setCrop}
        onRotationChange={setRotation}
        onCropComplete={onCropComplete}
        onZoomChange={setZoom}
        cropSize={{ width: 448, height: 448 }}
        classes={{
          containerClassName: "h-[448px] w-[448px] bg-gray-200",
        }}
      />
    </div>
  );
}
