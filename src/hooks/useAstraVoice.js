import { useEffect, useRef, useState, useCallback } from 'react';
import { useAstraStore } from '../store/useAstraStore';

/**
 * Hook for capturing microphone input, managing Web Audio analysis,
 * and driving real-time frequency waveforms for the Astra HUD.
 */
export function useAstraVoice() {
  const { hudState, setHudState, setAudioLevel } = useAstraStore();
  const [hasPermission, setHasPermission] = useState(false);
  const [frequencyBands, setFrequencyBands] = useState([20, 20, 20, 20, 20, 20]);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Group 32 FFT bins into 6 representative frequency bands
  const processFrequencyData = useCallback((dataArray, bufferLength) => {
    const bandSize = Math.floor(bufferLength / 6);
    const bands = [];

    for (let i = 0; i < 6; i++) {
      let sum = 0;
      const start = i * bandSize;
      const end = start + bandSize;
      for (let j = start; j < end; j++) {
        sum += dataArray[j];
      }
      const avg = sum / bandSize;
      // Normalize to 15% - 95% height range
      const scaled = Math.min(95, Math.max(15, Math.round((avg / 255) * 100)));
      bands.push(scaled);
    }

    return bands;
  }, []);

  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate overall audio volume (RMS approximation)
    let total = 0;
    for (let i = 0; i < bufferLength; i++) {
      total += dataArray[i];
    }
    const currentAverage = Math.round((total / bufferLength / 255) * 100);
    setAudioLevel(currentAverage);

    // Compute discrete bands for the 6 HUD waveform bars
    const bands = processFrequencyData(dataArray, bufferLength);
    setFrequencyBands(bands);

    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  }, [processFrequencyData, setAudioLevel]);

  const startListening = async () => {
    try {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      mediaStreamRef.current = stream;
      setHasPermission(true);

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64; // Produces 32 frequency bins
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceNodeRef.current = source;

      setHudState('listening');
      analyzeAudio();
    } catch (err) {
      console.error('Microphone access denied or audio engine initialization failed:', err);
      setHasPermission(false);
      setHudState('idle');
    }
  };

  const stopListening = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setFrequencyBands([20, 20, 20, 20, 20, 20]);
    setAudioLevel(0);
    setHudState('idle');
  }, [setAudioLevel, setHudState]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    hasPermission,
    frequencyBands,
    startListening,
    stopListening,
    isListening: hudState === 'listening'
  };
}

export default useAstraVoice;
