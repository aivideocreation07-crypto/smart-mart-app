
// Utility functions for Smart Mart

export const triggerHaptic = () => {
  if (navigator.vibrate) {
    navigator.vibrate(15);
  }
};

export const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; 
  return Number(d.toFixed(1));
};

export const isOpenNow = (openTime?: string, closeTime?: string): boolean => {
  if (!openTime || !closeTime) return true; // Default open if not set
  
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  const [openH, openM] = openTime.split(':').map(Number);
  const [closeH, closeM] = closeTime.split(':').map(Number);
  
  const start = openH * 60 + openM;
  const end = closeH * 60 + closeM;
  
  return currentMinutes >= start && currentMinutes < end;
};

export const formatTimeLeft = (targetDateStr: string, targetTimeStr: string): string | null => {
  // targetDateStr: YYYY-MM-DD, targetTimeStr: HH:MM
  const target = new Date(`${targetDateStr}T${targetTimeStr}`);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  
  if (diff <= 0) return null;
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
};
