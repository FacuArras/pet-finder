import * as mapboxgl from "mapbox-gl";
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

mapboxgl.accessToken = MAPBOX_TOKEN;

export { mapboxgl };