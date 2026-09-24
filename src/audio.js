export class AudioDirector {
  constructor() {
    this.context = null;
    this.master = null;
    this.enabled = false;
  }

  async enable() {
    const unlocked = await this.unlock();
    this.enabled = unlocked;
    return unlocked;
  }

  disable() {
    this.enabled = false;
  }

  async unlock() {
    if (!this.context) {
      const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
      if (!AudioContextClass) {
        this.enabled = false;
        return false;
      }

      this.context = new AudioContextClass();
      this.master = this.context.createGain();
      this.master.gain.value = 0.55;
      this.master.connect(this.context.destination);
    }

    if (this.context.state === 'suspended') {
      await this.context.resume();
    }

    return this.context.state === 'running';
  }

  cue({ frequency = 220, duration = 0.5, volume = 0.01 } = {}) {
    if (!this.enabled || !this.context || this.context.state !== 'running' || !this.master) {
      return;
    }

    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.015, now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(this.master);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.04);
    oscillator.addEventListener('ended', () => {
      oscillator.disconnect();
      gain.disconnect();
    });
  }

  dispose() {
    this.enabled = false;
    this.master?.disconnect();
    this.context?.close();
    this.context = null;
    this.master = null;
  }
}
