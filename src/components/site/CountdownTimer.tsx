import { useEffect, useState } from "react";
import { eventConfig } from "@/config/event";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(eventConfig.startDate).getTime() - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, []);

  const items = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <div className="w-full">
      <p className="eyebrow text-copper font-bold">Event Countdown</p>
      <div className="mt-3 grid grid-cols-4 gap-2 sm:gap-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center justify-center rounded-md border border-border bg-card p-3 text-center shadow-xs"
          >
            <span className="text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {String(item.value).padStart(2, "0")}
            </span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
