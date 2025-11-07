import { Audio } from "expo-av";
import { MAX_AUDIO_DURATION } from "../constants/audioFiles";

export class AudioManager {
  private currentSound: Audio.Sound | null = null;
  private isPlaying: boolean = false;
  private isMuted: boolean = false;

  setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  async playSound(audio: any, maxDuration: number = MAX_AUDIO_DURATION): Promise<void> {
    if (this.isMuted || !audio) {
      return;
    }

    // Se já está tocando um som, não toca outro
    if (this.isPlaying) {
      console.log("Já há um som tocando, ignorando nova reprodução");
      return;
    }

    try {
      this.isPlaying = true;

      // Parar e descarregar o som anterior, se existir
      await this.stopCurrentSound();

      const { sound: newSound } = await Audio.Sound.createAsync(audio);
      this.currentSound = newSound;
      await newSound.playAsync();

      // Parar o som após a duração máxima
      setTimeout(async () => {
        try {
          const status = await newSound.getStatusAsync();
          if (status.isLoaded && status.isPlaying) {
            await newSound.stopAsync();
            await newSound.unloadAsync();
          }
          this.isPlaying = false;
        } catch (error) {
          console.log("Som já foi descarregado automaticamente");
          this.isPlaying = false;
        }
      }, maxDuration);
    } catch (error) {
      console.error("Erro ao tocar som:", error);
      this.isPlaying = false;
    }
  }

  async stopCurrentSound(): Promise<void> {
    if (this.currentSound) {
      try {
        const status = await this.currentSound.getStatusAsync();
        if (status.isLoaded) {
          if (status.isPlaying) {
            await this.currentSound.stopAsync();
          }
          await this.currentSound.unloadAsync();
        }
        this.isPlaying = false;
      } catch (error) {
        console.log("Som anterior já foi descarregado");
        this.isPlaying = false;
      }
    }
  }

  getPlayingState(): boolean {
    return this.isPlaying;
  }
}
