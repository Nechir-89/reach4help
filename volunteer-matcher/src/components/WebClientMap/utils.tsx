import { firestore } from 'firebase';
import moment from 'moment';

// default center
const ANGKOR_WAT = {
  lat: 13.4124693,
  lng: 103.8667,
};

export const secondsToTimestring = (seconds: number) =>
  moment.duration(seconds, 'seconds').humanize();

export const metersToKm = (meters: number) => `${(meters / 1000).toFixed(1)}km`;

export const metersToImperial = (meters: number) =>
  `${(meters * 0.000621371).toFixed(1)}mi`;

export const getCoordsFromProfile = profileState => {
  if (
    profileState &&
    profileState.privilegedInformation &&
    profileState.privilegedInformation.address &&
    profileState.privilegedInformation.address.coords
  ) {
    return {
      lat: profileState.privilegedInformation.address.coords.latitude,
      lng: profileState.privilegedInformation.address.coords.longitude,
    };
  }
  return {
    lat: ANGKOR_WAT.lat,
    lng: ANGKOR_WAT.lng,
  };
};

export const getStreetAddressFromProfile = profileState => {
  if (
    profileState &&
    profileState.privilegedInformation &&
    profileState.privilegedInformation.address
  ) {
    const { address } = profileState.privilegedInformation;
    const { address1, address2, postalCode, city, state, country } = address;
    const undefinedSafe = value => value || '';
    const formattedAddress = `${undefinedSafe(address1)} ${undefinedSafe(
      address2,
    )} ${undefinedSafe(city)} ${undefinedSafe(state)} ${undefinedSafe(
      postalCode,
    )} ${undefinedSafe(country)}`;

    return formattedAddress;
  }
};

export const haversineDistance = (
  latLng1: firestore.GeoPoint,
  latLng2: firestore.GeoPoint,
): number => {
  const lon1 = latLng1.longitude;
  const lon2 = latLng2.longitude;
  const radlat1 = (Math.PI * latLng1.latitude) / 180;
  const radlat2 = (Math.PI * latLng2.latitude) / 180;
  const theta = lon1 - lon2;
  const radtheta = (Math.PI * theta) / 180;
  let dist =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;
  dist *= 1609.344 * 0.000621371; // for miles
  return parseFloat(dist.toFixed(3));
};
