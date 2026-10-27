import { Component, inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AiSpeechService, ChatMessage } from '../../services/ai-speech.service';
import { CartService } from '../../services/cart.service';
import { Recipe } from '../../services/recipe.service';

@Component({
  selector: 'app-ai-speech-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-speech-assistant.component.html',
  styleUrl: './ai-speech-assistant.component.css'
})
export class AiSpeechAssistantComponent implements AfterViewChecked {
  public speechService = inject(AiSpeechService);
  public cartService = inject(CartService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  @ViewChild('chatScrollContainer') private scrollContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('textInputField') private textInputField?: ElementRef<HTMLInputElement>;

  // Observables
  public isListening$ = this.speechService.isListening$;
  public interimTranscript$ = this.speechService.interimTranscript$;
  public isThinking$ = this.speechService.isThinking$;
  public isOpen$ = this.speechService.isOpen$;
  public isSpeaking$ = this.speechService.isSpeaking$;
  public language$ = this.speechService.language$;
  public isMuted$ = this.speechService.isMuted$;
  public messages$ = this.speechService.messages$;

  // Local state
  public inputText: string = '';
  public isFullscreen: boolean = false;
  private shouldScrollToBottom: boolean = false;

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  toggleAssistant() {
    this.speechService.toggleAssistant();
    this.shouldScrollToBottom = true;
    setTimeout(() => {
      this.focusInput();
    }, 200);
  }

  closeAssistant() {
    this.speechService.closeAssistant();
  }

  toggleListening() {
    this.speechService.toggleListening();
  }

  stopListening() {
    this.speechService.stopListening();
  }

  setLanguage(lang: 'en-IN' | 'hi-IN') {
    this.speechService.setLanguage(lang);
  }

  toggleMute() {
    this.speechService.toggleMute();
  }

  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
  }

  clearMessages() {
    this.speechService.clearMessages();
  }

  onSendText() {
    if (!this.inputText.trim()) return;
    const text = this.inputText.trim();
    this.inputText = '';
    this.speechService.sendTextMessage(text);
    this.shouldScrollToBottom = true;
  }

  triggerQuickCommand(command: string) {
    this.speechService.sendTextMessage(command);
    this.shouldScrollToBottom = true;
  }

  quickAddRecipe(recipe: Recipe) {
    this.speechService.increaseItemQuantity(recipe);
    this.shouldScrollToBottom = true;
  }

  increaseQuantity(recipe: Recipe) {
    this.speechService.increaseItemQuantity(recipe);
    this.shouldScrollToBottom = true;
  }

  decreaseQuantity(recipe: Recipe) {
    this.speechService.decreaseItemQuantity(recipe);
    this.shouldScrollToBottom = true;
  }

  getItemQuantity(recipe: Recipe): number {
    const items = this.cartService.getItems();
    const item = items.find(i => (i.recipe.id || i.recipe._id) == (recipe.id || recipe._id));
    return item ? item.quantity : 1;
  }

  goToCheckout() {
    this.speechService.closeAssistant();
    this.router.navigate(['/cart']);
  }

  onBackdropClick(event: MouseEvent) {
    this.closeAssistant();
  }

  formatMessage(text: string): SafeHtml {
    if (!text) return '';
    const formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
    return this.sanitizer.bypassSecurityTrustHtml(formatted);
  }

  private scrollToBottom() {
    try {
      if (this.scrollContainer && this.scrollContainer.nativeElement) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch {}
  }

  private focusInput() {
    try {
      if (this.textInputField && this.textInputField.nativeElement) {
        this.textInputField.nativeElement.focus();
      }
    } catch {}
  }
}
