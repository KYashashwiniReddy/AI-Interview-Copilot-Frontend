import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * AudioPulse — Real-time mic amplitude visualizer
 * Accepts `amplitude` (0–100) and animates bar heights accordingly.
 */
export default function AudioPulse({ amplitude = 0, isActive = false, barCount = 20 }) {
  const bars = Array.from({ length: barCount }, (_, i) => {
    // Generate organic-looking heights based on i and amplitude
    const center = barCount / 2;
    const distFromCenter = Math.abs(i - center) / center; // 0 at center, 1 at edges
    const bellCurve = 1 - distFromCenter * 0.6;
    const noise = Math.sin(i * 1.7) * 0.3 + 0.7; // pseudo-random variation
    const height = isActive
      ? Math.max(3, amplitude * bellCurve * noise * 0.8)
      : 3;
    return { id: i, height };
  });

  return (
    <div className="flex items-end justify-center gap-[2px] h-10">
      {bars.map(({ id, height }) => (
        <motion.div
          key={id}
          className="audio-bar rounded-full"
          animate={{
            height: `${isActive ? height + Math.random() * 8 : 3}px`,
            backgroundColor: isActive
              ? height > 30 ? 'rgb(244,63,94)' : height > 15 ? 'rgb(99,102,241)' : 'rgb(6,182,212)'
              : 'rgba(99,102,241,0.3)',
          }}
          transition={{
            height: { duration: 0.1, ease: 'easeOut' },
            backgroundColor: { duration: 0.2 },
          }}
          style={{ width: 3 }}
        />
      ))}
    </div>
  );
}
