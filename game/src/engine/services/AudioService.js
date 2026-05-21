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
}