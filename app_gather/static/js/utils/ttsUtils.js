let voices
let synth

async function getVoicesAsync () {
    return new Promise(resolve => {
        synth.onvoiceschanged = e => {
          resolve(synth.getVoices());
        }
        synth.getVoices();
      })
}

export async function initSpeak() {
    synth = window.speechSynthesis
    voices = await getVoicesAsync()
    for (let i = 0; i < voices.length; i++) {
      if (voices[i].lang == 'zh-CN') 
        console.log(voices[i].name + ' ' + voices[i].lang + ' ' + voices[i].localService)
    }
} 

export function speakVoice(msg) {
    const utter = new SpeechSynthesisUtterance(msg)
    utter.voice = voices.filter(function (voice) {
        return voice.lang == 'zh-CN'
    })[7]
    utter.pitch = 1
    utter.rate = 1
    utter.volume = 1
    
    synth.speak(utter)
}