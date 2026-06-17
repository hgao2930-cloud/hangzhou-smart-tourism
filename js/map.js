import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import { fromLonLat } from 'ol/proj';
import XYZ from 'ol/source/XYZ.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import OSM from 'ol/source/OSM.js';
import LayerGroup from 'ol/layer/Group';

export const drawSource = new VectorSource()
export const drawLayer = new VectorLayer({
    source: drawSource,
})
const gaode = new TileLayer({
    source: new XYZ({
        url: "https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
    }),
    visible: true
})
const osm = new TileLayer({
    source: new OSM(),
    visible: false
})
const baseLayerGroup = new LayerGroup({
    layers: [gaode, osm]
})

export const map = new Map({
    layers: [baseLayerGroup, drawLayer],
    target: 'map',
    view: new View({
        center: fromLonLat([120.15, 30.28]),
        zoom: 12,
    }),
});

function switchBaseMap(targetLayer) {
    baseLayerGroup.getLayers().forEach(layer => {
        layer.setVisible(layer === targetLayer)
    })
}

const gaodebtn = document.querySelector('#gaode')
const osmbtn = document.querySelector('#osm')
osmbtn.addEventListener('click', function () {
    switchBaseMap(osm)
})
gaodebtn.addEventListener('click', function () {
    switchBaseMap(gaode)
})
