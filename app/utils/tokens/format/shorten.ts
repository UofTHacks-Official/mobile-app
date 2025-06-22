/**
 * Shortens a string from both ends and adds "..." in the middle
 * @param str - The string to shorten
 * @param maxLength - Maximum length of the shortened string (default: 50)
 * @param startLength - Number of characters to keep from the start (default: 20)
 * @param endLength - Number of characters to keep from the end (default: 20)
 * @returns The shortened string with "..." in the middle
 */
export function shortenString(
  str: string,
  maxLength: number = 30,
  startLength: number = 10,
  endLength: number = 10
): string {
  // If string is already shorter than maxLength, return as is
  if (str.length <= maxLength) {
    return str;
  }

  // Calculate the actual lengths to use
  const ellipsis = "...";
  const availableLength = maxLength - ellipsis.length;
  
  // Ensure start and end lengths don't exceed available space
  const actualStartLength = Math.min(startLength, Math.floor(availableLength / 2));
  const actualEndLength = Math.min(endLength, availableLength - actualStartLength);

  // Extract start and end portions
  const start = str.substring(0, actualStartLength);
  const end = str.substring(str.length - actualEndLength);

  // Combine with ellipsis
  return `${start}${ellipsis}${end}`;
}
