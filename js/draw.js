import Draw from 'ol/interaction/Draw.js';
import Select from 'ol/interaction/Select.js';
import Modify from 'ol/interaction/Modify.js';
import { unByKey } from 'ol/Observable.js';
import Style from 'ol/style/Style.js';
import Circle from 'ol/style/Circle.js';
import Fill from 'ol/style/Fill.js';
import Stroke from 'ol/style/Stroke.js';
import { map, drawSource, drawLayer } from './map.js';
import { saveToStorage } from './storage.js';

const typeSelect = document.querySelector('#type')
// 绘图
let draw;
function addInteraction() {
    const value = typeSelect.value;
    if (value !== 'None') {
        draw = new Draw({
            source: drawSource,
            type: typeSelect.value
        });
        map.addInteraction(draw)

        draw.on('drawend', function (event) {
            console.log('geometry:', event.feature.getGeometry());
            console.log('当前source数量:', drawSource.getFeatures().length);
            console.log('画完一个点，当前总数量：', drawSource.getFeatures().length);
            setTimeout(saveToStorage, 0);
        });
    }
}
typeSelect.onchange = function () {
    map.removeInteraction(draw);
    if (modifyInteraction) {
        map.removeInteraction(modifyInteraction);
        unByKey(modifyEndKey)
        modifyInteraction = null;
        modifyEndKey = null;
        editBtn.textContent = '编辑'
    }
    // 新增：移除select
    if (selectInteraction) {
        map.removeInteraction(selectInteraction);
        selectInteraction = null;
    }
    addInteraction();
};
addInteraction();
// 选中要素
export let selectInteraction = null;
const selectStyle = new Style({
    stroke: new Stroke({ color: 'blue', width: 3 }),
    fill: new Fill({ color: 'rgba(0,0,255,0.5)' }),
    image: new Circle({
        radius: 8,
        fill: new Fill({ color: 'blue' }),
        stroke: new Stroke({ color: 'white', width: 2 })
    })
})

function createSelectInteraction() {
    return new Select({
        layers: [drawLayer],
        style: selectStyle
    })
}
const selectBtn = document.querySelector('#select')
selectBtn.addEventListener('click', () => {
    if (selectInteraction) {
        map.removeInteraction(selectInteraction)
    }
    selectInteraction = createSelectInteraction()
    map.addInteraction(selectInteraction)
    console.log('你选中了这个要素')
})

const deleteBtn = document.querySelector('#delete')
deleteBtn.addEventListener('click', () => {
    const selected = selectInteraction.getFeatures()
    if (selected.getLength() === 0) {
        alert('你还没有选中要素')
    }
    selected.forEach(feature => {
        drawSource.removeFeature(feature)
        console.log('你删除了这个要素')
    })
    selected.clear()
})

let modifyInteraction = null;
let modifyEndKey = null;

const editBtn = document.querySelector('#edit');
editBtn.addEventListener('click', function () {
    if (modifyInteraction) {
        map.removeInteraction(modifyInteraction);
        unByKey(modifyEndKey);
        modifyInteraction = null;
        modifyEndKey = null;
        editBtn.textContent = '编辑'
        addInteraction()
    }
    else {
        if (draw) {
            map.removeInteraction(draw)
        }
        // 新增
        if (selectInteraction) {
            map.removeInteraction(selectInteraction);
            selectInteraction = null;
        }
        modifyInteraction = new Modify({ source: drawSource })
        map.addInteraction(modifyInteraction)

        modifyEndKey = modifyInteraction.on('modifyend', function (event) {
            event.features.forEach(feature => {
                console.log('坐标:', feature.getGeometry().getCoordinates());
            });
            console.log('编辑完成，修改的要素：', event.features.getArray());
            saveToStorage();
        })
        editBtn.textContent = '退出编辑'
    }
})