import { useEffect, useState } from 'react';

export default function AnimatedNumber({ value, prefix = '', duration = 1200 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;
    const startValue = 0;
    
    // Smooth easeOutQuart
    const easeOut = t => 1 - Math.pow(1 - t, 4);

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setDisplayValue(Math.floor(startValue + (value - startValue) * easeOut(progress)));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };
    
    // Add a tiny delay to wait for page load transition
    const timer = setTimeout(() => {
      animationFrame = requestAnimationFrame(step);
    }, 150);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animationFrame);
    };
  }, [value, duration]);

  // Format safely handling large numbers
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(displayValue);

  return <>{prefix}{formatted}</>;
}
