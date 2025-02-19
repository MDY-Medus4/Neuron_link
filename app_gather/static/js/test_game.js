const imageContainer = document.getElementById('imageContainer');
const optionsContainer = document.getElementById('optionsContainer');

let loop = 40;
let loop_count = 1;
let right_count = 0;


function updateImages() {
    // 随机选择一个 id
    const randomId = getRandomId(Object.keys(mergedData));
    // 随机选择左侧图片
    const leftImageIndex = Math.floor(Math.random() * mergedData[randomId].length);
    const leftImagePath = mergedData[randomId][leftImageIndex].pic;
    const leftImage = createImageElement(leftImagePath, '左边的图片', 'leftImage');
    imageContainer.innerHTML = ''; // 清空左侧图片容器
    imageContainer.appendChild(leftImage);
    // 从左侧图片ID中随机选取其它图片
    const otherLeftIndex = getRandomIndex(mergedData[randomId].length, leftImageIndex);
    const otherLeftImagePath = mergedData[randomId][otherLeftIndex].pic;
    const otherLeftImg = createImageElement(otherLeftImagePath, '左边的图片', 'leftImage');

    // 随机选择3个不同 id 下的图片作为备选图片
    const otherIds = getRandomIds(Object.keys(mergedData), 3, randomId);

    // 修复 getRandomIds，排除左侧图片的 id
    const insertIndex = Math.floor(Math.random() * (otherIds.length + 1));
    otherIds.splice(insertIndex, 0, 'leftImage');

    optionsContainer.innerHTML = ''; // 清空备选图片容器

    otherIds.forEach(id => {
        if (id === 'leftImage') {
            optionsContainer.appendChild(otherLeftImg);
        } else {
            const randomImageIndex = Math.floor(Math.random() * mergedData[id].length);
            const randomImagePath = mergedData[id][randomImageIndex].pic;
            const optionImage = createImageElement(randomImagePath, `备选 - ${id}`, id);
            // 添加点击事件
            optionsContainer.appendChild(optionImage);
            // optionsContainer.appendChild(createImageElement("/static/img/colorful_processed/drawing_1.png", `备选 - ${2}`, 2));
        }
    });

}

// 初始更新图片
updateImages();


// 生成一个list 范围为从0到length, 元素为整形,生成后删除和excludeIndex相同的元素
function getRandomIndex(length, excludeIndex) {
    // 生成范围为0到length-1的数组
    const indexArray = Array.from({length}, (_, index) => index);
    const shuffledIndex = indexArray.filter(id => id !== excludeIndex).sort(() => 0.5 - Math.random());
    return shuffledIndex[0]
}


function getRandomIds(ids, count, excludeId) {
    const shuffledIds = ids.filter(id => id !== excludeId).sort(() => 0.5 - Math.random());
    return shuffledIds.slice(0, count);
}

function getRandomId(ids) {
    return ids[Math.floor(Math.random() * ids.length)];
}

function createImageElement(src, alt, dataIndex) {
    const image = document.createElement('img');
    image.src = src;
    image.alt = alt;
    image.className = 'option';

    // 设置 dataset.index 只有在提供 dataIndex 参数时才设置
    if (dataIndex) {
        image.dataset.index = dataIndex;
    }

    return image;
}

function showFeedback(type) {
    let imageElement;

    if (type === 0) {
        imageElement = document.getElementById("rImage");
    } else {
        imageElement = document.getElementById("lImage");
    }
    // 显示图片
    imageElement.style.display = "block";

    // 等待3秒后隐藏图片
    setTimeout(function () {
        imageElement.style.display = "none";
    }, 1000);
}

function updateCircleBar(circleBar, progress, last){
    circleBar.style.setProperty("--progress", progress);
    console.log("progress:",progress);
    circleBar.style.setProperty("--last", last);
}


window.onload = function () {
    let currentOptionIndex = 0; // 记录当前选中的选项索引
    const bar = document.getElementById('bar')
    const progressElement = document.querySelector(".progress-value");
    const circle_bar = document.getElementById("circle_bar")

    //按钮点击事件
    function handleOptionClick(event, option) {

        if (loop_count >= loop) {
            window.location.href = `/game/end?right_count=${right_count}`;
        }
        if (option.dataset.index === "leftImage") {
            // alert('正确！你找到了匹配的图片。');
            right_count++;
            showFeedback(0)
            updateCircleBar(circle_bar, Math.round((right_count / loop) * 100)+"%", 100-Math.round((right_count / loop) * 100)+"%")
            updateImages(); // 点击正确后更新图片，开始新一轮
        } else {
            // alert('错误！请再试一次。');
            showFeedback(1)
            updateImages(); // 错误也开始新的一轮
        }
        const result = Math.round((loop_count / loop) * 100);
        bar.style.width = result + "%";
        progressElement.textContent = result + "%";
        loop_count++;
    }

    // 监听键盘事件
    document.addEventListener('keydown', (event) => {
        const key = event.key;
        const options = optionsContainer.querySelectorAll('.option');

        if (key === 'ArrowLeft') {
            // 左箭头键，移动到前一个选项
            currentOptionIndex = (currentOptionIndex - 1 + options.length) % options.length;
        } else if (key === 'ArrowRight') {
            // 右箭头键，移动到下一个选项
            currentOptionIndex = (currentOptionIndex + 1) % options.length;
        } else if (key === 'Enter') {
            // 回车键，触发点击事件
            const selectedOption = options[currentOptionIndex];
            // console.log('Key pressed globally:', selectedOption.dataset.index);
            handleOptionClick(null, selectedOption);
        }

        // 更新选中状态
        options.forEach((option, index) => {
            option.classList.toggle('selected', index === currentOptionIndex);
        });
    });
}