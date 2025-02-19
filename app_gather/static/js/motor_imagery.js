import { advanceSetTimeout } from "./utils/advanceSetTimeout.js"
import { notifyVREndPoint, vrStart } from "./utils/vr.js"
import { HTTPPost } from "./utils/httpUtils.js"
import { initSpeak, speakVoice } from "./utils/ttsUtils.js"

const startListeningButton = document.getElementById('startListeningButton')
const bar = document.getElementById('bar')
const progressElement = document.querySelector(".progress-value")
const popup = document.getElementById('popup')

let loop = 40
let loop_count = 0
let isPaused = false
let isStartGame = false
let mark_save = []
let curTimeOut = undefined

function init() {
    loop_count = 0
    updateProgress()
    console.log('初始化成功')
}

function updateProgress() {
    const result = Math.round((loop_count / loop) * 100)
    bar.style.width = result + "%"
    progressElement.textContent = result + "%"
}

function showMotor(motorID) {
    if (srcOrContainer === 'src') {
        document.getElementById('cueContainerImg').src = cueContainer[motorID]
        document.getElementById('cueContainerImg').style.visibility = 'visible'
    } else if (srcOrContainer === 'container') {
        for (let i = 0; i < cueContainer.length; i++)
            if (i !== motorID)
                document.getElementById(cueContainer[i]).style.display = 'none'
        document.getElementById(cueContainer[motorID]).style.display = 'block'
    } else {
        console.error('srcOrContainer参数错误')
    }
}

function voiceAnnouncement(motorID) {
    if (voiceOption === 'tts') 
        speakVoice(cueHint[motorID].substring(0, cueHint[motorID].length - 2))
    else if (voiceOption === 'ttsHint')
        speakVoice(speakHint[motorID])
    else if (voiceOption === 'audio')
         document.getElementById('audio' + motorID).play()
    else if (voiceOption === 'none')
        console.log('不播放语音提示')
    else
        console.error('voiceOption参数错误')
}

function hiddenMotorCur() {
    if (srcOrContainer === 'container') {
        for (let i = 0; i < cueContainer.length; i++) {
            document.getElementById(cueContainer[i]).style.display = 'none'
        }
    } else if (srcOrContainer === 'src') {
        document.getElementById('cueContainerImg').style.visibility = 'hidden'
    } else {
        console.error('srcOrContainer参数错误')
    }
}

function cue() {
    let randomIndex = Math.floor(Math.random() * motorArray.length)
    randomIndex = (loop_count - 1) % motorArray.length
    let curMotor = motorArray[randomIndex]
    let hintText = document.getElementById('hintText')
    hintText.textContent = cueHint[randomIndex]
    notifyVREndPoint('imagery', curMotor, loop, loop_count)
    showMotor(randomIndex)
    voiceAnnouncement(randomIndex)
    curTimeOut = advanceSetTimeout(() => {
        imagery(randomIndex)
    }, 2000)
}

function imagery(motorID) {
    let hintText = document.getElementById('hintText')
    hiddenMotorCur();
    let motor = motorArray[motorID]
    hintText.textContent = motorHint[motorID]
    getEEGIndex().then((eegIndex) => {
        mark_save.push({
            'satrtImagerIndex': eegIndex,
            'motorType': motor,
        })
    })
    curTimeOut = advanceSetTimeout(() => {
        rest()
    }, 5000)
}

function rest() {
    let hintText = document.getElementById('hintText')
    hintText.textContent = '请休息'
    curTimeOut = advanceSetTimeout(() => {
        nextTrial()
    }, 5000)
}

function finish() {
    hiddenMotorCur();
    hintText.textContent = '实验结束'
    dataSave()
}

function nextTrial() {
    updateProgress()
    loop_count++
    if (loop_count <= loop) {
        cue()
    } else {
        finish()
    }
}

window.onload = function () {
    hiddenMotorCur();
    init()
    initSpeak()

    // 监听键盘事件
    document.addEventListener('keydown', (event) => {
        if (!isStartGame) {
            const key = event.key
            if (key === ' ') {
                document.getElementById('startListeningButton').style.display = 'block'
                document.getElementById('restartButton').style.display = 'block'
                document.getElementById('endButton').style.display = 'block'
                console.log('开始实验')
                nextTrial()
                isStartGame = true
            }
        }
    })

    
// 绑定按钮点击事件到切换监听状态的函数
    startListeningButton.addEventListener('click', function (){
        if (isStartGame) {
            isPaused = !isPaused
            isPaused ? curTimeOut.pause() : curTimeOut.start()
            startListeningButton.textContent = !isPaused ? '暂停' : '继续'
            document.getElementById('popup').showPopup()
            //console.log(`键盘监听已${!isPaused ? '启动' : '停止'}`)
        }
    })

    
    popup.onConfirm = function() {
        isPaused = !isPaused
        isPaused ? curTimeOut.pause() : curTimeOut.start()
        startListeningButton.textContent = !isPaused ? '暂停' : '继续'
    }

    document.getElementById('endButton').addEventListener('click', function () {
        dataSave()
    })

    document.getElementById('startvr').addEventListener('click', function () {
        vrStart()
    })
}



// 脑电mark保存
function dataSave() {
    fetch('/eeg/index/save', {
        method: 'POST', headers: {
            'X-CSRFToken': getCookie('csrftoken'), // 替换为你的CSRF令牌获取方式
            'Content-Type': 'application/json',
        }, body: JSON.stringify({
            "mark_save": mark_save, "name": userName, "exp_name": exp, "session": session
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Backend tool response:', data)
        // 在这里处理后台工具类的响应
    })
    .catch(error => {
        // console.error('Error calling backend tool:', error)
    })
}


// 辅助函数，用于获取cookie
function getCookie(name) {
    let cookieValue = null
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';')
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim()
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
                break
            }
        }
    }
    return cookieValue
}

// 脑电mark
async function getEEGIndex() {
    try {
        const response = await fetch('/eeg/index/record', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'), // 替换为你的CSRF令牌获取方式
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            }),
        })

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()
        //console.log(' onset Backend tool response:', data)

        return data.eeg_index // 返回数据给调用者

    } catch (error) {
        console.error('EEG数据获取失败', error)
        throw error // 抛出错误给调用者
    }
}
