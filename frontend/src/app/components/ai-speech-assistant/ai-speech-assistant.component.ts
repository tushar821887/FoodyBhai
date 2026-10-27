import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AiSpeechService } from '../../services/ai-speech.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-ai-speech-assistant',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-speech-assistant.component.html',
  styleUrl: './ai-speech-assistant.component.css'
})
export class AiSpeechAssistantComponent {
  public speechService = inject(AiSpeechService);
  public cartService = inject(CartService);
  private router = inject(Router);

  // Observable proxies
  public isListening$ = this.speechService.isListening$;
  public transcript$ = this.speechService.transcript$;
  public assistantMessage$ = this.speechService.assistantMessage$;
  public isOpen$ = this.speechService.isOpen$;
  public isSpeaking$ = this.speechService.isSpeaking$;
  public language$ = this.speechService.language$;
  public isMuted$ = this.speechService.isMuted$;

  toggleAssistant() {
    this.speechService.toggleAssistant();
  }

  closeAssistant() {
    this.speechService.closeAssistant();
  }

  toggleListening() {
    this.speechService.toggleListening();
  }

  setLanguage(lang: 'en-IN' | 'hi-IN') {
    this.speechService.setLanguage(lang);
  }

  toggleMute() {
    this.speechService.toggleMute();
  }

  triggerQuickCommand(command: string) {
    this.speechService.transcript$.next(command);
    this.speechService.processVoiceCommand(command);
  }

  goToCheckout() {
    this.speechService.closeAssistant();
    this.router.navigate(['/cart']);
  }

  onBackdropClick(event: MouseEvent) {
    this.closeAssistant();
  }
}
