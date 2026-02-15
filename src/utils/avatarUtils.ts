
/**
 * Downloads an SVG image from a URL and converts it to a Data URI (Base64).
 * This ensures the image is stored locally and works offline.
 * 
 * @param url The URL of the avatar image (e.g., DiceBear API)
 * @returns A Promise resolving to the Data URI string
 */
export const downloadAvatarAsDataUri = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch avatar: ${response.statusText}`);
        }

        const blob = await response.blob();

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = reader.result as string;
                resolve(base64data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error downloading avatar:', error);
        // Fallback: return the original URL if download fails, 
        // so at least it works when online.
        return url;
    }
};
