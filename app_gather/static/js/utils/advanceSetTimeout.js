export function advanceSetTimeout(callback, delay) {
    let remainTime = delay;
    let isRunning = false;
    let setTimeoutId;
    let startTime;

    function pause() {
        if (isRunning) {
            isRunning = false;
            window.clearTimeout(setTimeoutId);
            remainTime -= new Date() - startTime;
        }
    }

    function start() {
        if (!isRunning) {
            startTime = new Date();
            setTimeoutId = window.setTimeout(callback, remainTime);
            isRunning = true;
        }
    }

    start();

    return {
        pause,
        start
    };
}