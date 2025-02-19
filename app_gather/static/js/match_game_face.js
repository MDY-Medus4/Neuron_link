const imageContainer = document.getElementById('imageContainer');
const optionsContainer = document.getElementById('optionsContainer');

let loop = 40;
let loop_count = 0;
let right_count = 0;
let is_Listening = true
let mark_save = [];

// 获取按钮元素
const startListeningButton = document.getElementById('startListeningButton');

function updateImages() {
    // 随机选择一个 id
    const randomId = getRandomId(Object.keys(mergedData));
    // 随机选择左侧图片
    const leftImageIndex = Math.floor(Math.random() * mergedData[randomId].length);
    const faceImagePath = mergedData[randomId][leftImageIndex].pic;
    const faceImg = createImageElement(faceImagePath, '面部表情', 'faceImg');
    faceImg.id = 'face'
    faceImg.setAttribute('type', mergedData[randomId][leftImageIndex].type)
    imageContainer.innerHTML = ''; // 清空左侧图片容器
    imageContainer.appendChild(faceImg);

    // 隐藏按钮
    const buttons = document.querySelectorAll('.s_button a');
    buttons.forEach(button => {
        button.style.display = 'none';
    });

    // 显示“请观看图片”的消息
    let messageElement = document.getElementById('message');
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.id = 'message';
        document.body.appendChild(messageElement); // 假设这是你想要添加消息的地方
    }
    messageElement.textContent = '请观看图片';
    messageElement.style.display = 'block'; // 确保消息是可见的
    is_Listening = false;
    // 3秒后执行
    setTimeout(() => {
        // 再次显示按钮
        buttons.forEach(button => {
            button.style.display = ''; // 或者设置为'inline-block'，取决于原始样式
        });
        // 隐藏消息
        messageElement.style.display = 'none';
        is_Listening = true;
    }, 3000); // 3000毫秒后执行
}

// 初始更新图片
updateImages();
// 记录游戏开始时的mark下标
let type = "onset";
let StimulusOnsetIndex
let StimulusOffsetIndex;
let ans;
let trial_data = {
    'Trial': loop_count,
    'correct': -1,
    'StimulusOnsetIndex': StimulusOnsetIndex,
    'StimulusOffsetIndex': StimulusOffsetIndex,
}
//拿数据更新trail
index_on_record();


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

// 展示回答结果正确与否
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

// 更新正确率进度条
function updateCircleBar(circleBar, progress, last) {
    circleBar.style.setProperty("--progress", progress);
    console.log("progress:", progress);
    circleBar.style.setProperty("--last", last);
    circleBar.dataset.progress = progress;
}


window.onload = function () {
    let currentIndex = 0; // 默认选择第一个按钮
    const bar = document.getElementById('bar')
    const progressElement = document.querySelector(".progress-value");
    const circle_bar = document.getElementById("circle_bar")

    //按钮点击事件
    function handleOptionClick(event, option) {
        let check = true
        const dirct = document.getElementById("face").getAttribute('type');
        if (loop_count >= loop) {
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
        }
        ans = option.dataset.ans;
        console.log({'type:': dirct, "ans": ans})
        if (ans === dirct) {
            // alert('正确！你找到了匹配的图片。');
            right_count++;
            showFeedback(0)
        } else {
            // alert('错误！请再试一次。');
            showFeedback(1)
            check = false
        }
        // 记录刺激结束时间
        index_off_record(check, option, ans, loop_count, StimulusOnsetIndex);
        // console.log(mark_save)
        // type = "onset";
        // StimulusOnsetIndex = index_record();
        
        updateCircleBar(circle_bar, Math.round(((loop - (loop_count - right_count)) / loop) * 100) + "%", 100 - Math.round(((loop - (loop_count - right_count)) / loop) * 100) + "%")
        const result = Math.round((loop_count / loop) * 100);
        bar.style.width = result + "%";
        progressElement.textContent = result + "%";
        // loop_count++;

    }

    // 监听键盘事件
    document.addEventListener('keydown', (event) => {
        if (is_Listening) {
            // const buttons = document.querySelectorAll('.btn');
            // 获取文档中所有的元素
            const allElements = document.querySelectorAll('*');

            // 使用Array.from方法将NodeList转换成数组，这样就可以使用数组的filter方法
            const buttons = Array.from(allElements).filter(el => el.id && el.id.includes('ansButton'));
            // alert(buttons[2].getAttribute('data-ans'));

            switch (event.key) {
                case 'ArrowUp': // 上箭头
                    // console.log("ArrowLeft pre  currentIndex: " + currentIndex + "    buttons.length:" + buttons.length);
                    currentIndex = (currentIndex - 1 + buttons.length) % buttons.length;
                    // console.log("ArrowLeft after  currentIndex: " + (currentIndex - 1 + buttons.length) % buttons.length + "    buttons.length:" + buttons.length);
                    break;
                case 'ArrowDown': // 下箭头
                    // console.log("ArrowRight pre  currentIndex: " + currentIndex  + "    buttons.length: " + buttons.length);
                    currentIndex = (currentIndex + 1) % buttons.length;
                    // console.log("ArrowRight after  currentIndex: " + (currentIndex +1) % buttons.length  + "    buttons.length: " + buttons.length);
                    break;
                case 'Enter': // 回车键
                    handleOptionClick(null, buttons[currentIndex]);
                    ans = buttons[currentIndex].dataset.ans;
                    break;
            }

            // 更新选中状态
            buttons.forEach((option, index) => {
                option.classList.toggle('selected', index === currentIndex);
            });
        }
    });

// 切换监听状态的函数
    function toggleListening() {
        is_Listening = !is_Listening;
        startListeningButton.textContent = is_Listening ? '暂停' : '继续';
        if (startListeningButton.textContent === '继续') {
            StimulusOnsetIndex = index_record()
        }
        console.log(`键盘监听已${is_Listening ? '启动' : '停止'}`);
    }

// 绑定按钮点击事件到切换监听状态的函数
    startListeningButton.addEventListener('click', toggleListening);

}


// 脑电mark
async function index_record() {
    try {
        const response = await fetch('/eeg/index/record', {
            method: 'POST', headers: {
                'X-CSRFToken': getCookie('csrftoken'), // 替换为你的CSRF令牌获取方式
                'Content-Type': 'application/json',
            }, body: JSON.stringify({}),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Backend tool response:', data);

        // 在这里处理后台工具类的响应
        return data; // 返回数据给调用者
    } catch (error) {
        console.error('EEG数据获取失败', error);
        throw error; // 抛出错误给调用者
    }
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


async function index_off_record(check, option, ans, loopcount, OnsetIndex) {
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
            'Trial': loopcount,
            'correct': check,
            'StimulusOnsetIndex': StimulusOnsetIndex,
            'StimulusOffsetIndex': data.eeg_index,
            'ans': ans,
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
