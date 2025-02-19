document.getElementById('eegConnectStart').addEventListener('click', function () {
    fetch('/eeg/connect', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'), // CSRF令牌，从cookie中获取
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            // 这里可以放一些发送到后端的数据s
        })
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            console.log(data); // 处理返回的数据
        });
});

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