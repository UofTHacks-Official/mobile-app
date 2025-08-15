export const getThemeStyles = (isDark: boolean) => ({
  // Background colors
  background: isDark ? "bg-uoft_dark_bg_black" : "bg-uoft_white",
  cardBackground: isDark ? "bg-uoft_dark_mode_bg_light_black" : "bg-white",
  lightCardBackground: isDark ? "bg-uoft_grey_lighter" : "bg-white",
  errorBackground: isDark ? "bg-uoft_grey_light" : "bg-uoft_grey_light",
  
  // Text colors
  primaryText: isDark ? "text-white" : "text-black",
  primaryText1: isDark ? "text-black" : "text-white",
  cardText: isDark ? "text-white" : "text-black",
  secondaryText: isDark ? "text-white" : "text-grey-600",
  secondaryText2: isDark ? "text-white" : "text-gray-400",
  
  
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
  textPrimaryBold: `font-opensans-bold`,
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
  scheduleBackground: isDark ? "bg-[#1A1A1A]" : "bg-[#F9FAFB]",
});

export const getStatusStyles = (status: string) => {
  const normalizedStatus = status.toLowerCase();

  switch (normalizedStatus) {
    case 'completed':
      return {
        backgroundColor: '#dcfce7', 
        borderColor: '#16a34a', 
        textColor: '#15803d', 
      };
    case 'pending':
      return {
        backgroundColor: '#fef3c7', 
        borderColor: '#d97706', 
        textColor: '#b45309', 
      };
    case 'failed':

      return {
        backgroundColor: '#fee2e2', 
        borderColor: '#dc2626', 
        textColor: '#b91c1c', 
      };
    default:
      return {
        backgroundColor: '#f3f4f6', 
        borderColor: '#6b7280', 
        textColor: '#374151', 
      };
  }
};

export const cn = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};