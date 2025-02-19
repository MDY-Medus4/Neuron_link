let loop = 40;          //loop:trail数
let loop_count = 0;     //loop_count：当前trail
let is_Listening = true //键盘监听标志
let mark_save = [];     //标签数据
let videoIndex = 0;     //当前播放的视频下标
let ans;                //病人的回答
let totalScore = 0;     //病人的得分
let replay_flag = true; //重播标志，true时，回车表示视频重播
let videoElement = document.getElementById('myVideo'); //视频组件
// 得分表，数量加三分，一般2分，困难1分
var degree_score = {
    'skilled': 3,
    'normal' : 2,
    'hard'   : 1,
};

// 检查传进来的参数
// console.log(mergedData)
// console.log('Level:', level)
// console.log('Session:', session)

// 初始化权重表weight
let videoPaths = mergedData[level];
var weight = {};

//记录各个类别的权重，从5开始
//每次更新后增加的值为对应获得的分数
videoPaths.forEach((element, index) => {
    var typeWord = element.type_word;
    if (weight[typeWord]){
        weight[typeWord]['item'].push(index)
    }
    else{
        weight[typeWord] = {'score':5, 'item':[index]}
    }
});
// console.log(weight);

// 更新视频路径
function setVideoSource() {
    var sourceElement = videoElement.querySelector('source');
    sourceElement.src = videoPaths[videoIndex].video ;
    videoElement.load();
    videoElement.play();
}

function randomIndex(){
    let tmp;
    if (level != 1){
        // console.log(weight);
        // 计算每个 type_word 的选择概率
        var probabilities = {};
        for (var typeWord in weight) {
            probabilities[typeWord] = 1/weight[typeWord].score; //取权重倒数
        }

        // 计算累积概率
        var cumulativeProbability = 0;
        for (var typeWord in probabilities) {
            cumulativeProbability += probabilities[typeWord];
            probabilities[typeWord] = cumulativeProbability;
        }
        // 归一化概率
        for (var typeWord in probabilities) {
            probabilities[typeWord] /= cumulativeProbability;
        }
        // console.log(probabilities);
        // 根据概率随机选择 type_word
        var random = Math.random();
        for (var typeWord in probabilities) {
            if (random < probabilities[typeWord]) {
                tmp = typeWord;
                break;
            }
        }
        // console.log(random);
        // console.log(tmp);
    }
    else{
        tmp = 'vowel';
    }
    let tmp_index = Math.floor(Math.random() * weight[tmp]['item'].length);
    videoIndex = weight[tmp]['item'][tmp_index];
}

function update_video(){
    //允许重播
    replay_flag = true;
    // 隐藏按钮
    const buttons = document.querySelectorAll('.s_button a');
    buttons.forEach(button => {
        button.style.display = 'none';
    });

    // 显示消息
    let messageElement = document.getElementById('message');
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.id = 'message';
        document.body.appendChild(messageElement); // 假设这是你想要添加消息的地方
    }
    messageElement.textContent = '请跟着示范说';
    messageElement.style.display = 'block'; // 确保消息是可见的

    //视频换源
    randomIndex();
    setVideoSource();

    setTimeout(() => {
        // 再次显示按钮
        buttons.forEach(button => {
            button.style.display = ''; // 或者设置为'inline-block'，取决于原始样式
        });
        // 隐藏消息
        messageElement.style.display = 'none';
        //出现选项后不允许重播
        replay_flag = false;
    }, time*1000); // 多少毫秒后执行
}

update_video();
// console.log(weight);
// console.log(videoIndex);

// 记录游戏开始时的mark下标
let type = "onset";
let StimulusOnsetIndex
let ReplayIndex = [];   //用于记录重播时的index
let StimulusOffsetIndex;
let trial_data = {
    'Trial': loop_count,
    'word' : videoPaths[videoIndex].word,
    'word_type' : videoPaths[videoIndex].type_word,
    'ans' : null,
    'StimulusOnsetIndex': StimulusOnsetIndex,
    'ReplayIndex': ReplayIndex,
    'StimulusOffsetIndex': StimulusOffsetIndex,
}
//开始记录数据
index_on_record();

// 暂停按钮元素
const startListeningButton = document.getElementById('startListeningButton');

//按键事件
window.onload = function () {
    let currentIndex = 0; // 默认选择第一个按钮
    const bar = document.getElementById('bar')
    const progressElement = document.querySelector(".progress-value");

    //按钮点击事件
    function handleOptionClick(event, option) {
        if(replay_flag)
        {
            if (videoElement.ended || videoElement.paused) { // 如果视频结束或暂停，则重播
                videoElement.currentTime = 0;
                videoElement.play();
                index_replay_record();
            } 
        }
        else{
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
            ans = option.dataset.ans;
            totalScore += degree_score[ans];
            weight[videoPaths[videoIndex].type_word].score += degree_score[ans];
            // console.log({"totalScore": totalScore, "ans": ans});
            const scoreSpan = document.getElementById('score');
            scoreSpan.textContent = totalScore

            //保存一次标签,...ReplayIndex浅拷贝，方便清空原列表
            index_off_record(ans, videoPaths[videoIndex].word, 
                            videoPaths[videoIndex].type_word, loop_count, 
                            StimulusOnsetIndex, [...ReplayIndex]);
            ReplayIndex.length = 0;

            //更新进度条
            const result = Math.round((loop_count / loop) * 100);
            bar.style.width = result + "%";
            progressElement.textContent = result + "%";
        }
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
                    currentIndex = (currentIndex - 1 + buttons.length) % buttons.length;
                    break;
                case 'ArrowDown': // 下箭头
                    currentIndex = (currentIndex + 1) % buttons.length;
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
            "session": session+'_L'+level+"_T"+time+"_Score"+totalScore
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
            "session": session+'_L'+level+"_T"+time+"_Score"+totalScore
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


async function index_off_record(ans, word, word_type, loopcount, OnsetIndex, DuringIndex) {
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
            'word' : word,
            'word_type' : word_type,
            'ans': ans,
            'StimulusOnsetIndex': OnsetIndex,
            'ReplayIndex': [...DuringIndex],
            'StimulusOffsetIndex': data.eeg_index,
        }
        // console.log("trail_data: ", trial_data)
        mark_save.push(trial_data);
        update_video();
        loop_count++;
        DuringIndex.length = 0;
        index_on_record();
        return data // 返回数据给调用者

    } catch (error) {
        console.error('EEG数据获取失败', error);
        throw error; // 抛出错误给调用者
    }
}

async function index_replay_record() {
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
        console.log(' replay Backend tool response:', data);
        ReplayIndex.push(data.eeg_index);
        // console.log("replay_index: ",ReplayIndex);
        // update_para()
        return data // 返回数据给调用者

    } catch (error) {
        console.error('EEG数据获取失败', error);
        throw error; // 抛出错误给调用者
    }
}