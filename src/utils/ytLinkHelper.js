/**
 * Extracts YouTube video ID from various URL formats
 * @param {string} url - YouTube URL or video ID
 * @returns {string|null} - Extracted video ID or null if invalid
 */
export const extractYoutubeVideoId = (url) => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Trim whitespace
  url = url.trim();

  // If it's already just an ID (11 characters, alphanumeric with dash/underscore)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  // Pattern 1: https://www.youtube.com/watch?v=VIDEO_ID
  // Pattern 2: www.youtube.com/watch?v=VIDEO_ID
  // Pattern 3: youtube.com/watch?v=VIDEO_ID
  // Pattern 4: http://youtube.com/watch?v=VIDEO_ID
  const watchPattern = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/;
  let match = url.match(watchPattern);
  if (match) {
    return match[1];
  }

  // Pattern 5: https://www.youtube.com/shorts/VIDEO_ID
  // Pattern 6: www.youtube.com/shorts/VIDEO_ID
  // Pattern 7: youtube.com/shorts/VIDEO_ID
  const shortsPattern = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/;
  match = url.match(shortsPattern);
  if (match) {
    return match[1];
  }

  // Pattern 8: https://youtu.be/VIDEO_ID
  // Pattern 9: youtu.be/VIDEO_ID
  const shortUrlPattern = /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/;
  match = url.match(shortUrlPattern);
  if (match) {
    return match[1];
  }

  // Pattern 10: https://m.youtube.com/watch?v=VIDEO_ID (mobile)
  const mobilePattern = /(?:https?:\/\/)?m\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/;
  match = url.match(mobilePattern);
  if (match) {
    return match[1];
  }

  return null;
};

/**
 * Validates if the extracted ID is a valid YouTube video ID
 * @param {string} videoId - YouTube video ID
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidYoutubeVideoId = (videoId) => {
  return videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId);
};