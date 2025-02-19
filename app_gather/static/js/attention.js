
var btg = document.getElementById("battleground");
btg.style.backgroundImage = "url('/static/img/img_attention/bg_1." + map_id + ".png')";
var car = document.getElementById("car");
car.src = "/static/img/img_attention/car_" + car_id + ".png";
var battlegroundWidth = document.getElementById("battleground").offsetWidth;
var carPosition = battlegroundWidth / 2;
car.style.left = carPosition + "px"; // 更新小车的 left 属性
car.style.top = (window.innerHeight - parseInt(car.offsetHeight)) + "px";
var isGameRunning=false// 标记游戏是否正在运行
var isMoving = false; // 标记小车是否正在移动
var canvas = document.getElementById("myCanvas");
var parent = canvas.parentNode;
canvas.width = parent.offsetWidth;
canvas.height = parent.offsetHeight;
var battlegroundWidth = document.getElementById("battleground").offsetWidth;
var atd=document.getElementById("atd");
var cod=document.getElementById("cod");
var speed;
var Carsp;
var mark_save=[];
var exp="attention";
var deviation=0;
let trial_data = {
    'type': "card",
    'deviation':0,
    'missed_coin':0,
    'StimulusOnsetIndex': 0,
    'StimulusOffsetIndex': 0
}
if(level==1)
{
    speed=1;
    Carsp=2;
}
else if(level==2)
{
    speed=2;
    Carsp=3;
}
else
{
    speed=3;
    Carsp=4;
}
// console.log(car.style.top)
function handleKeyDown(event) {
    // 只处理左右箭头键
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault(); // 阻止默认行为（避免滚动页面）
        if (!isMoving) {
            isMoving = true;
            moveCar(event.key); // 开始移动小车
        }
    }
}

function handleKeyUp(event) {
    // 只处理左右箭头键
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        isMoving = false;
    }
}

function moveCar(direction) {
    var offset = direction === "ArrowLeft" ? -Carsp : Carsp; // 根据按键确定移动方向和速度
    carPosition += offset; // 更新小车位置
    car.style.left = carPosition + "px"; // 更新小车的 left 属性
    car.style.top = window.innerHeight-car.style.offsetHeight;
    if (isMoving) {
        requestAnimationFrame(function() {
            moveCar(direction); // 使用 requestAnimationFrame 实现平滑移动
        });
    }
}


function createCoin(posX, posY) {
    var Coin = document.createElement("div");
    Coin.style.position = "absolute";
    // Coin.style.zIndex = 9999;
    Coin.style.width = "60px"; // 设置容器宽度为 20px
    Coin.style.height = "50px"; // 设置容器高度为 20px
    Coin.style.background = "url(/static/img/img_attention/heart.png )"; // 设置背景图片
    Coin.style.backgroundSize = "cover"; // 设置背景图片大小为 cover

    // 设置 Coin 元素的位置，直接使用给定的坐标
    Coin.style.left = posX-30 + "px";
    Coin.style.top = posY -25+ "px";

    btg.appendChild(Coin);
    Coin.destroy = function() {
        btg.removeChild(Coin);
    };
    return Coin;
}
//碰撞检测
function carCollide(heart) {
	var hLeft = parseInt(heart.style.left); // 物体左边界距离
    var hTop = parseInt(heart.style.top); // 物体上边界距离
    var hHeight = 50; // 物体高度
    var hWidth = 60; // 物体宽度

    var mLeft = parseInt(car.style.left); // 小车左边界距离
    var mTop = parseInt(car.style.top); // 小车上边界距离
    var mHeight = parseInt(car.offsetHeight); // 小车高度
    var mWidth = parseInt(car.offsetWidth); // 小车宽度
    
    if (hLeft+hWidth>mLeft&&
        hLeft<mLeft+mWidth&&
        hTop+hHeight>mTop&&
        hTop<mTop+mHeight) {
            return true;
        }
    return false;
}


var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
// 定义曲线对象
function Curve(startX, startY, endX, endY) {
    this.startPoint = { x: startX, y: startY };
    this.endPoint = { x: endX, y: endY };
    // 计算控制点的位置范围
    var minX = Math.min(this.startPoint.x, this.endPoint.x);
    var maxX = Math.max(this.startPoint.x, this.endPoint.x);
    var minY = Math.min(this.startPoint.y, this.endPoint.y);
    var maxY = Math.max(this.startPoint.y, this.endPoint.y);

    // 设置控制点的位置
    // console.log(canvas.width);
    this.controlPoint1 = { x:(Math.random() * (0.8 - 0.2) + 0.2 )* canvas.width, y: minY + Math.random() * (maxY - minY) };
    this.controlPoint2 = { x: (Math.random() * (0.8 - 0.2) + 0.2) * canvas.width, y: minY + Math.random() * (maxY - minY) };
    
    this.getAllPoints = function() {
        var points = [];
        for (var t = 0.05; t <= 1; t += 0.05) {
            var x = Math.pow(1 - t, 3) * this.startPoint.x + 3 * Math.pow(1 - t, 2) * t * this.controlPoint1.x + 3 * (1 - t) * Math.pow(t, 2) * this.controlPoint2.x + Math.pow(t, 3) * this.endPoint.x;
            var y = Math.pow(1 - t, 3) * this.startPoint.y + 3 * Math.pow(1 - t, 2) * t * this.controlPoint1.y + 3 * (1 - t) * Math.pow(t, 2) * this.controlPoint2.y + Math.pow(t, 3) * this.endPoint.y;
            points.push({ x: x, y: y });
        }
        return points;
    };

    // 绘制曲线
    this.draw = function() {
        ctx.beginPath();
        ctx.moveTo(this.startPoint.x, this.startPoint.y);
        ctx.bezierCurveTo(this.controlPoint1.x, this.controlPoint1.y, this.controlPoint2.x, this.controlPoint2.y, this.endPoint.x, this.endPoint.y);
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 6;
        ctx.stroke();
    };

    // 更新曲线的位置
    this.updatePosition = function(offsetY) {
        this.startPoint.y += offsetY;
        this.endPoint.y += offsetY;
        this.controlPoint1.y += offsetY;
        this.controlPoint2.y += offsetY;
    };
}

// 绘制曲线上的像素点
function drawPixels() {
    var allPixels = [];
    curves.forEach(function(curve) {
        allPixels = allPixels.concat(curve.getAllPoints());
    });
    allPixels.forEach(function(pixel) {
        ctx.fillStyle = "blue";
        ctx.beginPath();
        ctx.arc(pixel.x,pixel.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });

}

// 创建多个曲线对象
var battlegroundWidth = document.getElementById("battleground").offsetWidth;
var curves = [];
var tmp = 0;
var allPixels = [];
var coins = []
var zx=0


var Wh=window.innerHeight;
var debug=0;
var cnt=1;
var save_f=0;
function updatepoint() {
    // 获取小车头部中心点坐标
    var carCenterX = parseInt(car.style.left) + car.offsetWidth / 2;
    var carCenterY = parseInt(car.style.top) + car.offsetHeight;
    allPixels.forEach(function(pixel,index) {
        var before=pixel.y;
        var zeng=0
        
        pixel.y += speed; // 使用 += 更新像素点的 y 坐标
        if(before<=0&&pixel.y>=0){
            if(zx%8==0){
                var coin=createCoin(pixel.x,pixel.y);
                coins.push(coin);
            }
            zx++;
        }
        if(pixel.y>=Wh-car.offsetHeight)
        {
            zeng=Math.sqrt(Math.pow(carCenterX - pixel.x, 2) + Math.pow(carCenterY-pixel.y, 2));
            zeng=zeng/100;
            deviation+=zeng;
            if (index !== -1) {
                allPixels.splice(index, 1);
            }
            // if(debug==0)
            // {
            //     console.log(deviation);
            //     debug=1;
            // }
        }
        if(zeng!=0)
        {
            cnt++;
            cnt=cnt%16;
            save_f=0;
            atd.textContent="注意力偏差："+deviation.toFixed(2);
        }
        if(cnt%16==0&&save_f==0){
            save_f=1;
            index_off_record(0);
        }
    });
}
var coinmissed=0;
function updateCoin(){
    for(var i=0;i<coins.length;i++)
    {
        var currentTop = parseInt(coins[i].style.top); // 获取当前top值
        coins[i].style.top = currentTop + speed + "px"; // 更新top值
        var yorn=false;
        if(i==0||i==1){
            yorn=carCollide(coins[i]);
        }
        // if(yorn==true){
        // console.log(yorn);}
        if(yorn==true)
        {
            coins[i].style.display = "none";
            coins[i].destroy(); // 从 DOM 中删除相应的硬币元素
            coins.splice(i, 1); // 从数组中删除相应的硬币元素
            i--; // 因为删除了一个元素，需要调整索引
        }
        if (currentTop > window.innerHeight) {
            coins[i].destroy();
            coins.splice(i, 1);
            coinmissed++;
            cod.textContent="漏检金币数："+coinmissed;
            i--;
        }
    }
}



function scrollBackground() {
    var currentPosition = $('#battleground').css('background-position-y');
    var newPosition = parseInt(currentPosition) + speed;
    $('#battleground').css('background-position-y', newPosition + 'px');
    // 更新每条曲线的位置

    curves.forEach(function(curve) {
        curve.updatePosition(speed);
    });
    updatepoint();
    updateCoin();
    // console.log(tt.style.top)
    // 重新绘制所有曲线
    drawCurves();
    // 绘制曲线上的像素点
    // drawPixels();
}

// 绘制所有曲线
function drawCurves() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    curves.forEach(function(curve) {
        curve.draw();
    });
}




function reset(){
    atd.textContent="注意力偏差：0"
    cod.textContent="漏检金币数：0"
    car.style.left = carPosition + "px"; // 更新小车的 left 属性
    car.style.top = (window.innerHeight - parseInt(car.offsetHeight)) + "px";
    isGameRunning=false// 标记游戏是否正在运行
    curves = [];
    tmp = 0;
    for (var i = 0; i < 200; i++) {
        var endX = battlegroundWidth / 2;
        var endY = tmp;
        tmp -= 500;
        var startX = battlegroundWidth / 2;
        var startY = tmp;
        curves.push(new Curve(startX, startY, endX, endY));
    }
    allPixels = [];
    coins = []
    curves.forEach(function(curve) {
        allPixels = allPixels.concat(curve.getAllPoints());
});
}

reset();
document.addEventListener("DOMContentLoaded", function() {
    var controlButton = document.getElementById("controlButton");
    controlButton.addEventListener("click", function() {
        if (isGameRunning) {
            stopGame(); // 如果游戏正在运行，停止游戏
        } else {
            startGame(); // 如果游戏没有运行，开始游戏
        }
    });
});
var scrollTimer;
function startGame() {
    isGameRunning = true;
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
    trial_data = {
        'type': "car",
        'deviation':0,
        'missed_coin':0,
        'StimulusOnsetIndex': 0,
        'StimulusOffsetIndex': 0
    }
    index_on_record();
    // 每隔一段时间调用滚动背景函数
    scrollTimer = setInterval(scrollBackground, 10);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    controlButton.textContent = "暂停游戏"; // 更新按钮文本
}

function stopGame() {
    isGameRunning = false;
    index_off_record(0);
    clearInterval(scrollTimer); // 清除滚动背景函数的定时器
    document.removeEventListener("keydown", handleKeyDown); // 移除键盘按下事件监听器
    document.removeEventListener("keyup", handleKeyUp); // 移除键盘释放事件监听器
    controlButton.textContent = "开始游戏"; // 更新按钮文本
}

function restart(){
    // var carPosition = battlegroundWidth / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(var i=0;i<coins.length;i++)
    {
        coins[i].destroy();
    }
    mark_save=[]
    car.src = "/static/img/img_attention/car_" + car_id + ".png";
    controlButton.textContent = "开始游戏";
    clearInterval(scrollTimer); // 清除滚动背景函数的定时器
    document.removeEventListener("keydown", handleKeyDown); // 移除键盘按下事件监听器
    document.removeEventListener("keyup", handleKeyUp); // 移除键盘释放事件监听器
    reset();
}
// document.addEventListener("DOMContentLoaded", function() {
//     var restartButton = document.getElementById("Restart");
//     restartButton.addEventListener("click", function() {
//         restart();
//         mark_save=[];
//         deviation=0;
//         coinmissed=0;
//     });
// });
function Game_over()
{
    alert("恭喜您完成任务！");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(var i=0;i<coins.length;i++)
    {
        coins[i].destroy();
    }
    car.src = "/static/img/img_attention/car_" + car_id + ".png";
    controlButton.textContent = "开始游戏";
    clearInterval(scrollTimer); // 清除滚动背景函数的定时器
    document.removeEventListener("keydown", handleKeyDown); // 移除键盘按下事件监听器
    document.removeEventListener("keyup", handleKeyUp); // 移除键盘释放事件监听器
    reset();
    index_off_record(1);
    
}

document.addEventListener("DOMContentLoaded", function() {
    var OverButton = document.getElementById("Over");
    OverButton.addEventListener("click", function() {
        Game_over();    
    });
});


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
        trial_data['StimulusOnsetIndex'] = data.eeg_index;
        // update_para()
        return data // 返回数据给调用者

    } catch (error) {
        console.error('EEG数据获取失败', error);
        throw error; // 抛出错误给调用者
    }
}


async function index_off_record(save) {
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
        trial_data['deviation']=deviation;
        trial_data['missed_coin']=coinmissed;
        trial_data['StimulusOffsetIndex']=data.eeg_index;
        console.log(deviation);
        mark_save.push(trial_data);
        if(save==1){index_save(); mark_save=[];}
        trial_data = {
            'type': "car",
            'deviation':0,
            'missed_coin':0,
            'StimulusOnsetIndex': 0,
            'StimulusOffsetIndex': 0
        }
        index_on_record();
        return data // 返回数据给调用者
    } catch (error) {
        console.error('EEG数据获取失败', error);
        throw error; // 抛出错误给调用者
    }
}
setTimeout(Game_over, 10*60*1000);