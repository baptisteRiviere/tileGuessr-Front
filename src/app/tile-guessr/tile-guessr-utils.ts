import { LatLngBounds } from "leaflet";

interface IElemntDimensions {
    height: number,
    width: number
}

export class TileGuessrUtils {
    constructor() { }

    public static computeMinZoom(bounds: LatLngBounds, mapDim: IElemntDimensions) {

        const WORLD_DIM = { height: 256, width: 256 };
        const ZOOM_MAX = 21;

        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();

        const latFraction = (this.latRad(ne.lat) - this.latRad(sw.lat)) / Math.PI;

        const lngDiff = ne.lng - sw.lng;
        const lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;

        const latZoom = this.zoom(mapDim.height, WORLD_DIM.height, latFraction);
        const lngZoom = this.zoom(mapDim.width, WORLD_DIM.width, lngFraction);

        const computedMaxZoom = Math.min(latZoom, lngZoom)

        return Math.min(computedMaxZoom, ZOOM_MAX);
    }

    private static latRad(lat: number) {
        const sin = Math.sin(lat * Math.PI / 180);
        const radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
        return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
    }

    private static zoom(mapPx: number, worldPx: number, fraction: number) {
        return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
    }
}