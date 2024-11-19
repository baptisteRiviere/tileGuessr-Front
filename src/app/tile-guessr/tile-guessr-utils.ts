import { LatLngBounds } from "leaflet";

interface IElemntDimensions {
    height: number,
    width: number
}

export class TileGuessrUtils {
    constructor() { }

    public static computeMinZoom(bounds: LatLngBounds, mapDim: IElemntDimensions) {

        var WORLD_DIM = { height: 256, width: 256 };
        var ZOOM_MAX = 21;

        var ne = bounds.getNorthEast();
        var sw = bounds.getSouthWest();

        var latFraction = (this.latRad(ne.lat) - this.latRad(sw.lat)) / Math.PI;

        var lngDiff = ne.lng - sw.lng;
        var lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;

        var latZoom = this.zoom(mapDim.height, WORLD_DIM.height, latFraction);
        var lngZoom = this.zoom(mapDim.width, WORLD_DIM.width, lngFraction);

        return Math.min(latZoom, lngZoom, ZOOM_MAX);
    }

    private static latRad(lat: number) {
        var sin = Math.sin(lat * Math.PI / 180);
        var radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
        return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
    }

    private static zoom(mapPx: number, worldPx: number, fraction: number) {
        return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
    }
}