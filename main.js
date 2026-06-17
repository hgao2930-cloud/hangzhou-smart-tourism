import './js/map.js';
import './js/storage.js';
import './js/spots.js';
import './js/draw.js';
import './js/measure.js';
import './js/query.js';

// // 提前定义好两种样式(放在最外层,只创建一次)
// const defaultStyle = new Style({
//     image: new Circle({
//         radius: 6,
//         fill: new Fill({ color: 'rgba(255,100,0,0.8)' })
//     })
// })

// function HoverStyle(feature) {
//     const level = feature.get('level');
//     const levelColor = {
//         '5A': '#ff4d4d',
//         '4A': '#ff944d',
//         '3A': '#4d79ff'
//     };
//     return new Style({
//         image: new Circle({
//             radius: 12,
//             fill: new Fill({ color: levelColor[level] || '#999' }),
//             stroke: new Stroke({ color: 'white', width: 3 })
//         })
//     });
// }

// let hoveredFeature
// map.on('pointermove', function (event) {
//     const feature = map.forEachFeatureAtPixel(event.pixel, f => f)
//     if (feature !== hoveredFeature) {
//         if (hoveredFeature) {
//             hoveredFeature.setStyle(undefined)
//         }
//         if (feature) {
//             feature.setStyle(HoverStyle(feature))
//         }
//         hoveredFeature = feature
//     }
// })