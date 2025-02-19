class globalPopup extends HTMLElement {
	constructor() {
		super();
		const shadowRoot = this.attachShadow({ mode: 'open' })
		shadowRoot.innerHTML = this.template()
	}

	template() {
		return `
			<div id="overlay">
                <div class="popup">
                    <p class="popup_title">提示</p>
                    <p class="popup_content">训练暂停中</p>
                    <div class="popup_btn">
                    <button class="confirmBtn">继续</button>
                    </div>
                </div>
            </div>
            <style>
                /* 遮罩层 */
                #overlay {
                    position: fixed;
                    left: 0px;
                    top: 0px;
                    width: 100%;
                    height: 100%;
                    font-size: 16px;
                    /* IE9以下不支持rgba模式 */
                    background-color: rgba(0, 0, 0, 0.5);
                    /* 兼容IE8及以下 */
                    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr=#7f000000,endColorstr=#7f000000);
                    display: none;
                }
                /* 弹出框主体 */
                .popup {
                    background-color: #ffffff;
                    max-width: 400px;
                    min-width: 200px;
                    height: 240px;
                    border-radius: 5px;
                    margin: 100px auto;
                    text-align: center;
                }
                /* 弹出框的标题 */
                .popup_title {
                    height: 60px;
                    line-height: 60px;
                    border-bottom: solid 1px #cccccc;
                }
                /* 弹出框的内容 */
                .popup_content {
                    height: 50px;
                    line-height: 50px;
                    padding: 15px 20px;
                }
                /* 弹出框的按钮栏 */
                .popup_btn {
                    padding-bottom: 10px;
                }
                /* 弹出框的按钮 */
                .popup_btn button {
                    color: #778899;
                    width: 40%;
                    height: 40px;
                    cursor: pointer;
                    border: solid 1px #cccccc;
                    border-radius: 5px;
                    margin: 5px 10px;
                    color: #ffffff;
                    background-color: #337ab7;
                }

            </style>
		`
	}

	connectedCallback() {
        this.shadowRoot.querySelector('.confirmBtn').addEventListener('click', () => this.hidePopup())
		//console.log('popup element is connected')
	}

	disconnectedCallback() {
        this.shadowRoot.querySelector('.confirmBtn').removeEventListener('click', () => this.hidePopup())
	}

	adoptedCallback() {
	}

	attributeChangedCallback() {
	}

    hidePopup() {
        const overlay = this.shadowRoot.getElementById("overlay")
        overlay.style.display = "none"
        this.onConfirm()
    }

    showPopup() {
        const overlay = this.shadowRoot.getElementById("overlay")
        overlay.style.display = "block"
    }

    onConfirm() {
    }
}
customElements.define('global-popup', globalPopup)
