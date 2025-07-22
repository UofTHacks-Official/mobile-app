export const getThemeStyles = (isDark: boolean) => ({
  // Background colors
  background: isDark ? "bg-uoft_dark_bg_black" : "bg-uoft_white",
  cardBackground: isDark ? "bg-uoft_dark_mode_bg_light_black" : "bg-white",
  lightCardBackground: isDark ? "bg-uoft_grey_lighter" : "bg-white",
  errorBackground: isDark ? "bg-uoft_grey_light" : "bg-uoft_grey_light",
  
  // Text colors
  primaryText: isDark ? "text-white" : "text-black",
  cardText: isDark ? "text-white" : "text-black",
  secondaryText: isDark ? "text-white" : "text-uoft_dark_mode_bg_light_black",
  
  // Icon colors
  iconColor: isDark ? "#FFF" : "#000",
  
  // Theme toggle specific styles
  toggleButtonBackground: isDark ? "bg-uoft_grey_light" : "bg-uoft_grey_lighter",

  

  toggleButtonSelected: "bg-uoft_primary_blue",
  toggleButtonText: isDark ? "text-uoft_black" : "text-black",
  toggleButtonSelectedText: "text-black",
  
  // Bottom nav bar specific styles
  navBarBackground: isDark ? "bg-uoft_dark_mode_bg_light_black" : "bg-navBar",
  navBarSelectedBackground: isDark ? "bg-uoft_dark_bg_black" : "bg-navBar1",
  navBarText: isDark ? "text-white" : "text-white",
  navBarIconActive: isDark ? "white" : "white",
  navBarIconInactive: isDark ? "#A0A0A0" : "#BFBDBE",
  
  // Common styles
  cardStyle: `w-full p-4 px-6 rounded-sm`,
  textPrimary: `font-opensans-medium`,
  textSecondary: `font-opensans`,

  hackerBucksKeyboard: isDark ? "bg-uoft_dark_mode_text" : "bg-white"

});

export const getScheduleThemeStyles = (isDark: boolean) => ({
  // Schedule-specific dark theme colors
  headerBackground: isDark ? "bg-[#1A1A1A]" : "bg-gray-50",
  timeBlockBackground: isDark ? "bg-[#262626]" : "bg-white",
  lineColor: isDark ? "#3B3B3B" : "#E5E7EB",
  
  // Text colors for schedule
  headerText: isDark ? "text-white" : "text-black",
  timeText: isDark ? "text-white" : "text-gray-600",
  primaryText: isDark ? "text-white" : "text-black",
  secondaryText: isDark ? "text-white" : "text-gray-600",
  
  // Icon colors
  iconColor: isDark ? "#FFFFFF" : "#333333",
  
  // Background for main schedule area
  scheduleBackground: isDark ? "bg-[#1A1A1A]" : "bg-white",
});

// For hackerbucks status colors
export const getStatusStyles = (status: string) => {
  const normalizedStatus = status.toLowerCase();

  switch (normalizedStatus) {
    case 'completed':
      return {
        backgroundColor: '#dcfce7', // green-100
        borderColor: '#16a34a', // green-600
        textColor: '#15803d', // green-700
      };
    case 'pending':
      return {
        backgroundColor: '#fef3c7', // yellow-100
        borderColor: '#d97706', // yellow-600
        textColor: '#b45309', // yellow-700
      };
    case 'failed':

      return {
        backgroundColor: '#fee2e2', // red-100
        borderColor: '#dc2626', // red-600
        textColor: '#b91c1c', // red-700
      };
    default:
      return {
        backgroundColor: '#f3f4f6', // gray-100
        borderColor: '#6b7280', // gray-500
        textColor: '#374151', // gray-700
      };
  }
};

export const cn = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};