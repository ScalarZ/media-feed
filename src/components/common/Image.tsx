import Image, { ImageLoaderProps, ImageProps } from "next/image";

export default function NextImage(
  props: ImageProps & { imgref?: React.RefObject<HTMLImageElement> }
) {
  return (
    <Image
      ref={props.imgref}
      loader={({ src }: ImageLoaderProps) => src}
      {...props}
      alt={props.alt}
      unoptimized
    />
  );
}
