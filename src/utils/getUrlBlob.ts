export async function getUrlBlob(imageUrl: string) {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // Create a File object from the Blob
    const file = new File([blob], blob.type);

    return file;
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
}
