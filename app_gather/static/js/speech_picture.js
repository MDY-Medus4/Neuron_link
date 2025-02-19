const wordContainer = document.getElementById('leftWord');
const optionsContainer = document.getElementById('optionsContainer');

let loop = 40;          //loop:trail数
let loop_count = 0;     //loop_count：当前trail
let is_Listening = true //键盘监听标志
let mark_save = [];     //标签数据
let items = Object.keys(mergedData) //获取类别
let randomId            //用于记录正确的答案
let ans;                //病人的回答
let totalScore = 0;     //病人的得分
// 暂停按钮元素
const startListeningButton = document.getElementById('startListeningButton');

//阻塞等待time (ms)
function sleep(time){
    var timeStamp = new Date().getTime();
    var endTime = timeStamp + time;
    while(true){
        if(new Date().getTime() > endTime){
            break;
        }
    }
}
//获取单个随机项
function getRandomId(ids) {
    return ids[Math.floor(Math.random() * ids.length)];
}
//获取多个随机项，在去掉了排除项后，其他项可以重复
function getRandomIds(ids, count, excludeId) {
    const filteredIds = ids.filter(id => id !== excludeId);
    const result = [];
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * filteredIds.length);
        result.push(filteredIds[randomIndex]);
    }
    return result;
}
//创建一个图片容器
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
function updatePicture() {
    wordContainer.textContent = '休息'
    optionsContainer.innerHTML = '';
    setTimeout(() => {
        // 随机选择左侧文字
        randomId = getRandomId(items);
        // 替换文字
        wordContainer.textContent = mergedData[randomId].Chinese;

        // 随机选择level个不同 id 下的图片作为备选图片
        const otherIds = getRandomIds(items, level, randomId);

        // 合并 randomId 和 otherIds 到一个数组并随机重新排序
        const allIds = [randomId, ...otherIds];
        allIds.sort(() => 0.5 - Math.random());
        // console.log(allIds)
        optionsContainer.innerHTML = ''; // 清空备选图片容器
        let i = 0
        for (const id of allIds) {
            //随机获取图片，一个文字会有多个图片，所以随机获取
            const Option = getRandomId(mergedData[id].pictures);
            // console.log(Option)
            const OptionPath = Option.picture;
            const optionImage = createImageElement(OptionPath, `${mergedData[id].Chinese}`, id);
            if (i === 0) {
                optionImage.classList.add('selected');
            }
            i++
            optionsContainer.appendChild(optionImage);
        }
        index_on_record()
    }, 2000); // 2000毫秒 = 2秒

}

updatePicture()
// 记录游戏开始时的mark下标
let type = "onset";
let StimulusOnsetIndex
let StimulusOffsetIndex;
let trial_data = {
    'Trial': loop_count,
    'word': randomId,
    'ans': null,
    'StimulusOnsetIndex': StimulusOnsetIndex,
    'StimulusOffsetIndex': StimulusOffsetIndex,
}


//显示对错
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

    // 秒后移除高亮效果
    setTimeout(() => {
        imageElement.style.display = "none";
        imageElement.classList.remove("highlight");
    }, 2000); // 2000毫秒 = 2秒
}

//按键事件
window.onload = function () {
    let currentOptionIndex = 0; // 默认选择第一个按钮
    const bar = document.getElementById('bar')
    const progressElement = document.querySelector(".progress-value");

    //按钮点击事件
    function handleOptionClick(event, option) {
        let check = true
        if (loop_count >= loop) {
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

        //获取回答，并且更新得分
        if (ans === randomId) {
            totalScore += 2.5
            showFeedback(0)
        }
        else {
            showFeedback(1)
        }
        const scoreSpan = document.getElementById('score');
        scoreSpan.textContent = totalScore

        //保存一次标签,...ReplayIndex浅拷贝，方便清空原列表
        index_off_record(ans, randomId, loop_count, StimulusOnsetIndex);

        //更新进度条
        const result = Math.round((loop_count / loop) * 100);
        bar.style.width = result + "%";
        progressElement.textContent = result + "%";
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

//结束按钮
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
            "exp_name": exp_name,
            "session": session + '_L' + level + "_Score" + totalScore
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log(data); // 处理返回的数据
        });
});

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
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'), // 替换为你的CSRF令牌获取方式
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

async function index_off_record(ans, word, loopcount, OnsetIndex) {
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
            'word': word,
            'ans': ans,
            'StimulusOnsetIndex': OnsetIndex,
            'StimulusOffsetIndex': data.eeg_index,
        }
        console.log("trail_data: ", trial_data)
        mark_save.push(trial_data);
        updatePicture();
        loop_count++;
        // index_on_record();
        return data // 返回数据给调用者

    } catch (error) {
        console.error('EEG数据获取失败', error);
        throw error; // 抛出错误给调用者
    }
}
