const wordContainer = document.getElementById('leftWord');
const optionsContainer = document.getElementById('optionsContainer');

let loop = 40; // 总共的试次
let loop_count = 0; // 当前试次
let is_Listening = true; // 是否监听键盘
let mark_save = []; // 标签数据
let items = Object.keys(mergedData); // 获取类别
let randomId; // 存储正确答案
let ans; // 病人的回答
let totalScore = 0; // 病人得分
let gameStage = 1; // 游戏阶段，1 为“语音文字”游戏，2 为“语音图片”游戏
let taskType = 'speechImagery'; // 当前任务类型，默认是“言语想象”任务

// 暂停/继续按钮
const startListeningButton = document.getElementById('startListeningButton');

// 阻塞等待时间 (ms)
function sleep(time) {
    var timeStamp = new Date().getTime();
    var endTime = timeStamp + time;
    while (true) {
        if (new Date().getTime() > endTime) {
            break;
        }
    }
}

// 获取随机项
function getRandomId(ids) {
    return ids[Math.floor(Math.random() * ids.length)];
}

// 获取多个随机项，排除某个 id
function getRandomIds(ids, count, excludeId) {
    const filteredIds = ids.filter(id => id !== excludeId);
    const result = [];
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * filteredIds.length);
        result.push(filteredIds[randomIndex]);
    }
    return result;
}

// 创建图片元素
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

// 更新图片内容，根据当前游戏阶段展示不同内容
function updatePicture() {
    wordContainer.textContent = '休息';
    optionsContainer.innerHTML = '';
    setTimeout(() => {
        if (gameStage === 1) {
            // 语音文字游戏
            randomId = getRandomId(items);
            wordContainer.textContent = mergedData[randomId].Chinese;

            const otherIds = getRandomIds(items, level, randomId);
            const allIds = [randomId, ...otherIds];
            allIds.sort(() => 0.5 - Math.random());
            optionsContainer.innerHTML = ''; // 清空备选图片容器

            let i = 0;
            for (const id of allIds) {
                const Option = getRandomId(mergedData[id].pictures);
                const OptionPath = Option.picture;
                const optionImage = createImageElement(OptionPath, `${mergedData[id].Chinese}`, id);
                if (i === 0) {
                    optionImage.classList.add('selected');
                }
                i++;
                optionsContainer.appendChild(optionImage);
            }

            // 根据任务类型记录脑电标记
            index_on_record(taskType === 'speechImagery' ? "Speech Imagery" : "Public Speech");
        } else if (gameStage === 2) {
            // 语音图片游戏
            randomId = getRandomId(items);
            wordContainer.textContent = mergedData[randomId].Chinese;

            const otherIds = getRandomIds(items, level, randomId);
            const allIds = [randomId, ...otherIds];
            allIds.sort(() => 0.5 - Math.random());
            optionsContainer.innerHTML = ''; // 清空备选图片容器

            let i = 0;
            for (const id of allIds) {
                const Option = getRandomId(mergedData[id].pictures);
                const OptionPath = Option.picture;
                const optionImage = createImageElement(OptionPath, `${mergedData[id].Chinese}`, id);
                if (i === 0) {
                    optionImage.classList.add('selected');
                }
                i++;
                optionsContainer.appendChild(optionImage);
            }

            // 根据任务类型记录脑电标记
            index_on_record(taskType === 'speechImagery' ? "Speech Imagery" : "Public Speech");
        }
    }, 2000); // 2000毫秒 = 2秒
}

// 显示反馈（正确或错误）
function showFeedback(type) {
    const imageElement = document.getElementById("rImage");
    if (type === 0) {
        imageElement.src = "/static/img/hint/right.png";  // 正确图片
    } else {
        imageElement.src = "/static/img/hint/false.png"; // 错误图片
    }
    imageElement.style.display = "block";
}

// 处理用户选择和更新进度
function handleOptionClick(event, option) {
    let check = true;
    if (loop_count >= loop) {
        // 游戏结束，显示重新开始按钮
        toggleListening();
        const restartButton = document.getElementById('restartButton');
        const endButton = document.getElementById('endButton');
        restartButton.style.display = 'inline-block';
        endButton.style.display = 'none';
        alert("游戏结束！！！");

        index_save(); // 保存脑电标记
        startListeningButton.style.display = 'none';
        is_Listening = false;
    }

    // 获取回答并更新得分
    if (ans === randomId) {
        totalScore += 2.5;
        showFeedback(0); // 正确反馈
    } else {
        showFeedback(1); // 错误反馈
    }

    const scoreSpan = document.getElementById('score');
    scoreSpan.textContent = totalScore;

    // 保存标签和进度
    index_off_record(ans, randomId, loop_count, StimulusOnsetIndex);

    // 更新进度条
    const result = Math.round((loop_count / loop) * 100);
    bar.style.width = result + "%";
    progressElement.textContent = result + "%";

    // 游戏阶段切换：第一阶段结束后切换到第二阶段
    if (gameStage === 1) {
        gameStage = 2; // 切换到语音图片游戏
        updatePicture(); // 更新图片
    }
}

// 监听键盘事件
document.addEventListener('keydown', (event) => {
    if (is_Listening) {
        const key = event.key;
        const options = optionsContainer.querySelectorAll('.option');
        switch (event.key) {
            case 'ArrowLeft': // 左箭头
                currentOptionIndex = (currentOptionIndex - 1 + options.length) % options.length;
                break;
            case 'ArrowRight': // 右箭头
                currentOptionIndex = (currentOptionIndex + 1) % options.length;
                break;
            case 'Enter': // 回车键
                ans = options[currentOptionIndex].dataset.index;
                handleOptionClick(null, options[currentOptionIndex]);
                currentOptionIndex = 0;
                break;
        }
        
        // 更新选中状态
        options.forEach((option, index) => {
            option.classList.toggle('selected', index === currentOptionIndex);
        });
    }
});

// 按钮点击切换监听状态
startListeningButton.addEventListener('click', toggleListening);

// 切换监听状态
function toggleListening() {
    is_Listening = !is_Listening;
    startListeningButton.textContent = is_Listening ? '暂停' : '继续';
    if (startListeningButton.textContent === '继续') {
        StimulusOnsetIndex = index_record(); // 开始记录脑电数据
    }
    console.log(`键盘监听已${is_Listening ? '启动' : '停止'}`);
}

// 游戏结束并保存数据
document.getElementById('endButton').addEventListener('click', function () {
    fetch('/eeg/index/save', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'), // 获取CSRF令牌
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "mark_save": mark_save,
            "name": name,
            "exp_name": exp_name,
            "session": session + '_L' + level + "_Score" + totalScore
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data); // 处理返回的数据
    });
});

