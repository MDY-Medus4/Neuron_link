const wordContainer = document.getElementById('leftWord');
const optionsContainer = document.getElementById('optionsContainer');

let is_Listening = true; // 是否监听键盘
let mark_save = []; // 标签数据
let currentPhase = 'imagery'; // 当前阶段：imagery 或 public
let currentIndex = 0; // 当前图片索引

// 图片和词语数据
const imageData = [
    { image: '/static/img/composite_paradigm/eat.jpg', word: '吃饭' },
    { image: '/static/img/composite_paradigm/help.jpg', word: '帮助' },
    { image: '/static/img/composite_paradigm/toilet.jpg', word: '厕所' }
];

// 更新图片内容，根据当前阶段展示不同内容
function updatePicture() {
    const currentItem = imageData[currentIndex];
    document.getElementById('myImage').src = currentItem.image;
    document.getElementById('chineseWord').textContent = currentItem.word;

    // 记录当前阶段的数据
    mark_save.push({
        phase: currentPhase,
        image: currentItem.image,
        word: currentItem.word,
        timestamp: new Date().getTime()
    });

    // 记录脑电数据
    index_on_record(currentPhase === 'imagery' ? "Speech Imagery" : "Public Speech");
}

// 切换阶段或进入下一张图片
function nextPhase() {
    if (!is_Listening) return;

    // 结束当前阶段的记录
    index_off_record(currentPhase, imageData[currentIndex].word, currentIndex);

    if (currentPhase === 'imagery') {
        // 从言语想象切换到公开言语
        currentPhase = 'public';
        document.getElementById('phaseTitle').textContent = '公开言语阶段';
        document.getElementById('instruction').textContent = '说出对应的单词';
    } else {
        // 从公开言语切换到下一张图片的言语想象
        currentPhase = 'imagery';
        document.getElementById('phaseTitle').textContent = '言语想象阶段';
        document.getElementById('instruction').textContent = '想象对应的单词发音';
        currentIndex++;

        if (currentIndex >= imageData.length) {
            endExperiment();
            return;
        }
    }

    updatePicture();
    updateProgress();
}

// 更新进度条
function updateProgress() {
    const totalSteps = imageData.length * 2; // 每张图片两个阶段
    const currentStep = currentIndex * 2 + (currentPhase === 'public' ? 1 : 0);
    const progress = (currentStep / totalSteps) * 100;
    
    document.querySelector('.progress-bar').style.width = progress + "%";
    document.querySelector('.progress-value').textContent = Math.round(progress) + "%";
}

// 实验结束处理
function endExperiment() {
    is_Listening = false;
    document.getElementById('restartButton').style.display = 'inline-block';
    alert('实验已完成！');
}

// 切换暂停/继续状态
function toggleListening() {
    is_Listening = !is_Listening;
    document.querySelector('.key-hint').style.color = is_Listening ? '#666' : '#ff0000';
}

// 监听键盘事件
document.addEventListener('keydown', (event) => {
    if (!is_Listening) return;

    switch (event.code) {
        case 'Space': // 空格键：切换阶段
            event.preventDefault();
            nextPhase();
            break;
        case 'Escape': // ESC键：暂停/继续
            toggleListening();
            break;
    }
});

// 结束按钮事件处理
document.getElementById('endButton').addEventListener('click', function() {
    fetch('/game/composite_paradigm/save_data', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "mark_save": mark_save,
            "name": name,
            "exp_name": "composite_paradigm",
            "session": session + '_L' + level
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('数据保存成功:', data);
        window.location.href = '/game/speech/select';
    })
    .catch(error => {
        console.error('保存数据出错:', error);
    });
});

// 获取CSRF Token
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

// 初始化显示
updatePicture();
updateProgress();

