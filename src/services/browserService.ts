import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

export const browserService = {
    /**
     * Opens an external URL in an in-app webview (on native) or a new tab (on web).
     * @param url The URL to open
     */
    async openUrl(url: string): Promise<void> {
        try {
            if (Capacitor.isNativePlatform()) {
                await Browser.open({ url });
            } else {
                // Fallback for web
                window.open(url, '_blank', 'noopener,noreferrer');
            }
        } catch (error) {
            console.error('Failed to open URL:', error);
            // Fallback in case the plugin fails
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    },

    /**
     * Closes the in-app webview (if open).
     */
    async close(): Promise<void> {
        if (Capacitor.isNativePlatform()) {
            await Browser.close();
        }
    },
};
