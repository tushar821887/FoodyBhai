import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';
import { WebsiteTheme, THEME_PRESETS } from '../../models/theme.model';

@Component({
  selector: 'app-theme-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './theme-manager.component.html',
  styleUrl: './theme-manager.component.css'
})
export class ThemeManagerComponent implements OnInit {
  presets: WebsiteTheme[] = THEME_PRESETS;
  activeTheme!: WebsiteTheme;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  private themeService = inject(ThemeService);

  ngOnInit() {
    // Clone current theme
    const current = this.themeService.getCurrentTheme();
    this.activeTheme = JSON.parse(JSON.stringify(current || THEME_PRESETS[0]));
    
    // Also listen for theme changes
    this.themeService.currentTheme$.subscribe(t => {
      if (t && !this.isSaving) {
        this.activeTheme = JSON.parse(JSON.stringify(t));
      }
    });
  }

  selectPreset(preset: WebsiteTheme) {
    this.activeTheme = JSON.parse(JSON.stringify(preset));
    this.activeTheme.isCustom = false;
    this.showQuickFeedback(`Applied "${preset.name}" preset to preview!`);
  }

  isCurrentPreset(preset: WebsiteTheme): boolean {
    if (!this.activeTheme) return false;
    return this.activeTheme.primaryColor === preset.primaryColor &&
           this.activeTheme.secondaryColor === preset.secondaryColor &&
           this.activeTheme.gradientStart === preset.gradientStart;
  }

  onCustomColorChange() {
    this.activeTheme.isCustom = true;
    this.activeTheme.name = 'Custom Brand Theme';

    // Auto-derive light background and border if primary changed
    if (!this.activeTheme.primaryLight || !this.activeTheme.isCustom) {
      this.activeTheme.primaryLight = this.deriveLightShade(this.activeTheme.primaryColor, 0.94);
      this.activeTheme.primaryBorder = this.deriveLightShade(this.activeTheme.primaryColor, 0.75);
    }
  }

  publishTheme() {
    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.themeService.saveTheme(this.activeTheme).subscribe({
      next: () => {
        this.isSaving = false;
        this.successMessage = '🎉 Theme successfully published to live website! All visitors will see these colors instantly.';
        setTimeout(() => this.successMessage = '', 6000);
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = 'Failed to publish theme. Please ensure you are logged in as admin.';
        console.error(err);
      }
    });
  }

  resetToDefault() {
    this.activeTheme = JSON.parse(JSON.stringify(THEME_PRESETS[0]));
    this.publishTheme();
  }

  get liveGradient(): string {
    const angle = this.activeTheme.gradientAngle || '135deg';
    const start = this.activeTheme.gradientStart || this.activeTheme.primaryColor;
    const end = this.activeTheme.gradientEnd || this.activeTheme.primaryHover;
    return `linear-gradient(${angle}, ${start} 0%, ${end} 100%)`;
  }

  get liveMarqueeGradient(): string {
    const start = this.activeTheme.marqueeStart || this.activeTheme.primaryHover;
    const end = this.activeTheme.marqueeEnd || this.activeTheme.primaryColor;
    return `linear-gradient(90deg, ${start} 0%, ${end} 50%, ${start} 100%)`;
  }

  private deriveLightShade(hex: string, blendWithWhite = 0.9): string {
    if (!hex) return '#fff5ed';
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) cleanHex = cleanHex.split('').map(c => c + c).join('');
    const num = parseInt(cleanHex, 16);
    if (isNaN(num)) return '#fff5ed';
    
    let r = (num >> 16) & 255;
    let g = (num >> 8) & 255;
    let b = num & 255;
    
    r = Math.round(r * (1 - blendWithWhite) + 255 * blendWithWhite);
    g = Math.round(g * (1 - blendWithWhite) + 255 * blendWithWhite);
    b = Math.round(b * (1 - blendWithWhite) + 255 * blendWithWhite);

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  private showQuickFeedback(msg: string) {
    this.successMessage = msg;
    setTimeout(() => {
      if (this.successMessage === msg) this.successMessage = '';
    }, 2500);
  }
}
