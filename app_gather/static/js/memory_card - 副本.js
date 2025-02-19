var leftImage_id = [];
var cnt=0;
var answer=[]
let currentIndex = 0; // 默认选择第一个选项
var question_num=0;
var correct_num=0;
var rImage = document.getElementById('rImage');
var rightSrc = '/static/img/hint/right.png'; // 取得正确反馈的图片路径
var wrongSrc = '/static/img/hint/false.png'; // 取得错误反馈的图片路径
var correct_ratio=document.getElementById('circle_bar');
const total_quest=30;
let mark_save=[]
var correct_yorn=-1;
// 获取进度条和进度值元素
var progressBar = document.getElementById('bar');
var progressValue = progressBar.querySelector('.progress-value');
var trial_data = {
    'Trial': 0,
    'type':'card',
    'correct': -1,
    'StimulusOnsetIndex': 0,
    'StimulusOffsetIndex': 0,
}
// 随机选择左侧图片的函数
function randomizeLeftImage() {
    const imageIndex = Math.floor(Math.random() * 20) + 1; // 生成一个1到20之间的随机整数
    leftImage_id.push(imageIndex); // 将随机生成的图片索引添加到数组中
    const imageUrl = `/static/img/img_memory/${imageIndex}.jpg`; // 构建图片路径
    const imageContainer = document.getElementById('imageContainer');
    const leftImage = createImageElement(imageUrl, '左边的图片', 'leftImage');
    // 清空左侧图片容器并添加新图片
    imageContainer.innerHTML = '';
    imageContainer.appendChild(leftImage);
    question_num++;
    // index_save();
    trial_data = {
        'Trial': question_num,
        'type':'card',
        'correct': -1,
        'StimulusOnsetIndex': 0,
        'StimulusOffsetIndex': 0,
    }
    index_on_record();
    // 1秒后隐藏左侧图片
    setTimeout(function () {
        leftImage.style.display = 'none'; // 隐藏左侧图片
    }, 2000);
}

// 创建图片元素函数
function createImageElement(src, alt, id) {
    const image = document.createElement('img');
    image.src = src;
    image.alt = alt;
    image.id = id;
    image.style.maxWidth = '100%'; // 图片最大宽度为容器宽度
    image.style.maxHeight = '100%'; // 图片最大高度为容器高度
    image.style.display = 'block'; // 设置图片为块级元素，以避免底部留白
    return image;
}

function assignRandomImages() {
    // 根据 level 值确定选项数量
    var optionCount;
    optionCount = level+1;
    var answer_tmp=Math.floor(Math.random() * optionCount);
    answer.push(answer_tmp);
    // 清空 optionsContainer
    var optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    // 保存已选择的图片索引
    var selectedIndexes = [];

    // 为每个选项生成一个随机图片
    for (var i = 0; i < optionCount; i++) {
        // 生成随机图片索引，确保不重复
        var randomNumber;
        do {
            randomNumber = Math.floor(Math.random() * 20) + 1;
        } while (selectedIndexes.includes(randomNumber)||randomNumber==leftImage_id[cnt]);
        selectedIndexes.push(randomNumber);
        if(i==answer_tmp){
            randomNumber=leftImage_id[cnt];
        }
        var imagePath = '/static/img/img_memory/' + randomNumber + '.jpg';
        var optionImage = createImageElement(imagePath, 'Option Image', 'optionImage'+i);
        optionImage.style.opacity=0;
        optionImage.style.width = '100%'; 
        optionImage.className = "option";  
        optionImage.dataset.index = i;  

        // 将新的图片添加到 optionsContainer
        optionsContainer.appendChild(optionImage);
    }
    cnt++;
    // 3秒后显示所有选项
    setTimeout(function () {
        var optionImages = optionsContainer.querySelectorAll('.option');
        optionImages.forEach(function(optionImage) {
            optionImage.style.opacity = 1; // 设置选项为可见
        });
    }, 3000);
}

function answer_correct(){
    correct_num++;
    var progress = (question_num / total_quest * 100).toFixed(0);
    var correctRate = (correct_num / question_num * 100).toFixed(0); 
    // alert(correctRate);
    correct_ratio.style.setProperty('--progress', correctRate + '%');
    correct_ratio.dataset.progress = correctRate + '%';

    // 更新进度条的宽度和进度值的文本
    progressBar.style.width = progress + '%';
    progressValue.innerHTML = progress + '%';

    rImage.src = rightSrc;
    rImage.alt = "太棒了，回答正确";
    rImage.style.display = "block";
}
function wrong_answer(){
    var correctRate = (correct_num / question_num * 100).toFixed(0); 
    var progress = (question_num / total_quest * 100).toFixed(0);
    // alert(correctRate);
    correct_ratio.style.setProperty('--progress', correctRate + '%');
    correct_ratio.dataset.progress = correctRate + '%';

    // 更新进度条的宽度和进度值的文本
    progressBar.style.width = progress + '%';
    progressValue.innerHTML = progress + '%';

    rImage.src = wrongSrc;
    rImage.alt = "很遗憾，回答错误";
    rImage.style.display = "block";
}

window.addEventListener('keydown', function(event) {
    const options = document.getElementsByClassName('option');
    if(isPaused){
        return;
    }
    else{
    switch(event.keyCode) {
        case 37: // 左箭头键
            options[currentIndex].classList.remove('selected');
            currentIndex = (currentIndex - 1 + options.length) % options.length;
            options[currentIndex].classList.add('selected');
            break;
        case 39: // 右箭头键
            options[currentIndex].classList.remove('selected');
            currentIndex = (currentIndex + 1) % options.length;
            options[currentIndex].classList.add('selected');
            break;
        case 13: // 回车键
            const selectedImage = options[currentIndex];
            // 你的代码逻辑，比如记录答案，对比答案等。我这里只是做演示，你需要根据你的需求来实现。
            if(currentIndex == answer[cnt-1]){
                answer_correct();
                correct_yorn=1;
            } else {
                wrong_answer()
                correct_yorn=0;
            }
            index_off_record();
            // 1秒后让rImage不可见
            setTimeout(function () {
                rImage.style.display = 'none';
            }, 2000);
            break;
        default:
            break;
    }
}
});


// ...
var isPaused = false; // 默认状态不是暂停

// 点击"暂停"按钮
document.getElementById('startListeningButton').addEventListener('click', function() {
    // 切换暂停状态
    isPaused = !isPaused;
    // 根据当前状态更新按钮的文字
    this.textContent = isPaused ? '继续' : '暂停';
});

// 点击"结束"按钮
document.getElementById('endButton').addEventListener('click', function() {
    // 这里写按钮点击后需要执行的代码
    index_save();
    alert("恭喜您完成训练任务！")
    // console.log('结束按钮被点击'); // 这里是示例代码，你需要根据实际需求进行修改
});


function main() {
    if (question_num < total_quest) {
        randomizeLeftImage();
        // Call the function
        assignRandomImages();
    } else {
        index_save();
        // 可以在这里添加游戏结束后的代码，比如提醒用户游戏已结束
        alert("恭喜您完成训练任务！");
    }
}

// 在页面加载完成后调用主函数
window.onload = function() {
    main();
    setTimeout(function() {
        document.getElementsByClassName('option')[currentIndex].classList.add('selected');
    }, 3000) // 延迟执行选项高亮，确保选项都已经加载完成
};





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
        trial_data['StimulusOnsetIndex']= data.eeg_index;
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
        trial_data['StimulusOffsetIndex']=data.eeg_index;
        trial_data['correct']=correct_yorn;
        mark_save.push(trial_data);
        main();
        currentIndex = 0;
        document.getElementsByClassName('option')[currentIndex].classList.add('selected');
        return data // 返回数据给调用者

    } catch (error) {
        console.error('EEG数据获取失败', error);
        throw error; // 抛出错误给调用者
    }
}