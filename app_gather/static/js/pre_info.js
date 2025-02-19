 window.onload = function () {
            // 在这里可以进行页面加载后的其他操作

            // 弹出小窗口
            setTimeout(function () {
                // 创建一个弹窗
                let popupWindow = window.open("", "小窗口", "width=400,height=300");

                // 在小窗口中填入数据
                if (popupWindow) {
                    popupWindow.document.write("<p>填入的数据: " + session + "</p>");
                }
            }, 1000); // 1000毫秒（1秒）后执行，你可以根据需要调整时间
        };