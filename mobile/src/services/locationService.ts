import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  region: string;
  country: string;
  formatted: string;
}

class LocationService {
  private cachedLocation: LocationData | null = null;

  async requestPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.warn('Error requesting location permission:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        return null;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocode to city name
      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      let city = 'Nearby';
      let region = '';
      let country = '';

      if (geocode && geocode.length > 0) {
        const place = geocode[0];
        city = place.city || place.subregion || place.name || 'Nearby';
        region = place.region || '';
        country = place.country || '';
      }

      const formatted = region ? `${city}, ${region}` : city;

      const locationData: LocationData = {
        latitude,
        longitude,
        city,
        region,
        country,
        formatted,
      };

      this.cachedLocation = locationData;
      return locationData;
    } catch (error) {
      console.warn('Error getting location:', error);
      return null;
    }
  }

  getCachedLocation(): LocationData | null {
    return this.cachedLocation;
  }

  calculateDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3958.8; // Radius of the Earth in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export const locationService = new LocationService();
