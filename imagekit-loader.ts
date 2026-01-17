import { ImageLoaderProps } from 'next/image';

export default function imageKitLoader({ src, width, quality }: ImageLoaderProps) {
  // If the image is a local file (starts with /), return it as is 
  // or adjust logic if you want local images optimized too.
  if (src.startsWith("/")) return src;

  const urlEndpoint = "https://ik.imagekit.io/ravivariety";
  
  // Logic to strip the Supabase base URL
  const splitKey = "/public/";
  const parts = src.split(splitKey);
  
  let path = src; 
  if (parts.length > 1) {
    path = parts[1];
  }

  const params = [`w-${width}`];
  if (quality) {
    params.push(`q-${quality}`);
  }
  const paramsString = params.join(",");

  return `${urlEndpoint}/${path}?tr=${paramsString}`;
}