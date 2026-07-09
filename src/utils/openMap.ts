export function openMap(lat: number, lng: number, label: string): void {
  const coords = `${lat},${lng}`;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (isMobile) {
    window.location.href = `geo:${coords}?q=${coords}(${encodeURIComponent(label)})`;
  } else {
    window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`, '_blank');
  }
}
