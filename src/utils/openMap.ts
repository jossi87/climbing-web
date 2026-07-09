export function openMap(lat: number, lng: number, label: string): void {
  const coords = `${lat},${lng}`;
  const encodedLabel = encodeURIComponent(label);
  const ua = navigator.userAgent;

  const isAndroid = /Android/i.test(ua);

  if (isAndroid) {
    window.location.href = `geo:0,0?q=${coords}(${encodedLabel})`;
  } else {
    window.open(`https://www.google.com/maps/search/?api=1&query=${coords}`, '_blank');
  }
}
