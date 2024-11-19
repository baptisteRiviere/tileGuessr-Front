import { PathOptions, CircleOptions, PolylineOptions } from 'leaflet';

const RECTANGLE_STYLE: PathOptions = {
    fill: false,
    color: 'red'
}
const FOUNDED_TILE_RECTANGLE_STYLE: PathOptions = {
    color: "#55ff33",
    fill: true,
    fillColor: "#a3ee95",
    opacity: 0.75
}
const NOT_FOUNDED_TILE_RECTANGLE_STYLE: PathOptions = {
    color: "#f88958",
    fill: true,
    fillColor: "#f88958",
    opacity: 0.75
}
const GUESSING_MARKER_OPTIONS: CircleOptions = {
    color: 'blue',
    radius: 8
}
const RESULT_LINE_OPTIONS: PolylineOptions = {
    color: 'gray',
    weight: 3,
    dashArray: '10, 10',
    opacity: .9
}

// default geometriy styles
export const defaultGeometryStyles = {
    rectangle: RECTANGLE_STYLE,
    foundedTileRectangle: FOUNDED_TILE_RECTANGLE_STYLE,
    notFoundedTileRectangle: NOT_FOUNDED_TILE_RECTANGLE_STYLE,
    guessingMarker: GUESSING_MARKER_OPTIONS,
    resultLine: RESULT_LINE_OPTIONS
}

