import { useEffect, useState } from 'react';

// Updates CurrentTimeIndicator component
export const useCurrentTime = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date());
    };

    updateTime();

    const timer = setInterval(updateTime, 60000);

    return () => clearInterval(timer);
  }, []);

  return currentTime;
};