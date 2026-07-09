export function openMap(lat: number, lng: number, label: string): void {
  const coords = `${lat},${lng}`;
  const encodedLabel = encodeURIComponent(label);
  const ua = navigator.userAgent;

  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isMobile = /Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);

  if (isIOS) {
    window.location.href = `maps://?q=${encodedLabel}&ll=${coords}`;
  } else if (isMobile) {
    window.location.href = `geo:${coords}?q=${coords}(${encodedLabel})`;
  } else {
    window.open(`https://www.google.com/maps/search/?api=1&query=${coords}`, '_blank');
  }
}
