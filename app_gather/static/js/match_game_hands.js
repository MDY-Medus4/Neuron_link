const imageContainer = document.getElementById('imageContainer');
const optionsContainer = document.getElementById('optionsContainer');

let loop = 40;
let loop_count = 1;
let right_count = 0;
let is_Listening = true
let dirct = 'left'
let mark_save = [];
// 获取按钮元素
const startListeningButton = document.getElementById('startListeningButton');

function updateImages() {
    // 随机选择一个 id
    const randomId = getRandomId(Object.keys(mergedData));
    // 随机选择左侧图片
    const leftImageIndex = Math.floor(Math.random() * mergedData[randomId].length);
    const leftImagePath = mergedData[randomId][leftImageIndex].pic;
    const leftImage = createImageElement(leftImagePath, '手部图片', 'leftImage');
    leftImage.id = 'hand'
    leftImage.setAttribute('angle', mergedData[randomId][leftImageIndex].rotate_angle)
    leftImage.setAttribute('type', mergedData[randomId][leftImageIndex].type)
    imageContainer.innerHTML = ''; // 清空左侧图片容器
    imageContainer.appendChild(leftImage);
}

// 初始更新图片
document.getElementById('leftContainer').style.display = 'none'; // 默认隐藏左手容器
document.getElementById('rightContainer').style.display = 'none'; // 默认隐藏右手容器
let StimulusOnsetIndex;
let StimulusOffsetIndex;
updateImages();
index_on_record()


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


window.onload = function () {
    let currentOptionIndex = 0; // 记录当前选中的选项索引
    const bar = document.getElementById('bar')
    const progressElement = document.querySelector(".progress-value");
    const circle_bar = document.getElementById("circle_bar")

    //按钮点击事件
    function handleOptionClick(event, option, dirct) {
        let check = true
        if (loop_count > loop) {
            // 显示重新开始按钮
            toggleListening();
            const restartButton = document.getElementById('restartButton');
            const endButton = document.getElementById('endButton');
            // window.location.href = `/game/end?right_count=${right_count}`;
            restartButton.style.display = 'inline-block';
            endButton.style.display = 'none';
            alert("游戏结束！！！")
            index_save()
            startListeningButton.style.display = 'none';
            is_Listening = false
        }
        console.log({'type:': option.getAttribute('type'), "ans": dirct})
        if (option.getAttribute('type') === dirct) {
            // alert('正确！你找到了匹配的图片。');
            right_count++;
            showFeedback(0)
        } else {
            // alert('错误！请再试一次。');
            showFeedback(1)
            check = false
        }
        // 记录刺激结束时间
        index_off_record(check, option, StimulusOnsetIndex);
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
            const hand = document.getElementById('hand');

            if (key === 'ArrowLeft') {
                // 左箭头键，移动到前一个选项
                changeText('left');
                dirct = 'left'
            } else if (key === 'ArrowRight') {
                // 右箭头键，移动到下一个选项
                changeText('right');
                dirct = 'right'
            } else if (key === 'Enter') {
                // 回车键，触发点击事件
                // console.log('Key pressed globally:', selectedOption.dataset.index);
                handleOptionClick(null, hand, dirct);
            }

        }


    });

// 切换监听状态的函数
    function toggleListening() {
        is_Listening = !is_Listening;
        startListeningButton.textContent = is_Listening ? '暂停' : '继续';
        if (startListeningButton.textContent === '继续'){
            StimulusOnsetIndex = index_on_record()
        }
        console.log(`键盘监听已${is_Listening ? '启动' : '停止'}`);
    }

// 绑定按钮点击事件到切换监听状态的函数
    startListeningButton.addEventListener('click', toggleListening);

}



// 脑电mark保存
function index_save() {
    fetch('/eeg/index/save', {
        method: 'POST', headers: {
            'X-CSRFToken': getCookie('csrftoken'), // 替换为你的CSRF令牌获取方式
            'Content-Type': 'application/json',
        }, body: JSON.stringify({
            "mark_save": mark_save, "name": name, "exp_name": exp, "session": session
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
        method: 'POST', headers: {
            'X-CSRFToken': getCookie('csrftoken'), // CSRF令牌，从cookie中获取
            'Content-Type': 'application/json',
        }, body: JSON.stringify({
            "mark_save": mark_save, "name": name, "exp_name": exp, "session": session,
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log(data); // 处理返回的数据
        });
});

``
function changeText(direction) {
    const textArray = ['left', 'right'];
    document.getElementById('leftContainer').style.display = 'none'; // 默认隐藏左手容器
    document.getElementById('rightContainer').style.display = 'none'; // 默认隐藏右手容器

    if (direction == textArray[0]) {
        document.getElementById('leftContainer').style.display = 'block'; // 显示左手容器
    } else if (direction == textArray[1]) {
        document.getElementById('rightContainer').style.display = 'block'; // 显示右手容器
    }

    // if (textElement) { // 确保textElement已正确赋值
    //     // 基于方向设置文本内容
    //     let currentIndex = textArray.indexOf(direction);
    //     textElement.textContent = `这只手是${textArray[currentIndex]}?`;
    // }
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
            'type': option.getAttribute('type'),
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