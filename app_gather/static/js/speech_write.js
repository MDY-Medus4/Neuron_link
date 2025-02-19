let loop = 40;          //loop:trail数
let loop_count = 0;     //loop_count：当前trail
let is_Listening = true //键盘监听标志
let mark_save = [];     //标签数据
let videoIndex = 0;     //当前播放的视频下标
let totalScore = 0;     //病人的得分
let videoElement = document.getElementById('myVideo'); //视频组件

// 检查传进来的参数
// console.log(mergedData)
// console.log('Session:', session)

let levelData = mergedData[level]

// 更新视频路径
function setVideoSource() {
    var sourceElement = videoElement.querySelector('source');
    sourceElement.src = levelData[videoIndex].video ;
    videoElement.load();
    videoElement.play();
}

//随机视频
function randomIndex(){
    videoIndex = Math.floor(Math.random() * Object.keys(levelData).length)
}

//用于计时并计算分数
let starttime;
let endtime;
//计算分数的函数
function update_score(){
    //获取当前的时间，结束时间
    endtime = new Date();

    // 计算消耗的时间（以毫秒为单位）
    const elapsedTime = endtime - starttime;

    // 单次最大时间为 10 秒，仅用于计算使用，真实情况不受限制，需要等待病人自己确定结束
    // 单次最高分为 2.5 分
    const maxTime = 10000; // 10 秒转换为毫秒
    const maxScore = 3;

    // 计算得分
    // 分数计算公式：score = maxScore * (1 - elapsedTime / maxTime)
    let score = 0
    if(elapsedTime < maxTime)
    {
        score = Math.max(0, maxScore * (1 - elapsedTime / maxTime));
    }
    score = Math.round(score) //四舍五入
    totalScore += score

    const scoreSpan = document.getElementById('score');
    scoreSpan.textContent = totalScore
}

function update_video(){
    // 隐藏按钮
    const buttons = document.querySelectorAll('.s_button a');
    buttons.forEach(button => {
        button.style.display = 'none';
    });

    // 显示休息消息
    let messageElement = document.getElementById('message');
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.id = 'message';
        document.body.appendChild(messageElement); // 假设这是你想要添加消息的地方
    }
    messageElement.textContent = '休息';
    messageElement.style.display = 'block'; // 确保消息是可见的
    //休息时不播放视频
    videoElement.style.display = 'none'

    setTimeout(() => {
        messageElement.textContent = '请跟着示范写';

        //视频换源并显示
        randomIndex();
        setVideoSource();
        videoElement.style.display = 'inline-block'
        starttime = new Date();

        //开始记录数据
        index_on_record();

        setTimeout(() => {
            // 再次显示按钮
            buttons.forEach(button => {
                button.style.display = ''; // 或者设置为'inline-block'，取决于原始样式
            });
            // 隐藏消息
            messageElement.style.display = 'none';
        }, 2000); // 多少毫秒后执行
    }, 2000); // 2000毫秒 = 2秒
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
    'word' : levelData[videoIndex].word,
    'StimulusOnsetIndex': StimulusOnsetIndex,
    'StimulusOffsetIndex': StimulusOffsetIndex,
}
//开始记录数据
// index_on_record();

// 暂停按钮元素
const startListeningButton = document.getElementById('startListeningButton');

//按键事件
window.onload = function () {
    let currentIndex = 0; // 默认选择第一个按钮
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

            index_off_record(levelData[videoIndex].word, loop_count, StimulusOnsetIndex)
            //更新进度条
            const result = Math.round((loop_count / loop) * 100);
            bar.style.width = result + "%";
            progressElement.textContent = result + "%";
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
                case 'Enter': // 回车键
                    handleOptionClick(null, buttons[currentIndex]);
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
            "session": session+'_L'+level+"_Score"+totalScore
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
            "session": session+'_L'+level+"_Score"+totalScore
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

async function index_off_record(word, loopcount, OnsetIndex) {
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
            'StimulusOnsetIndex': OnsetIndex,
            'StimulusOffsetIndex': data.eeg_index,
        }
        console.log("trail_data: ", trial_data)
        mark_save.push(trial_data);
        update_score();
        update_video();
        loop_count++;
        // index_on_record();
        return data // 返回数据给调用者

    } catch (error) {
        console.error('EEG数据获取失败', error);
        throw error; // 抛出错误给调用者
    }
}
