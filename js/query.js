import { buffer } from 'ol/extent';
import { selectInteraction } from './draw.js';
import { spotSource, clickStyle } from './spots.js';

// 空间查询
const QueryBtn = document.querySelector('#QueryBtn')
QueryBtn.addEventListener('click', () => {
    // console.log('selectInteraction:', selectInteraction);
    // console.log('1. 查询按钮被点击了');

    const spots = spotSource.getFeatures();
    // console.log('2. 景点数量:', spots.length);
    const selected = selectInteraction.getFeatures();
    // console.log('3. 选中要素数量:', selected.getLength());
    if (selected.getLength() === 0) {
        alert('请先选中一个查询范围');
        return;
    }
    const feature = selected.item(0);
    // console.log('4. 选中的要素:', feature);
    const geometry = feature.getGeometry();
    // console.log('5. 几何体类型:', geometry.getType());
    // const extent = geometry.getExtent();
    // // console.log('6. extent:', extent);
    // const buffered = buffer(extent, 500);
    // console.log('7. buffered:', buffered);
    // let count = 0;  // 统计命中数量
    spots.forEach(spot => {
        const pointCoord = spot.getGeometry().getCoordinates();
        let hit = false;

        if (geometry.getType() === 'Polygon' || geometry.getType() === 'Circle') {
            // 面/圆：判断点是否在内部
            const geomToCheck = geometry.getType() === 'Circle'
                ? fromCircle(geometry)
                : geometry;
            hit = geomToCheck.intersectsCoordinate(pointCoord);
        } else if (geometry.getType() === 'LineString') {
            // 线：用extent+buffer判断附近的点
            const buffered = buffer(geometry.getExtent(), 500);
            hit = pointCoord[0] >= buffered[0] && pointCoord[0] <= buffered[2]
                && pointCoord[1] >= buffered[1] && pointCoord[1] <= buffered[3];
        }

        spot.setStyle(hit ? clickStyle(spot) : undefined);
    });
})