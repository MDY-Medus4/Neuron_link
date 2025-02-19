// 获取 gridContainer 元素
const gridContainer = document.getElementById('gridContainer');
var path=[];
// 获取进度条和进度值元素
var progressBar = document.getElementById('bar');
var progressValue = progressBar.querySelector('.progress-value');
var question_num=0;
const total_quest=25;
var total_step=0;
var correct_step=0;
var correct_ratio=document.getElementById('circle_bar');
var coordinatesSet = new Set();
var mark_save=[];
var w_n=0;
var trial_data = {
    'Trial': 0,
    'type':'road',
    'wrong_num': 0,
    'StimulusOnsetIndex': 0,
    'StimulusOffsetIndex': 0,
}
// coordinatesSet.add(coord1.join(',')); 

// 定义生成网格的函数
function generateGrid(size) {
    // 清空 gridContainer
    gridContainer.innerHTML = '';

    // 动态设置网格样式
    gridContainer.style.gridTemplateColumns = `repeat(${size},100px)`;
    gridContainer.style.gridTemplateRows = `repeat(${size}, 100px)`;

    // 动态生成网格
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            // alert("nn");
            const gridItem = document.createElement('div'); // 创建一个新的 div 元素作为网格项
            gridItem.setAttribute('data-id', i * size + j);  // 设置data-id属性v
            gridItem.classList.add('grid-item'); // 添加 grid-item 类
            const img = document.createElement('img'); // 创建一个 img 元素
            img.src = '/static/img/img_memory/road.png'; // 设置图片的占位图像
            // if(i==size-1&&j==0){
            //     img.src='/static/img/img_memory/down.png';
            // }
            // 在这里检查是否需要添加覆盖图片
            if(i == size-1 && j == 0) {
                const overlay = document.createElement('img'); // 创建一个新的 img 标签，用作覆盖图像
                overlay.src = '/static/img/img_memory/Actor_down.png';
                overlay.classList.add('overlay'); // 覆盖图片的类
                gridItem.appendChild(overlay);  // 将 overlay 添加到 gridItem 中
            }   
            gridItem.appendChild(img); // 将 img 添加到 gridItem 中
            gridContainer.appendChild(gridItem); // 将 gridItem 添加到 gridContainer 中
        }
    }
}

// 假定网格大小变量
const gridSize = level+1    ; // 比如是个 6x6 网格

// Actor 的初始位置
let actorX = 0;  // Actor 的 X 坐标
let actorY = gridSize - 1;  // Actor 的 Y 坐标

// 用于记录Actor的id，方便移动时查找，可以根据实际情况调整
let actorId = actorY * gridSize + actorX;

//...

// 更改actor图像方向的函数
function changeActorImage(direction) {
    // 根据方向生成图像路径
    const actorImageName = `/static/img/img_memory/Actor_${direction}.png`;
    // 查找当前网格中的actor图像
    const actorImage = gridContainer.querySelector('img.overlay');
    // 更改图像源
    actorImage.src = actorImageName;
}

function drawArrow(x, y) {
    const arrowId = y * gridSize + x;
    const gridItem = gridContainer.querySelector(`div[data-id="${arrowId}"]`);
    const arrowImg = document.createElement('img');
    arrowImg.src = `/static/img/img_memory/flame_4.png`;
    arrowImg.classList.add('path-arrow'); // "arrow" 是箭头图像的类名
    gridItem.appendChild(arrowImg);
}


// 更新actor位置的函数
function updateActorPosition(newX, newY, direction) {
    // 如果actor决定移动位置，则更新位置
    if (newX !== actorX || newY !== actorY) {
        drawArrow(actorX, actorY); // 绘制箭头在旧位置
        // 移除旧位置的Actor
        var oldActorImg = gridContainer.querySelector('img.overlay');
        if (oldActorImg) {
            oldActorImg.remove();
        }
        
        // 计算新位置的ID
        const newActorId = newY * gridSize + newX;
        
        // 获取新位置的网格项
        const newGridItem = gridContainer.querySelector(`div[data-id="${newActorId}"]`);
        
        // 在新位置创建一个新的Actor图像
        const newActorImg = document.createElement('img');
        newActorImg.src = `/static/img/img_memory/Actor_${direction}.png`;
        newActorImg.classList.add('overlay');
        
        // 加入新位置
        newGridItem.appendChild(newActorImg);
        
        // 更新当前Actor的位置
        actorX = newX;
        actorY = newY;
        actorId = newActorId; // 更新Actor ID数据
    } else {
        // 如果actor没有移动，只改变方向（图像）
        changeActorImage(direction);
    }
}

function check(){
    var wrong_n=coordinatesSet.size;
    for(var i=0;i<path.length;i++)
    {
        var isPresent = coordinatesSet.has([path[i][1],gridSize-1-path[i][0]].join(','));
        if(isPresent==true)wrong_n--;
    }
    return wrong_n;
}
// 添加键盘按下事件监听器
let isKeyPressed = false; // 记录按键是否处于按下状态
// 添加键盘事件监听器
function handleKeyDown(event) {
    if (isPaused || isKeyPressed) {
        return;
    }
    let newX = actorX;
    let newY = actorY;
    let direction = '';

    // 根据按键更新位置和方向
    switch (event.key) {
        case 'ArrowLeft': // 左键
            newX = Math.max(0, actorX - 1);
            direction = 'left';
            break;
        case 'ArrowRight': // 右键
            newX = Math.min(gridSize - 1, actorX + 1);
            direction = 'right';
            break;
        case 'ArrowUp': // 上键
            newY = Math.max(0, actorY - 1);
            direction = 'up';
            break;
        case 'ArrowDown': // 下键
            newY = Math.min(gridSize - 1, actorY + 1);
            direction = 'down';
            break;
        default:
            return; // 按下其他键时不处理
    }
    isKeyPressed = true; // 标记按键为按下状态
    updateActorPosition(newX, newY, direction); // 根据方向和新位置更新actor
    coordinatesSet.add([newX,newY].join(','));
    if(newX==gridSize-1&&newY==0){
        window.removeEventListener('keydown', handleKeyDown);
        highlightPath(path);
        // question_num++;
        var progress = (question_num / total_quest * 100).toFixed(0);
        // 更新进度条的宽度和进度值的文本
        progressBar.style.width = progress + '%';
        progressValue.innerHTML = progress + '%';
        // console.log(path);
        // console.log("--------------");
        // console.log(coordinatesSet);
        w_n=check();
        total_step+=w_n+path.length-2;
        console.log(total_step);
        console.log(correct_step);
        var correctRate = (correct_step / total_step * 100).toFixed(0); 
        correct_ratio.style.setProperty('--progress', correctRate + '%');
        correct_ratio.dataset.progress = correctRate + '%';
        index_off_record();
            setTimeout(function() {
                actorX = 0;  // Actor 的 X 坐标
                actorY = gridSize - 1;  // Actor 的 Y 坐标
                main();
            },3000);
    }
    // console.log(newY);
    // 阻止默认的箭头键行为（如滚动页面）
    event.preventDefault();
}

// 添加键盘松开事件监听器
function handleKeyUp(event) {
    isKeyPressed = false; // 标记按键为松开状态
}
window.addEventListener('keyup', handleKeyUp);
window.removeEventListener('keydown', handleKeyDown);

function generatePath(gridSize) {
    // 初始化起点（左下角）
    let x = 0;
    let y = 0; // 改为0开始，因为我们要从左下角开始
    // 记录路径坐标
    let path = [[x, y]];

    // 循环直到到达终点（右上角）
    while (x < gridSize - 1 || y < gridSize - 1) { // 修改循环条件以确保目标是右上角
        // 随机决定是向右还是向上移动
        if (x < gridSize - 1 && y < gridSize - 1) {
            // 既可以向右也可以向上
            if (Math.random() < 0.5) {
                x++; // 向右
            } else {
                y++; // 改为自增，向上移动
            }
        } else if (x < gridSize - 1) {
            // 只能向右
            x++;
        } else if (y < gridSize - 1) { // 修改条件以确保向上移动
            // 只能向上
            y++;
        }
        path.push([x, y]);
    }
    // console.log(path);

    return path;
}


function drawPath(path) {
    for (let i = 0; i < path.length - 1; i++){
        var xx=gridSize-1-path[i][0];
        var yy=path[i][1];
        // 计算新位置的ID
        var dir='';
        if(gridSize-1-path[i+1][0]<xx){
            dir='up';
        }
        else{
            dir='right';
        }
        const roadID = xx * gridSize + yy;
        
        // 获取新位置的网格项
        const newGridItem = gridContainer.querySelector(`div[data-id="${roadID}"]`);
        
        // 在新位置创建一个新的箭头图像
        const newNarrowImg = document.createElement('img');
        newNarrowImg.src = `/static/img/img_memory/${dir}.png`;
        newNarrowImg.classList.add('path-arrow');
        
        // 加入新位置
        newGridItem.appendChild(newNarrowImg);
        if(i==path.length - 2){
            // alert("nb");
            xx=gridSize-1-path[i+1][0];
            yy=path[i+1][1];
            if(xx<gridSize-1-path[i][0])
                dir='up';
            else
                dir='right';
            const roadID = xx * gridSize + yy;
            // console.log(roadID);
            // console.log(yy);
    
            // 获取新位置的网格项
            const newGridItem = gridContainer.querySelector(`div[data-id="${roadID}"]`);
            
            // 在新位置创建一个新的箭头图像
            const newNarrowImg = document.createElement('img');
            newNarrowImg.src = `/static/img/img_memory/${dir}.png`;
            newNarrowImg.classList.add('path-arrow');
            
            // 加入新位置
            newGridItem.appendChild(newNarrowImg);
        }
    }
    // 设置在3秒后移除路径上的箭头
    setTimeout(function() {
        // 选取所有路径上的箭头图像
        const pathArrows = gridContainer.querySelectorAll('img.path-arrow');
        // 遍历这些箭头图像并从DOM中移除它们
        pathArrows.forEach(function(arrow) {
            arrow.remove();
        });
    }, 3000); // 设置3000毫秒后执行，即3秒
}

function drawLinePath(path) {
    if (path.length < 2) return; // 如果路径上的点少于两个，则无法绘制线路

    // 创建SVG元素以绘制线段
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'path-svg');
    svg.setAttribute('width', gridContainer.clientWidth);
    svg.setAttribute('height', gridContainer.clientHeight);
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';

    // 得到格子的大小，请根据实际情况调整
    const gridSizePx = 100; // 格子的宽高为100px

    // 遍历路径点，画线
    for (let i = 0; i < path.length - 1; i++) {
        const start = path[i];
        const end = path[i + 1];

        // 计算起始点和结束点的中心坐标
        const startX = start[1] * gridSizePx + gridSizePx / 2;
        const startY = (gridSize - 1 - start[0]) * gridSizePx + gridSizePx / 2;
        const endX = end[1] * gridSizePx + gridSizePx / 2;
        const endY = (gridSize - 1 - end[0]) * gridSizePx + gridSizePx / 2;

        // 创建线段
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', startX);
        line.setAttribute('y1', startY);
        line.setAttribute('x2', endX);
        line.setAttribute('y2', endY);
        line.setAttribute('stroke', 'blue'); // 线条颜色
        line.setAttribute('stroke-width', '3'); // 线条宽度

        // 将线段添加到SVG中
        svg.appendChild(line);
    }

    // 将SVG添加到网格容器中
    gridContainer.appendChild(svg);
    setTimeout(function() {
        const pathSvg = document.querySelector('.path-svg'); // 通过类名选择SVG元素
        if (pathSvg) {
            pathSvg.remove(); // 从DOM中移除SVG元素
        }
    }, 3000); // 在3秒后执行
}


function highlightPath(path) {
    // 遍历路径上的每个坐标点
    path.forEach(function(coord) {
        const x = gridSize-1-coord[0];
        const y = coord[1];
        const gridItemId = x * gridSize + y; // 假设 path 是 x, y 坐标的数组

        // 找到对应的网格项，并添加红色边框
        const gridItem = gridContainer.querySelector(`div[data-id="${gridItemId}"]`);
        if (gridItem) {
            gridItem.classList.add('red-border');
        }
    });
}

function main(){
    // 调用生成网格的函数并传入网格大小参数
    // alert("进入！");
    if(question_num==total_quest){
        index_save();
        alert("恭喜您完成训练任务！");
    }
    else{
        // mark_save=[];
        trial_data = {
            'Trial': question_num++,
            'type':'road',
            'wrong_num': 0,
            'StimulusOnsetIndex': 0,
            'StimulusOffsetIndex': 0,
        }
        index_on_record();
        path=[];
        coordinatesSet.clear();
        coordinatesSet.add([actorX,actorY].join(','));   
        generateGrid(gridSize); // 生成 4 x 4 的网格
        path = generatePath(gridSize); // 产生路径
        // drawPath(path); // 绘制路径
        drawLinePath(path);
        correct_step+=path.length-2;
        // console.log(path.length);

        // 设置定时器在3秒后再添加键盘事件监听器
        setTimeout(function() {
            window.addEventListener('keydown', handleKeyDown);
        }, 3000); // 3秒后执行
    }
}


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



window.onload = function() {
    main();
    
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
        trial_data['wrong_num']=w_n;
        mark_save.push(trial_data);
        return data // 返回数据给调用者

    } catch (error) {
        console.error('EEG数据获取失败', error);
        throw error; // 抛出错误给调用者
    }
}