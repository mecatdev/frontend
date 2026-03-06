"use client";

import { useEffect, useRef } from "react";

interface WaveProps {
  amplitude: number;
  isActive: boolean;
  frequencies: Float32Array<ArrayBuffer>;
}

const BAR_COUNT = 48;
const SMOOTHING = 0.12;

export function AudioWave({ amplitude, isActive, frequencies }: WaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef({ amplitude, isActive, frequencies });
  const stateRef = useRef({
    bars: new Float32Array(BAR_COUNT),
    color: "hsl(28,100%,50%)",
    dpr: 1,
  });
  const rafRef = useRef<number>(0);

  // keep audio data fresh without restarting the loop
  useEffect(() => {
    audioRef.current = { amplitude, isActive, frequencies };
  }, [amplitude, isActive, frequencies]);

  // stable setup + render loop — runs once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true })!;

    const setup = () => {
      const dpr = window.devicePixelRatio || 1;
      stateRef.current.dpr = dpr;
      const raw = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
      if (raw) {
        const [h, s, l] = raw.split(/\s+/).map(parseFloat);
        stateRef.current.color = `hsl(${h},${s}%,${l}%)`;
      }
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    const ro = new ResizeObserver(setup);
    ro.observe(canvas);
    setup();

    const render = () => {
      const { amplitude: amp, isActive: active, frequencies: freqs } = audioRef.current;
      const { color } = stateRef.current;
      const { width: cw, height: ch } = canvas.getBoundingClientRect();

      ctx.clearRect(0, 0, cw, ch);

      const maxH = ch * 0.82;
      const minH = ch * 0.022;
      const barW = Math.max(3, Math.floor(cw / (BAR_COUNT * 1.55)));
      const gap = Math.max(2, Math.floor(cw / (BAR_COUNT * 3.8)));
      const totalW = BAR_COUNT * (barW + gap) - gap;
      const startX = (cw - totalW) / 2;
      const midY = ch / 2;
      const half = (BAR_COUNT - 1) / 2;

      for (let i = 0; i < BAR_COUNT; i++) {
        const distRatio = Math.abs(i - half) / half;
        // map bar to frequency: center bars = higher freqs, edges = lower
        const freqIdx = Math.floor((1 - distRatio) * Math.min(freqs.length - 1, 80));
        const rawFreq = freqs[freqIdx] ?? -140;

        let target: number;
        if (active) {
          const normalized = Math.max(0, (rawFreq + 140) / 90);
          // taper toward edges so center is loudest
          const taper = 1 - distRatio * 0.45;
          target = Math.max(minH, normalized * maxH * (0.55 + amp * 0.9) * taper);
        } else {
          target = minH + Math.abs(Math.sin(Date.now() * 0.0018 + i * 0.38)) * minH * 1.4;
        }

        stateRef.current.bars[i] += (target - stateRef.current.bars[i]) * SMOOTHING;
        const barH = stateRef.current.bars[i];
        const x = startX + i * (barW + gap);
        const opacity = active
          ? 0.35 + (1 - distRatio) * 0.65
          : 0.18 + (1 - distRatio) * 0.22;

        ctx.globalAlpha = opacity;
        ctx.fillStyle = color;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, midY - barH / 2, barW, barH, barW / 2);
        } else {
          ctx.rect(x, midY - barH / 2, barW, barH);
        }
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" aria-hidden />;
}