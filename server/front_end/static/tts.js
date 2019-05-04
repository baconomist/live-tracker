function tts() {
    var msg = new SpeechSynthesisUtterance('Welcome to LiveTracker.  Press tab then enter your tracking numbers separated by spaces and hit Enter to continue.');
    window.speechSynthesis.speak(msg);
}
