"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface AudioAnalyzer {
  isActive: boolean;
  amplitude: number;
  frequencies: Float32Array<ArrayBuffer>;
  error: string | null;
  toggle: () => Promise<void>;
}

const FFT_SIZE = 256;
const SMOOTHING = 0.82;
const FREQ_BANDS = FFT_SIZE / 2;

export function useAudioAnalyzer(): AudioAnalyzer {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amplitudeRef = useRef(0);
  const frequenciesRef = useRef<Float32Array<ArrayBuffer>>(new Float32Array(FREQ_BANDS) as Float32Array<ArrayBuffer>);
  const [, forceRender] = useState(0);

  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const dataRef = useRef<Float32Array<ArrayBuffer>>(new Float32Array(FREQ_BANDS) as Float32Array<ArrayBuffer>);
  const renderTickRef = useRef(0);

  const tick = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    analyser.getFloatFrequencyData(dataRef.current);

    const lowBands = 32;
    let sum = 0;
    for (let i = 0; i < lowBands; i++) {
      sum += Math.max(0, dataRef.current[i] + 140);
    }
    amplitudeRef.current = sum / (lowBands * 140);
      frequenciesRef.current = new Float32Array(dataRef.current) as Float32Array<ArrayBuffer>;
    renderTickRef.current++;
    if (renderTickRef.current % 2 === 0) {
      forceRender((n) => n + 1);
    }

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    sourceRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    ctxRef.current?.close();
    ctxRef.current = null;
    analyserRef.current = null;
    sourceRef.current = null;
    streamRef.current = null;
    amplitudeRef.current = 0;
      frequenciesRef.current = new Float32Array(FREQ_BANDS) as Float32Array<ArrayBuffer>;
    setIsActive(false);
  }, []);

  const toggle = useCallback(async () => {
    if (isActive) {
      stop();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = SMOOTHING;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      ctxRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
      streamRef.current = stream;
      dataRef.current = new Float32Array(analyser.frequencyBinCount) as Float32Array<ArrayBuffer>;

      setError(null);
      setIsActive(true);
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setError("Microphone access denied. Please allow mic permissions in your browser.");
    }
  }, [isActive, stop, tick]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      ctxRef.current?.close();
    };
  }, []);

  return {
    isActive,
    error,
    amplitude: amplitudeRef.current,
    frequencies: frequenciesRef.current,
    toggle,
  };
}
