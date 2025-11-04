"use client";

import { useEffect, useState } from "react";
import {
  getMiniAppFeaturesInfo,
  type MiniAppFeaturesInfo,
} from "@/lib/miniAppFeatures";

/**
 * Hook to access LINE MINI App built-in features information
 *
 * Built-in features that work automatically:
 * - Action button: Appears in header automatically
 * - Multi-tab view: Shows options and recently used services (LINE 15.12.0+)
 * - Channel consent screen: Appears on first use automatically
 *
 * Features accessible via action button menu:
 * - Refresh: Refresh current page
 * - Share: Share current page URL
 * - Add to Home: Add shortcut to home screen (verified MINI Apps, LINE 14.3.0+)
 * - Favorites: Add to favorites (verified MINI Apps, Japan, LINE 15.18.0+)
 * - Minimize browser: Minimize LIFF browser (verified MINI Apps)
 * - Permission settings: Manage camera/microphone permissions (LINE 14.6.0+)
 * - About the service: Show provider page (verified MINI Apps)
 */
export const useMiniAppFeatures = () => {
  const [features, setFeatures] = useState<MiniAppFeaturesInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait a bit for LIFF to initialize
    const checkFeatures = () => {
      const info = getMiniAppFeaturesInfo();
      setFeatures(info);
      setLoading(false);
    };

    // Check immediately
    checkFeatures();

    // Also check after a short delay to ensure LIFF is initialized
    const timer = setTimeout(checkFeatures, 100);

    return () => clearTimeout(timer);
  }, []);

  return {
    features,
    loading,
    /**
     * Check if a specific feature is available
     */
    isFeatureAvailable: (feature: keyof MiniAppFeaturesInfo): boolean => {
      return features?.[feature] ?? false;
    },
  };
};
