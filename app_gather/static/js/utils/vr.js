export function notifyVREndPoint(type, motor, total, iteration) {
    let message = makeMessage(type, motor, total, iteration)
    sendVRController(message)
}

export function vrStart() {
    fetch('/addons/vr_start', {
        method: 'GET', headers: {
            'X-CSRFToken': getCookie('csrftoken'), // 替换为你的CSRF令牌获取方式
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        //console.log('Backend tool response:', data)
    })
    .catch(error => {
    })
}

function makeMessage(type, motor, total, iteration) {
    return JSON.stringify({
        type: type,
        motor: motor,
        total: total,
        iteration: iteration
    })
}

function sendVRController(message) {
    fetch('/addons/vr_controller', {
        method: 'POST', headers: {
            'X-CSRFToken': getCookie('csrftoken'), // 替换为你的CSRF令牌获取方式
            'Content-Type': 'application/json',
        }, body: message
    })
    .then(response => response.json())
    .then(data => {
        //console.log('Backend tool response:', data)
    })
    .catch(error => {
    })
}

