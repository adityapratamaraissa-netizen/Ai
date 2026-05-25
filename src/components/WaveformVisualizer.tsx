import React from "react";
import { motion } from "motion/react";

interface WaveformVisualizerProps {
  isActive: boolean;
  color?: string;
}

export default function WaveformVisualizer({ isActive, color = "#00f2fe" }: WaveformVisualizerProps) {
  // Generate beautiful bars that jump up and down to simulate real time voice or audio
  const barCount = 12;

  return (
    <div className="flex items-center justify-center gap-1 h-12 px-4 rounded-2xl bg-slate-950/40 border border-slate-900/60 backdrop-blur-md">
      {Array.from({ length: barCount }).map((_, i) => {
        // Vary the baseline heights and transition durations for organic feel
        const randomHeightMin = i % 2 === 0 ? 10 : 6;
        const randomHeightMax = i % 3 === 0 ? 44 : (i % 2 === 0 ? 32 : 18);
        const duration = 0.5 + Math.random() * 0.7;

        return (
          <motion.div
            key={i}
            className="w-1 rounded-full"
            style={{ backgroundColor: color }}
            animate={
              isActive
                ? { height: [randomHeightMin, randomHeightMax, randomHeightMin] }
                : { height: 6 }
            }
            transition={{
              repeat: Infinity,
              duration,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}
