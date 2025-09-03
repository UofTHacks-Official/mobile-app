import { useRef } from 'react';
import { useBottomNavBarStore } from '@/reducers/bottomNavBar';

export const useScrollNavBar = () => {
  const { hideNavBar, showNavBar } = useBottomNavBarStore();
  const lastScrollY = useRef(0);
  const scrollDirection = useRef<'up' | 'down'>('up');

  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDelta = currentScrollY - lastScrollY.current;
    
    // Only trigger if scroll delta is significant enough (prevents jitter)
    if (Math.abs(scrollDelta) > 5) {
      if (scrollDelta > 0 && currentScrollY > 50) {
        // Scrolling down and past threshold
        if (scrollDirection.current !== 'down') {
          scrollDirection.current = 'down';
          hideNavBar();
        }
      } else if (scrollDelta < 0) {
        // Scrolling up
        if (scrollDirection.current !== 'up') {
          scrollDirection.current = 'up';
          showNavBar();
        }
      }
    }
    
    lastScrollY.current = currentScrollY;
  };

  return { handleScroll };
};