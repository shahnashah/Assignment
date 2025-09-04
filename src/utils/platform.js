import { Capacitor } from '@capacitor/core';

/**
 * Utility to check if the app is running on a native platform (iOS/Android)
 * @returns {boolean} True if running on native platform, false if web/browser
 */
export function isNative() {
  return Capacitor.isNativePlatform();
}

/**
 * Get the current platform name
 * @returns {string} Platform name: 'ios', 'android', or 'web'
 */
export function getPlatform() {
  return Capacitor.getPlatform();
}

/**
 * Check if running in development mode (Next.js dev server)
 * @returns {boolean} True if in development mode
 */
export function isDevelopment() {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if running in a browser environment
 * @returns {boolean} True if in browser
 */
export function isBrowser() {
  return typeof window !== 'undefined' && !Capacitor.isNativePlatform();
}
