import { sound } from '@pixi/sound';

export class SoundManager {
    static currentAmbience = 1;
    static ambienceInstance = null;
    static isAmbiencePlaying = false;

    static musicVolume = 0.5;
    static fxVolume = 0.5;

    static init() {
        sound.volumeAll = 1.0; 
        try {
            const savedMusic = localStorage.getItem('bastion-music-vol');
            const savedFx = localStorage.getItem('bastion-fx-vol');
            if (savedMusic !== null) this.musicVolume = parseFloat(savedMusic);
            if (savedFx !== null) this.fxVolume = parseFloat(savedFx);
        } catch (e) {}
    }

    static play(alias, options = {}) {
        if (!sound.exists(alias)) return null;
        
        const isMusic = alias.startsWith('ambience');
        const baseVolume = options.volume !== undefined ? options.volume : 1.0;
        options.volume = baseVolume * (isMusic ? this.musicVolume : this.fxVolume);
        
        return sound.play(alias, options);
    }

    static stop(alias) {
        if (!sound.exists(alias)) return;
        sound.stop(alias);
    }

    static startAmbience() {
        if (this.isAmbiencePlaying) return;
        this.isAmbiencePlaying = true;
        this.currentAmbience = 1;
        this._playNextAmbience();
    }

    static stopAmbience() {
        this.isAmbiencePlaying = false;
        if (this.ambienceInstance) {
            this.ambienceInstance.stop();
            this.ambienceInstance = null;
        }
    }

    static _playNextAmbience() {
        if (!this.isAmbiencePlaying) return;
        
        const track = `ambience_${this.currentAmbience}`;
        if (!sound.exists(track)) return;

        sound.play(track, {
            volume: 0.35 * this.musicVolume,
            complete: () => {
                if (!this.isAmbiencePlaying) return;
                this.currentAmbience = this.currentAmbience === 1 ? 2 : 1;
                this._playNextAmbience();
            }
        }).then(instance => {
            this.ambienceInstance = instance;
        }).catch(err => {
            console.error("Error playing ambience:", err);
        });
    }
    static setMusicVolume(vol) {
        this.musicVolume = vol;
        try { localStorage.setItem('bastion-music-vol', vol.toString()); } catch (e) {}
        
        if (this.ambienceInstance) {
            this.ambienceInstance.volume = 0.35 * this.musicVolume;
        }
    }

    static setFxVolume(vol) {
        this.fxVolume = vol;
        try { localStorage.setItem('bastion-fx-vol', vol.toString()); } catch (e) {}
    }
}
