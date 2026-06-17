import GeoJSON from 'ol/format/GeoJSON.js';
import { fromCircle } from 'ol/geom/Polygon.js';
import { drawSource } from './map.js';

// 导出绘图
const exportBtn = document.querySelector('#export')
exportBtn.addEventListener('click', () => {
    const features = drawSource.getFeatures();
    if (features.length === 0) {
        alert('当前没有可导出的图形');
        return
    }
    const serializable = features.map(feature => {
        const geom = feature.getGeometry();
        if (geom.getType === 'Circle') {
            const polygon = fromCircle(geom);
            const newFeature = feature.clone();
            newFeature.setGeometry(polygon);
            return newFeature;
        }
        return feature;
    })

    const geojsonStr = new GeoJSON().writeFeatures(serializable, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
    });
    downloadFile('my-drawings.geojson', geojsonStr)
})

function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// 导入数据
const importInput = document.querySelector('#importInput');
importInput.addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        const text = e.target.result;
        try {
            const geojson = JSON.parse(text);
            const features = new GeoJSON().readFeatures(geojson, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            });
            drawSource.addFeatures(features);
        } catch (err) {
            alert('文件格式不正确，无法导入');
            console.error(err);
        }
    };
    reader.readAsText(file);

    importInput.value = '';
})

function debounce(fn, delay) {
    let timer = null;
    return function () {
        clearTimeout(timer)
        timer = setTimeout(fn, delay);
    }
}
// 存数据
export function saveToStorage() {
    const features = drawSource.getFeatures()
    if (features.length === 0) {
        localStorage.removeItem('drawings')
        return
    }
    const serializable = features.map(feature => {
        const geom = feature.getGeometry();
        if (geom.getType() === 'Circle') {
            const polygon = fromCircle(geom);  // Circle → Polygon
            const newFeature = feature.clone();
            newFeature.setGeometry(polygon);
            return newFeature;
        }
        return feature;
    });
    const geojsonStr = new GeoJSON().writeFeatures(serializable, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
    })
    localStorage.setItem('drawings', geojsonStr);
}
// 取出数据
function loadFromStorage() {
    const geojsonStr = localStorage.getItem('drawings');
    if (!geojsonStr) return;
    try {
        const features = new GeoJSON().readFeatures(geojsonStr, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
        })
        drawSource.addFeatures(features);
    }
    catch (err) {
        console.error('localStorage数据损坏，已跳过加载', err)
        localStorage.removeItem('drawings');
    }
}

const debouncedSave = debounce(saveToStorage, 500);
drawSource.on('change', debouncedSave);

loadFromStorage();
