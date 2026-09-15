/**
 * Speech Engine Manager for Lexi Voice Agent
 * Orchestrates Speech Synthesis (TTS) and Speech Recognition (STT)
 */
class SpeechEngine {
  constructor(options = {}) {
    this.onStateChange = options.onStateChange || (() => {});
    this.onTranscript = options.onTranscript || (() => {});
    this.onError = options.onError || (() => {});
    this.onVolumeChange = options.onVolumeChange || (() => {});

    this.synth = window.speechSynthesis;
    this.recognition = null;
    this.isListening = false;
    this.isSpeaking = false;
    this.selectedVoice = null;
    this.availableVoices = [];
    this.speechRate = 1.0;
    this.speechPitch = 1.05;

    this.initRecognition();
    this.initVoices();
  }

  initVoices() {
    if (!this.synth) return;
    const loadVoices = () => {
      this.availableVoices = this.synth.getVoices();
      // Select best natural English voice
      const preferred = [
        'Google UK English Female',
        'Google US English',
        'Microsoft Jenny Online (Natural)',
        'Microsoft Aria Online (Natural)',
        'Samantha',
        'Victoria',
        'Karen',
        'en-US',
        'en-GB'
      ];
      for (const name of preferred) {
        const found = this.availableVoices.find(v => 
          v.name.includes(name) || v.lang.startsWith(name)
        );
        if (found) {
          this.selectedVoice = found;
          break;
        }
      }
      if (!this.selectedVoice && this.availableVoices.length > 0) {
        this.selectedVoice = this.availableVoices.find(v => v.lang.startsWith('en')) || this.availableVoices[0];
      }
    };

    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  initRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      console.warn("SpeechRecognition is not supported in this browser. Fallback input available.");
      return;
    }

    try {
      this.recognition = new SpeechRec();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.isStarting = false;
        this.onStateChange('listening');
      };

      this.recognition.onresult = (event) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += transcript;
          } else {
            interimText += transcript;
          }
        }

        this.onTranscript({
          interim: interimText,
          final: finalText,
          isFinal: finalText.trim().length > 0
        });
      };

      this.hasNetworkError = false;

      this.recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === 'no-speech') {
          // Do not abruptly drop on momentary silence
          return;
        }
        if (event.error === 'network') {
          this.hasNetworkError = true;
        }
        this.isListening = false;
        this.isStarting = false;
        this.onError(event.error);
        if (!this.isSpeaking) {
          this.onStateChange('idle');
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.isStarting = false;
        if (!this.isSpeaking) {
          this.onStateChange('idle');
        }
      };
    } catch (e) {
      console.error("Failed to initialize speech recognition:", e);
    }
  }

  isRecognitionSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  startListening() {
    if (this.hasNetworkError) {
      this.onError('network');
      return;
    }

    if (this.isSpeaking) {
      this.stopSpeaking();
    }

    if (!this.recognition) {
      this.initRecognition();
    }

    if (this.recognition && !this.isListening && !this.isStarting) {
      try {
        this.isStarting = true;
        this.recognition.start();
      } catch (err) {
        console.warn("Recognition already started or starting:", err);
        this.isStarting = false;
      }
    } else if (!this.recognition) {
      this.onError("Speech recognition not supported in this environment. You can use the quick-response chips or text input!");
    }
  }

  stopListening() {
    this.isStarting = false;
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn("Stop error:", err);
      }
    }
    this.isListening = false;
  }

  speak(text, options = {}) {
    if (!this.synth) {
      console.warn("Speech synthesis unavailable.");
      if (options.onEnd) options.onEnd();
      return;
    }

    // Stop current speech or listening
    this.stopListening();
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.rate = options.rate || this.speechRate;
    utterance.pitch = options.pitch || this.speechPitch;

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.onStateChange('speaking');
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.onStateChange('idle');
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (e) => {
      console.warn("TTS Error:", e);
      this.isSpeaking = false;
      this.onStateChange('idle');
      if (options.onError) options.onError(e);
    };

    this.synth.speak(utterance);
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    this.onStateChange('idle');
  }

  setVoice(voiceName) {
    const voice = this.availableVoices.find(v => v.name === voiceName);
    if (voice) {
      this.selectedVoice = voice;
    }
  }

  getVoices() {
    return this.availableVoices.length > 0 ? this.availableVoices : (this.synth ? this.synth.getVoices() : []);
  }
}
