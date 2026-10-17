import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Camera and Screen sharing vision stream hook for Astra Spatial Viewfinder.
 */
export function useAstraVision() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedFrame, setCapturedFrame] = useState(null);

  // Generate simulated textbook page when real camera is unavailable
  const generateSimulatedFrame = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Dark grid background
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, 800, 500);

    // Textbook page simulation
    ctx.fillStyle = '#18181b';
    ctx.roundRect(100, 40, 600, 420, 16);
    ctx.fill();
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Problem Text
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('Problem 4.2: Work-Kinetic Energy Theorem', 130, 90);

    ctx.fillStyle = '#e4e4e7';
    ctx.font = '16px monospace';
    ctx.fillText('A particle of mass m = 2.0 kg moves along the x-axis', 130, 140);
    ctx.fillText('under the influence of a net force F(x) = 4x N.', 130, 170);
    ctx.fillText('Determine the change in kinetic energy from x = 0 to x = 2 m.', 130, 200);

    // Equation
    ctx.fillStyle = '#818cf8';
    ctx.font = 'italic bold 22px serif';
    ctx.fillText('W_net = ∫ F(x) dx = ΔK', 260, 270);

    // Diagram axis
    ctx.strokeStyle = '#71717a';
    ctx.beginPath();
    ctx.moveTo(150, 400);
    ctx.lineTo(650, 400);
    ctx.moveTo(150, 400);
    ctx.lineTo(150, 310);
    ctx.stroke();

    // Curve
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(150, 400);
    ctx.lineTo(450, 320);
    ctx.stroke();

    return canvas.toDataURL('image/png');
  }, []);

  const startVisionStream = useCallback(async (modality = 'vision') => {
    setCapturedFrame(null);

    try {
      if (navigator.mediaDevices) {
        let stream = null;
        if (modality === 'screen' && navigator.mediaDevices.getDisplayMedia) {
          stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        } else if (navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
          });
        }

        if (stream) {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
          setIsStreaming(true);
          return;
        }
      }
    } catch {
      // Permission denied or unavailable
    }

    // Fallback: simulated capture frame
    setIsStreaming(true);
  }, []);

  const stopVisionStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  const captureFrame = useCallback(() => {
    if (videoRef.current && videoRef.current.videoWidth > 0) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        setCapturedFrame(canvas.toDataURL('image/png'));
        stopVisionStream();
        return;
      }
    }

    // If video not active, use simulated textbook frame
    const fallbackImage = generateSimulatedFrame();
    setCapturedFrame(fallbackImage);
    stopVisionStream();
  }, [stopVisionStream, generateSimulatedFrame]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return {
    videoRef,
    isStreaming,
    capturedFrame,
    startVisionStream,
    stopVisionStream,
    captureFrame
  };
}

export default useAstraVision;
