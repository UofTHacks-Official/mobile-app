import type { HackerProfile } from "@/requests/hacker";

/**
 * Gets the display name for a hacker, preferring preferred_name if available
 * Handles cases where preferred_name might include the last name
 */
export const getDisplayName = (hacker: HackerProfile): string => {
  const first = hacker.hacker_fname || "";
  const last = hacker.hacker_lname || "";
  const preferred = hacker.preferred_name?.trim() || "";

  if (!preferred) {
    return `${first} ${last}`.trim();
  }

  // Check if last name is part of preferred name
  const preferredNameLower = preferred.toLowerCase();
  const lastNameLower = last.toLowerCase();

  if (lastNameLower && preferredNameLower.includes(lastNameLower)) {
    // Remove last name from preferred name
    let cleanedPreferredName = preferred;

    // Try removing from the end first (most common case)
    if (preferredNameLower.endsWith(lastNameLower)) {
      cleanedPreferredName = preferred
        .slice(0, preferred.length - last.length)
        .trim();
    } else if (preferredNameLower.startsWith(lastNameLower)) {
      // Remove from the beginning
      cleanedPreferredName = preferred.slice(last.length).trim();
    } else {
      // Remove from anywhere in the middle
      const index = preferredNameLower.indexOf(lastNameLower);
      if (index !== -1) {
        cleanedPreferredName = (
          preferred.slice(0, index) + preferred.slice(index + last.length)
        ).trim();
      }
    }

    return `${cleanedPreferredName} ${last}`.trim();
  }

  return `${preferred} ${last}`.trim();
};

/**
 * Extracts year from a date string
 * Handles various date formats and returns the year as a string
 */
export const getYear = (dateString: string | null | undefined): string => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.getFullYear().toString();
    }
  } catch (error) {
    // Fall through to regex matching
  }

  // Try regex match for year
  const yearMatch = dateString.match(/\d{4}/);
  return yearMatch ? yearMatch[0] : dateString;
};

/**
 * Formats a date range for job experience
 * @param start Start date string
 * @param end End date string (optional - if null/undefined, shows "Present")
 * @returns Formatted date range like "2020 - 2023" or "2020 - Present"
 */
export const formatDateRange = (start: string, end?: string | null): string => {
  const startYear = getYear(start);
  const endYear = end ? getYear(end) : "Present";
  return `${startYear} - ${endYear}`;
};

/**
 * Normalizes a URL by ensuring it has a protocol
 * @param url URL string that may or may not have a protocol
 * @returns Normalized URL with https:// protocol
 */
export const normalizeUrl = (url: string): string => {
  if (!url) return "";

  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return `https://${trimmed}`;
};

/**
 * Formats a GitHub URL and extracts the username
 * @param url GitHub URL in various formats
 * @returns Object with formatted URL and username
 */
export const formatGitHubUrl = (
  url: string
): { url: string; username: string } => {
  if (!url) return { url: "", username: "" };

  const normalized = normalizeUrl(url);
  const match = normalized.match(
    /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/\s]+)/
  );

  return {
    url: normalized.startsWith("http") ? normalized : normalizeUrl(url),
    username: match?.[1] ? `@${match[1]}` : url,
  };
};

/**
 * Formats a LinkedIn URL and extracts the username
 * @param url LinkedIn URL in various formats
 * @returns Object with formatted URL and username
 */
export const formatLinkedInUrl = (
  url: string
): { url: string; username: string } => {
  if (!url) return { url: "", username: "" };

  const normalized = normalizeUrl(url);
  const match = normalized.match(
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([^\/\s?]+)/
  );

  return {
    url: normalized.startsWith("http") ? normalized : normalizeUrl(url),
    username: match?.[1] ? `@${match[1]}` : url,
  };
};

/**
 * Formats an Instagram URL and extracts the username
 * @param url Instagram URL in various formats (URL or @username)
 * @returns Object with formatted URL and username
 */
export const formatInstagramUrl = (
  url: string
): { url: string; username: string } => {
  if (!url) return { url: "", username: "" };

  // Check if it's already a full URL
  if (url.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\//)) {
    const match = url.match(
      /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([^\/\s?]+)/
    );
    const username = match?.[1] ? `@${match[1]}` : url;
    return {
      url: normalizeUrl(url),
      username,
    };
  }

  // Handle @username or username format
  const cleanUsername = url.replace(/^@/, "");
  return {
    url: `https://instagram.com/${cleanUsername}`,
    username: `@${cleanUsername}`,
  };
};

/**
 * Formats an X/Twitter URL and extracts the username
 * @param url X/Twitter URL in various formats (URL or @username)
 * @returns Object with formatted URL and username
 */
export const formatXUrl = (url: string): { url: string; username: string } => {
  if (!url) return { url: "", username: "" };

  // Check if it's already a full URL
  if (url.match(/(?:https?:\/\/)?(?:www\.)?(x\.com|twitter\.com)\//)) {
    const match = url.match(
      /(?:https?:\/\/)?(?:www\.)?(?:x\.com|twitter\.com)\/([^\/\s?]+)/
    );
    const username = match?.[1] ? `@${match[1]}` : url;
    // Normalize to x.com
    const normalizedUrl = normalizeUrl(url).replace("twitter.com", "x.com");
    return {
      url: normalizedUrl,
      username,
    };
  }

  // Handle @username or username format
  const cleanUsername = url.replace(/^@/, "");
  return {
    url: `https://x.com/${cleanUsername}`,
    username: `@${cleanUsername}`,
  };
};
