import GeoJSON from 'ol/format/GeoJSON.js';
import VectorSource from 'ol/source/Vector.js';
import VectorLayer from 'ol/layer/Vector.js';
import { Overlay } from 'ol';
import Style from 'ol/style/Style.js';
import Icon from 'ol/style/Icon.js';
import Text from 'ol/style/Text.js';
import Fill from 'ol/style/Fill.js';
import Stroke from 'ol/style/Stroke.js';
import { map } from './map.js';

async function getspots() {
    const response = await fetch('./data/spots.json')
    return await response.json()
}
const spotsGeoJSON = await getspots();
const features = new GeoJSON().readFeatures(spotsGeoJSON, {
    dataProjection: 'EPSG:4326',
    featureProjection: 'EPSG:3857'
});

export const spotSource = new VectorSource({
    features: features
});

// 等级 → 颜色映射
const levelColor = {
    '5A': '#ff4d4d',
    '4A': '#ff944d',
    '3A': '#4d79ff'
};

// ============================================================
//  SVG 图钉生成 — 圆形头部 + 尖端朝下
// ============================================================
function createPinSvg(color) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="38" viewBox="0 0 30 38">
  <ellipse cx="15" cy="34.5" rx="6" ry="2" fill="#000" opacity="0.18"/>
  <path d="M15,1 C8,1 2,6.5 2,13 C2,19.5 9,26 15,35 C21,26 28,19.5 28,13 C28,6.5 22,1 15,1 Z"
        fill="${color}" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="15" cy="12" r="4.5" fill="#fff" opacity="0.95"/>
</svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// SVG Data URL 缓存（同色只生成一次）
const pinCache = {};
function getPinUrl(color) {
    if (!pinCache[color]) {
        pinCache[color] = createPinSvg(color);
    }
    return pinCache[color];
}

// ============================================================
//  样式工厂 — 图钉图标
// ============================================================
function createIconStyle(feature, highlight = false) {
    const level = feature.get('level');
    const color = levelColor[level] || '#999';
    const scale = highlight ? 1.5 : 1;

    return new Style({
        image: new Icon({
            src: getPinUrl(color),
            anchor: [0.5, 0.92],
            scale: scale,
            imgSize: [30, 38],
        })
    });
}

// ============================================================
//  样式工厂 — 景点名称文字标注
// ============================================================
function createTextStyle(feature, highlight = false) {
    const name = feature.get('name');
    if (!name) return null;

    return new Style({
        text: new Text({
            text: name,
            font: highlight
                ? 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif'
                : '12px "PingFang SC","Microsoft YaHei",sans-serif',
            fill: new Fill({ color: '#1a1a1a' }),
            stroke: new Stroke({ color: '#ffffff', width: 3 }),
            offsetY: highlight ? -36 : -26,
            textAlign: 'center',
            textBaseline: 'bottom',
        })
    });
}

// ============================================================
//  图层样式函数
// ============================================================
function shouldShowText(resolution) {
    // 地图分辨率 → 近似缩放级别，zoom >= 12 时显示文字
    const zoom = Math.log2(156543.03392804097 / resolution);
    return zoom >= 12;
}

const spotLayerManual = new VectorLayer({
    source: spotSource,
    style: function (feature, resolution) {
        const styles = [createIconStyle(feature)];
        if (shouldShowText(resolution)) {
            const textStyle = createTextStyle(feature);
            if (textStyle) styles.push(textStyle);
        }
        return styles;
    }
});

// 分类筛选
map.addLayer(spotLayerManual);
const hiddenStyle = new Style({});
const filterButtons = document.querySelectorAll('[data-type]');
filterButtons.forEach(btn => {
    btn.addEventListener('click', function () {
        const type = btn.dataset.type;
        const features = spotSource.getFeatures();
        features.forEach(feature => {
            if (type === 'all') {
                feature.setStyle(undefined);
            } else {
                const category = feature.get('category');
                if (type === category) {
                    feature.setStyle(undefined);
                } else {
                    feature.setStyle(hiddenStyle);
                }
            }
        });
    });
});

// 弹窗 Overlay
const popupElement = document.querySelector('#popup');
const overlay = new Overlay({
    element: popupElement,
    offset: [0, -8]
});
map.addOverlay(overlay);

// ============================================================
//  点击高亮样式（导出供 query.js 使用）
// ============================================================
export function clickStyle(feature) {
    return [
        createIconStyle(feature, true),
        createTextStyle(feature, true),
    ].filter(Boolean);
}

// 高亮 & 弹窗逻辑
let currentFeature = null;

const showSpot = function (feature) {
    if (currentFeature) {
        currentFeature.setStyle(undefined);
    }
    if (feature) {
        const coordinate = feature.getGeometry().getCoordinates();
        map.getView().animate({
            center: coordinate,
            duration: 500
        });
        feature.setStyle(clickStyle(feature));
        currentFeature = feature;
        const name = feature.get('name');
        const content = document.querySelector('#popup-content');
        content.innerHTML = `${name}`;
        overlay.setPosition(coordinate);
    } else {
        overlay.setPosition(undefined);
        currentFeature = null;
        console.log('点击了空白处');
        spotSource.getFeatures().forEach(spot => {
            spot.setStyle(undefined);
        });
    }
};

// 点击高亮和弹窗
map.on('singleclick', function (event) {
    const feature = map.forEachFeatureAtPixel(event.pixel, f => f, {
        layerFilter: (layer) => layer === spotLayerManual,
    });
    showSpot(feature);
});

// 搜索定位
const searchInput = document.querySelector('#searchInput');
const searchBtn = document.querySelector('#searchBtn');
searchBtn.addEventListener('click', () => {
    const features = spotSource.getFeatures();
    const keyword = searchInput.value.trim();
    const result = features.find(feature => {
        return feature.get('name') === keyword;
    });
    if (!result) {
        alert('未找到该景点');
        return;
    }
    showSpot(result);
});
