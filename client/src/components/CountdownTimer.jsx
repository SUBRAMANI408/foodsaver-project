import { useState, useEffect } from 'react';
import { differenceInSeconds } from 'date-fns';

export default function CountdownTimer({ expiryTime }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!expiryTime) return;

    const calculateTimeLeft = () => {
      const diff = differenceInSeconds(new Date(expiryTime), new Date());
      if (diff <= 0) {
        return 'Expired';
      }

      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;

      if (h > 0) {
        return `${h}h ${m}m ${s}s`;
      }
      return `${m}m ${s}s`;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryTime]);

  if (!expiryTime || timeLeft === 'Expired') return null;

  return (
    <span className="font-mono">
      {timeLeft}
    </span>
  );
}
