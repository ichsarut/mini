/**
 * Utility functions for LINE MINI App built-in features
 *
 * These features are automatically available in LINE MINI App:
 * - Action button (appears automatically in header)
 * - Multi-tab view with Options and Recently used services
 * - Channel consent screen (appears on first use)
 *
 * Documentation: https://developers.line.biz/en/docs/line-mini-app/discover/builtin-features/
 */

import liff from "@line/liff";

/**
 * Check if the app is running in LINE MINI App environment
 * LINE MINI App features are only available when running in LINE app
 */
export const isInMiniApp = (): boolean => {
  if (typeof window === "undefined") return false;
  return liff.isInClient();
};

/**
 * Check if the current LINE version supports multi-tab view
 * Multi-tab view is available in LINE version 15.12.0 or later
 * For older versions, options menu will be shown instead
 */
export const supportsMultiTabView = (): boolean => {
  if (typeof window === "undefined") return false;

  // Try to detect LINE version from user agent
  const userAgent = navigator.userAgent;
  const lineVersionMatch = userAgent.match(/LINE\/(\d+)\.(\d+)\.(\d+)/);

  if (lineVersionMatch) {
    const major = parseInt(lineVersionMatch[1], 10);
    const minor = parseInt(lineVersionMatch[2], 10);

    // LINE 15.12.0 or later
    return major > 15 || (major === 15 && minor >= 12);
  }

  // If we can't detect version, assume it's supported (most users have updated versions)
  return true;
};

/**
 * Get information about available built-in features
 */
export interface MiniAppFeaturesInfo {
  isInMiniApp: boolean;
  supportsMultiTabView: boolean;
  supportsAddToHome: boolean; // Available for verified MINI Apps in LINE 14.3.0+
  supportsFavorites: boolean; // Available for verified MINI Apps in Japan, LINE 15.18.0+
  supportsMinimizeBrowser: boolean; // Available for verified MINI Apps
  supportsPermissionSettings: boolean; // Available in LINE 14.6.0+
}

export const getMiniAppFeaturesInfo = (): MiniAppFeaturesInfo => {
  const inMiniApp = isInMiniApp();

  return {
    isInMiniApp: inMiniApp,
    supportsMultiTabView: inMiniApp ? supportsMultiTabView() : false,
    // These features require verified MINI App status
    // We can't detect this programmatically, so we return true if in LINE app
    // The actual availability depends on verification status in LINE Developers Console
    supportsAddToHome: inMiniApp,
    supportsFavorites: inMiniApp,
    supportsMinimizeBrowser: inMiniApp,
    supportsPermissionSettings: inMiniApp,
  };
};

/**
 * Helper to share current page using built-in Share feature
 * Note: This uses the built-in Share option from action button menu
 * Users need to tap the action button to access Share option
 */
export const shareCurrentPage = (): void => {
  // The Share feature is accessed through the action button menu
  // We can't programmatically trigger it, but we can guide users
  // This function is for documentation purposes
  console.log(
    "To share this page, tap the action button (⋮) in the LINE MINI App header, then select 'Share'"
  );
};

/**
 * Helper to add app to home screen
 * Note: This uses the built-in "Add to Home" option from action button menu
 * Available for verified MINI Apps in LINE 14.3.0 or later
 */
export const addToHomeScreen = (): void => {
  // The Add to Home feature is accessed through the action button menu
  // We can't programmatically trigger it, but we can guide users
  console.log(
    "To add this app to home screen, tap the action button (⋮) in the LINE MINI App header, then select 'Add to Home'"
  );
};

/**
 * Helper to refresh the current page
 * Note: This uses the built-in Refresh option from action button menu
 */
export const refreshPage = (): void => {
  // Built-in refresh uses the action button menu
  // We can also programmatically refresh
  if (typeof window !== "undefined") {
    window.location.reload();
  }
};
