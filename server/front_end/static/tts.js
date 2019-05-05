function tts() {
    var msg = new SpeechSynthesisUtterance('Welcome to LliveTracker.  Press tab then enter your tracking numbers separated by spaces and hit Enter to continue.');
    window.speechSynthesis.speak(msg);
}

function ttsMap() {
    var msg = new SpeechSynthesisUtterance('You have entered one tracking number. Your package is currently in transit near 1599 Outer Circle Road, University of Toronto Mississauga.');
    window.speechSynthesis.speak(msg);
}
