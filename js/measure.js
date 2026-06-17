import { selectInteraction } from './draw.js';
import { getLength, getArea } from 'ol/sphere.js';
import { fromCircle } from 'ol/geom/Polygon.js';

const measure = document.querySelector('#measure');
measure.addEventListener('click', () => {
    const measurementResult = document.querySelector('#measurementResult');
    const selected = selectInteraction.getFeatures();

    if (selected.getLength() === 0) {
        alert('请先选中一个要素');
        return;
    }

    const feature = selected.item(0);
    const geom = feature.getGeometry();
    const type = geom.getType();

    const measureGeom = type === 'Circle' ? fromCircle(geom.clone()) : geom.clone();
    const measureType = measureGeom.getType();

    if (measureType === 'LineString') {
        const length = getLength(measureGeom, { projection: 'EPSG:3857' });
        const km = length / 1000;
        measurementResult.textContent = km < 1
            ? `这段距离是${length.toFixed(1)}米`
            : `这段距离是${km.toFixed(2)}千米`;
    } else if (measureType === 'Polygon') {
        const area = getArea(measureGeom, { projection: 'EPSG:3857' });
        const km2 = area / 1000000;
        measurementResult.textContent = km2 < 1
            ? `这里面积是${area.toFixed(1)}平方米`
            : `这里面积是${km2.toFixed(2)}平方千米`;
    } else {
        measurementResult.textContent = '点类型不支持测量';
    }
});
