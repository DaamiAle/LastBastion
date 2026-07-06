import { sound } from '@pixi/sound';

export class SoundManager {
    static init() {
        sound.volumeAll = 0.5; // Default volume
    }

    static play(alias) {
        if (!sound.exists(alias)) return;
        sound.play(alias);
    }

    static stop(alias) {
        if (!sound.exists(alias)) return;
        sound.stop(alias);
    }
    
    static setVolume(volume) {
        sound.volumeAll = volume;
    }
}
