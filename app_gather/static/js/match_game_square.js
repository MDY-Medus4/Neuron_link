const imageContainer = document.getElementById('imageContainer');
const optionsContainer = document.getElementById('optionsContainer');

let loop = 40;
let loop_count = 1;
let right_count = 0;
let is_Listening = true
let mark_save = [];
let flag = 0;

// 获取按钮元素
const startListeningButton = document.getElementById('startListeningButton');

function updateImages() {
    optionsContainer.innerHTML = ''; // 清空备选图片容器
    const optionImage = createImageElement('/static/img/hint/nothing.png', '空白', 'optionImage');
    optionsContainer.appendChild(optionImage);
    imageContainer.innerHTML = ''; // 清空左侧图片容器
    const leftImage = createImageElement('/static/img/hint/REST.png', '休息', 'leftImage');
    imageContainer.appendChild(leftImage);
    is_Listening = false
    setTimeout(() => {
        console.log('休息2秒');
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
        otherLeftImg.setAttribute('angle', mergedData[randomId][leftImageIndex].rotate_angle)

        // 随机选择level个不同 id 下的图片作为备选图片
        const otherIds = getRandomIds(Object.keys(mergedData), level, randomId);

        // 修复 getRandomIds，排除左侧图片的 id
        const insertIndex = Math.floor(Math.random() * (otherIds.length + 1));
        otherIds.splice(insertIndex, 0, 'leftImage');

        optionsContainer.innerHTML = ''; // 清空备选图片容器
        let i = 0
        otherIds.forEach(id => {
            if (id === 'leftImage') {
                if (i === 0) {
                    otherLeftImg.classList.add('selected');
                    i += 1;
                }
                optionsContainer.appendChild(otherLeftImg);
            } else {
                const randomImageIndex = Math.floor(Math.random() * mergedData[id].length);
                const randomImagePath = mergedData[id][randomImageIndex].pic;
                const optionImage = createImageElement(randomImagePath, `备选 - ${id}`, id);
                optionImage.setAttribute('angle', mergedData[randomId][leftImageIndex].rotate_angle)
                // 添加点击事件
                if (i === 0) {
                    optionImage.classList.add('selected');
                    i += 1;
                }
                optionsContainer.appendChild(optionImage);

                // optionsContainer.appendChild(createImageElement("/static/img/colorful_processed/drawing_1.png", `备选 - ${2}`, 2));
            }

        });
        setTimeout(() => {
            is_Listening = true;
            },500);
        
    }, 2000);
    



}

// 初始更新图片
updateImages();
// 记录游戏开始时的mark下标
let type = "onset";
let StimulusOnsetIndex;
let StimulusOffsetIndex;
let trial_data = {
    'Trial': loop_count,
    'correct': -1,
    'StimulusOnsetIndex': StimulusOnsetIndex,
    'StimulusOffsetIndex': StimulusOffsetIndex,
    'rotate_angle': 0,
}
//拿数据更新trail
// fetchOnIndex();
//zlm
index_on_record()
// while(!flag){
// }


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
    const imageElement = document.getElementById("rImage");
    if (type === 0) {
        imageElement.src = "/static/img/hint/right.png";
    } else {
        imageElement.src = "/static/img/hint/false.png";
        // imageElement.classList.add("l_highlight");
    }
    // 显示图片
    imageElement.style.display = "block";


    // 2秒后移除高亮效果
    setTimeout(() => {
        imageElement.style.display = "none";
        imageElement.classList.remove("highlight");
    }, 1000); // 2000毫秒 = 2秒

}

function updateCircleBar(circleBar, progress, last) {
    circleBar.style.setProperty("--progress", progress);
    console.log("progress:", progress);
    circleBar.style.setProperty("--last", last);
    circleBar.dataset.progress = progress;
}

// function update_para(bar, progressElement, circle_bar){
//     updateCircleBar(circle_bar, Math.round(((loop - (loop_count - right_count)) / loop) * 100) + "%", 100 - Math.round(((loop - (loop_count - right_count)) / loop) * 100) + "%")
//     const result = Math.round((loop_count / loop) * 100);
//     bar.style.width = result + "%";
//     progressElement.textContent = result + "%";
//     loop_count++;
// }


window.onload = function () {
    let currentOptionIndex = 0; // 记录当前选中的选项索引
    const bar = document.getElementById('bar')
    const progressElement = document.querySelector(".progress-value");
    const circle_bar = document.getElementById("circle_bar")


    //按钮点击事件
    function handleOptionClick(event, option) {
        console.log("choose:", option.dataset.index)
        let check = true
        if (loop_count > loop) {
            // 显示重新开始按钮
            toggleListening();
            const restartButton = document.getElementById('restartButton');
            const endButton = document.getElementById('endButton');
            // window.location.href = `/game/end?right_count=${right_count}`;
            restartButton.style.display = 'inline-block';
            endButton.style.display = 'none';
            alert("游戏已结束！！！");
            index_save()
            startListeningButton.style.display = 'none';
            is_Listening = false
        }
        if (option.dataset.index === "leftImage") {
            // alert('正确！你找到了匹配的图片。');
            right_count++;
            showFeedback(0)
        } else {
            // alert('错误！请再试一次。');
            showFeedback(1)
            check = false
        }
        // 记录刺激结束时间
        // 记录刺激结束时间并push trail
        //zlm
        index_off_record(check, option, StimulusOnsetIndex);
       
        // updateImages();
        // StimulusOnsetIndex = index_record();
        // 记录刺激开始时间
        //zlm
        // while(!flag)

        updateCircleBar(circle_bar, Math.round(((loop - (loop_count - right_count)) / loop) * 100) + "%", 100 - Math.round(((loop - (loop_count - right_count)) / loop) * 100) + "%")
        const result = Math.round((loop_count / loop) * 100);
        bar.style.width = result + "%";
        progressElement.textContent = result + "%";
        // loop_count++;

    }

    // 监听键盘事件
    document.addEventListener('keydown', (event) => {
        if (is_Listening) {
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
                currentOptionIndex = 0;
            }

            // 更新选中状态
            options.forEach((option, index) => {
                option.classList.toggle('selected', index === currentOptionIndex);
            });
        }


    });

// 切换监听状态的函数
    function toggleListening() {
        is_Listening = !is_Listening;
        startListeningButton.textContent = is_Listening ? '暂停' : '继续';
        if (startListeningButton.textContent === '继续') {
            StimulusOnsetIndex = index_on_record()
        }
        console.log(`键盘监听已${is_Listening ? '启动' : '停止'}`);
    }

// 绑定按钮点击事件到切换监听状态的函数
    startListeningButton.addEventListener('click', toggleListening);

}

// 脑电mark
async function index_on_record() {
    try {
        const response = await fetch('/eeg/index/record', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'), // 替换为你的CSRF令牌获取方式
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(' onset Backend tool response:', data);
        StimulusOnsetIndex = data.eeg_index;
        // update_para()
        return data // 返回数据给调用者

    } catch (error) {
        console.error('EEG数据获取失败', error);
        throw error; // 抛出错误给调用者
    }
}


async function index_off_record(check, option, OnsetIndex) {
    try {
        const response = await fetch('/eeg/index/record', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'), // 替换为你的CSRF令牌获取方式
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('offset Backend tool response:', data);
        const trial_data = {
            'Trial': loop_count,
            'correct': check,
            'StimulusOnsetIndex': OnsetIndex,
            'StimulusOffsetIndex': data.eeg_index,
            'rotate_angle': option.getAttribute('angle'),
        }
        mark_save.push(trial_data);
        updateImages();
        loop_count++;
        index_on_record();
        return data // 返回数据给调用者

    } catch (error) {
        console.error('EEG数据获取失败', error);
        throw error; // 抛出错误给调用者
    }
}

// 脑电mark保存
function index_save() {
    fetch('/eeg/index/save', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'), // 替换为你的CSRF令牌获取方式
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "mark_save": mark_save,
            "name": name,
            "exp_name": exp,
            "session": session
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log('Backend tool response:', data);
            // 在这里处理后台工具类的响应
        })
        .catch(error => {
            // console.error('Error calling backend tool:', error);
        });
}


// 辅助函数，用于获取cookie
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

document.getElementById('endButton').addEventListener('click', function () {
    fetch('/eeg/index/save', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'), // CSRF令牌，从cookie中获取
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "mark_save": mark_save,
            "name": name,
            "exp_name": exp,
            "session": session
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log(data); // 处理返回的数据
        });
});

