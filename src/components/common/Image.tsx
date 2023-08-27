import Image, { ImageLoaderProps, ImageProps } from "next/image";

export default function NextImage(props: ImageProps) {
  return (
    <Image
      loader={({ src }: ImageLoaderProps) => src}
      {...props}
      alt={props.alt}
      unoptimized
    />
  );
}
