/**
 * Extracts one frame from a local video file for preview thumbnails.
 * Returns a JPEG data URL, or undefined if decoding fails (codec/timeout).
 */
export async function captureVideoPosterFrame(file: File): Promise<string | undefined> {
  if (!file.type.startsWith('video/')) return undefined;

  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.preload = 'metadata';

  const cleanup = () => {
    URL.revokeObjectURL(url);
    video.removeAttribute('src');
    video.load();
  };

  try {
    await new Promise<void>((resolve, reject) => {
      const t = window.setTimeout(() => reject(new Error('timeout')), 20000);
      video.onerror = () => {
        clearTimeout(t);
        reject(new Error('video error'));
      };
      video.onloadedmetadata = () => {
        clearTimeout(t);
        resolve();
      };
      video.src = url;
    });

    const duration = video.duration;
    const seekTime = Number.isFinite(duration) && duration > 0 ? Math.min(0.5, Math.max(0.05, duration * 0.02)) : 0.1;
    video.currentTime = seekTime;

    await new Promise<void>((resolve, reject) => {
      const t = window.setTimeout(() => reject(new Error('seek timeout')), 15000);
      video.onseeked = () => {
        clearTimeout(t);
        resolve();
      };
      video.onerror = () => {
        clearTimeout(t);
        reject(new Error('seek error'));
      };
    });

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) {
      cleanup();
      return undefined;
    }

    const canvas = document.createElement('canvas');
    const max = 720;
    const scale = Math.min(1, max / Math.max(w, h));
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      cleanup();
      return undefined;
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
    cleanup();
    return dataUrl;
  } catch {
    cleanup();
    return undefined;
  }
}
