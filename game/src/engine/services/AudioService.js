// src/engine/services/AudioService.js

export class AudioService {
    constructor() {
        this.sounds = new Map();
        this.music = null;
    }

    async load(name, src) {
        if (this.sounds.has(name)) return this.sounds.get(name);

        const audio = new Audio();
        audio.src = src;

        await new Promise((resolve, reject) => {
            const onLoad = () => {
                cleanup();
                resolve();
            };
            const onError = (e) => {
                cleanup();
                reject(new Error(`Failed to load audio: ${src}`));
            };
            function cleanup() {
                audio.removeEventListener('canplaythrough', onLoad);
                audio.removeEventListener('error', onError);
            }

            audio.addEventListener('canplaythrough', onLoad);
            audio.addEventListener('error', onError);
        });

        this.sounds.set(name, audio);
        return audio;
    }

    play(name, { volume = 1, loop = false } = {}) {
        const sound = this.sounds.get(name);
        if (!sound) return;

        sound.currentTime = 0;
        sound.volume = volume;
        sound.loop = loop;

        sound.play();
    }

    playMusic(name, { volume = 0.5, loop = true } = {}) {
        if (this.music) {
            this.music.pause();
        }

        const music = this.sounds.get(name);
        if (!music) return;

        music.currentTime = 0;
        music.volume = volume;
        music.loop = loop;

        music.play();
        this.music = music;
    }

    stop(name) {
        const sound = this.sounds.get(name);
        if (!sound) return;

        sound.pause();
        sound.currentTime = 0;
    }

    stopAll() {
        for (const sound of this.sounds.values()) {
            sound.pause();
            sound.currentTime = 0;
        }
    }

    /**
     * Reproducir un efecto de sonido sintetizado usando Web Audio API
     * @param {string} type - 'shoot', 'hit', 'step', 'growl'
     * @param {Object} options - Opciones de tono, duración y volumen
     */
    playSynth(type, { frequency = 220, duration = 0.1, volume = 0.1 } = {}) {
        try {
            if (!this.audioCtx) {
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }

            const ctx = this.audioCtx;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            const now = ctx.currentTime;

            if (type === 'shoot') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(frequency * 2, now);
                osc.frequency.exponentialRampToValueAtTime(frequency * 0.2, now + duration);
                
                gain.gain.setValueAtTime(volume, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
                
                osc.start(now);
                osc.stop(now + duration);
            } else if (type === 'hit') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(frequency, now);
                osc.frequency.linearRampToValueAtTime(40, now + duration);
                
                gain.gain.setValueAtTime(volume, now);
                gain.gain.linearRampToValueAtTime(0.01, now + duration);
                
                osc.start(now);
                osc.stop(now + duration);
            } else if (type === 'step') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(frequency, now);
                osc.frequency.linearRampToValueAtTime(60, now + duration);
                
                gain.gain.setValueAtTime(volume, now);
                gain.gain.linearRampToValueAtTime(0.01, now + duration);
                
                osc.start(now);
                osc.stop(now + duration);
            } else if (type === 'growl') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(frequency, now);
                osc.frequency.linearRampToValueAtTime(frequency * 0.4, now + duration);
                
                gain.gain.setValueAtTime(volume, now);
                gain.gain.linearRampToValueAtTime(0.01, now + duration);
                
                osc.start(now);
                osc.stop(now + duration);
            } else {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(frequency, now);
                gain.gain.setValueAtTime(volume, now);
                gain.gain.linearRampToValueAtTime(0.01, now + duration);
                osc.start(now);
                osc.stop(now + duration);
            }
        } catch (e) {
            console.warn("Failed to play synthesized sound:", e);
        }
    }
}