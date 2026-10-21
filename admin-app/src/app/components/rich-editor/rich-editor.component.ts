import {
  Component,
  forwardRef,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  HostListener,
  ChangeDetectorRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rich-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichEditorComponent),
      multi: true
    }
  ],
  templateUrl: './rich-editor.component.html',
  styleUrls: ['./rich-editor.component.css']
})
export class RichEditorComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
  @Input() placeholder: string = 'Write something delicious...';
  @Input() minHeight: string = '240px';
  @Input() maxHeight: string = '600px';
  @Input() disabled: boolean = false;
  @Input() showTemplates: boolean = true;
  @Input() showSourceView: boolean = true;

  @Output() contentChange = new EventEmitter<string>();

  @ViewChild('editorArea') editorArea!: ElementRef<HTMLDivElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // Internal state
  content: string = '';
  rawHtmlContent: string = '';
  isSourceMode: boolean = false;
  isFullscreen: boolean = false;

  // Active modal / dropdown controls
  activeDropdown: string | null = null;
  savedSelection: Range | null = null;

  // Modals data
  linkData = { url: '', text: '', targetBlank: true };
  imageData = { url: '', alt: '', width: '100%', align: 'center', file: null as File | null };
  videoData = { url: '' };
  tableData = { rows: 3, cols: 3, hasHeader: true };

  // Palettes
  textColors: string[] = [
    '#000000', '#333333', '#666666', '#999999', '#ffffff',
    '#e11d48', '#ea580c', '#d97706', '#16a34a', '#0284c7',
    '#2563eb', '#7c3aed', '#c026d3', '#b91c1c', '#15803d'
  ];

  highlightColors: string[] = [
    'transparent', '#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8',
    '#fed7aa', '#e9d5ff', '#cbd5e1', '#fee2e2', '#dcfce7'
  ];

  fonts: string[] = [
    'Default', 'Inter', 'Roboto', 'Arial', 'Georgia', 'Playfair Display',
    'Courier New', 'Comic Sans MS', 'Impact', 'Trebuchet MS'
  ];

  fontSizes: { label: string; value: string }[] = [
    { label: 'Small (12px)', value: '1' },
    { label: 'Normal (14px)', value: '2' },
    { label: 'Medium (16px)', value: '3' },
    { label: 'Large (18px)', value: '4' },
    { label: 'Extra Large (24px)', value: '5' },
    { label: 'Huge (32px)', value: '6' }
  ];

  foodEmojis: string[] = [
    '🍲', '🍛', '🥘', '🥗', '🌶️', '🧄', '🧅', '🧈',
    '🍚', '🍞', '🥤', '🍿', '🍕', '🍔', '🥟', '🍜',
    '👨‍🍳', '🍽️', '⭐', '🔥', '✨', '✓', '❤️', '💡'
  ];

  // Word & character stats
  wordCount: number = 0;
  charCount: number = 0;
  readingTime: string = '0 min read';

  // History for custom undo/redo
  private history: string[] = [];
  private historyIndex: number = -1;
  private isUpdatingInternally: boolean = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    if (this.editorArea) {
      if (this.content) {
        this.editorArea.nativeElement.innerHTML = this.content;
      }
      this.updateStats();
      this.pushHistory(this.editorArea.nativeElement.innerHTML);
    }
  }

  ngOnDestroy(): void {}

  // ─── ControlValueAccessor Implementation ──────────────────────────────────
  writeValue(value: string): void {
    this.content = value || '';
    this.rawHtmlContent = this.content;
    if (this.editorArea && this.editorArea.nativeElement) {
      this.editorArea.nativeElement.innerHTML = this.content;
      this.updateStats();
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.editorArea && this.editorArea.nativeElement) {
      this.editorArea.nativeElement.contentEditable = (!isDisabled).toString();
    }
  }

  // ─── Selection Management ────────────────────────────────────────────────
  saveSelection(): void {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      this.savedSelection = sel.getRangeAt(0).cloneRange();
    }
  }

  restoreSelection(): void {
    if (this.savedSelection) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(this.savedSelection);
      }
    }
  }

  // ─── Basic Formatting Commands ───────────────────────────────────────────
  exec(command: string, value: string | null = null): void {
    if (this.isSourceMode) return;
    this.focusEditor();
    document.execCommand(command, false, value || '');
    this.onEditorInput();
  }

  formatBlock(tag: string): void {
    this.exec('formatBlock', tag);
    this.closeDropdowns();
  }

  setFont(font: string): void {
    if (font === 'Default') {
      this.exec('fontName', 'inherit');
    } else {
      this.exec('fontName', font);
    }
    this.closeDropdowns();
  }

  setFontSize(sizeValue: string): void {
    this.exec('fontSize', sizeValue);
    this.closeDropdowns();
  }

  setTextColor(color: string): void {
    this.restoreSelection();
    this.exec('foreColor', color);
    this.closeDropdowns();
  }

  setHighlightColor(color: string): void {
    this.restoreSelection();
    this.exec('hiliteColor', color);
    this.closeDropdowns();
  }

  insertHorizontalRule(): void {
    this.exec('insertHorizontalRule');
  }

  clearFormatting(): void {
    this.exec('removeFormat');
  }

  // ─── Checklist / Task List Feature ────────────────────────────────────────
  insertChecklist(): void {
    const checklistHtml = `
      <ul class="editor-checklist" style="list-style: none; padding-left: 0;">
        <li style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <input type="checkbox" style="width: 16px; height: 16px; accent-color: #e11d48;" />
          <span>New check item</span>
        </li>
      </ul><p><br></p>
    `;
    this.insertHtmlAtCursor(checklistHtml);
  }

  // ─── Code Block Feature ───────────────────────────────────────────────────
  insertCodeBlock(): void {
    const codeHtml = `
      <pre style="background: #1e293b; color: #f8fafc; padding: 12px; border-radius: 8px; font-family: monospace; overflow-x: auto;"><code>// Write your note or code here...</code></pre><p><br></p>
    `;
    this.insertHtmlAtCursor(codeHtml);
  }

  // ─── Quote Callout Box ────────────────────────────────────────────────────
  insertCalloutBox(type: 'tip' | 'warning' | 'chef' = 'chef'): void {
    let title = "Chef's Special Secret";
    let bg = '#fffbeb';
    let border = '#f59e0b';
    let icon = '👨‍🍳';

    if (type === 'tip') {
      title = 'Pro Cooking Tip';
      bg = '#ecfdf5';
      border = '#10b981';
      icon = '💡';
    } else if (type === 'warning') {
      title = 'Important Note';
      bg = '#fef2f2';
      border = '#ef4444';
      icon = '⚠️';
    }

    const boxHtml = `
      <div class="editor-callout" style="background: ${bg}; border-left: 4px solid ${border}; padding: 14px 18px; border-radius: 8px; margin: 16px 0;">
        <strong style="color: ${border}; font-size: 15px; display: block; margin-bottom: 4px;">${icon} ${title}</strong>
        <p style="margin: 0; color: #334155; font-size: 14px;">Add your special notes or instructions for this dish here...</p>
      </div><p><br></p>
    `;
    this.insertHtmlAtCursor(boxHtml);
    this.closeDropdowns();
  }

  // ─── Table Modal & Generator (Premium Feature) ────────────────────────────
  openTableModal(): void {
    this.saveSelection();
    this.activeDropdown = 'table';
  }

  insertTable(): void {
    this.restoreSelection();
    const rows = Math.max(1, Math.min(20, this.tableData.rows || 3));
    const cols = Math.max(1, Math.min(10, this.tableData.cols || 3));

    let tableHtml = `<table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #cbd5e1;">`;
    
    if (this.tableData.hasHeader) {
      tableHtml += `<thead><tr style="background: #f1f5f9;">`;
      for (let c = 0; c < cols; c++) {
        tableHtml += `<th style="border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-weight: 600;">Header ${c + 1}</th>`;
      }
      tableHtml += `</tr></thead>`;
    }

    tableHtml += `<tbody>`;
    for (let r = 0; r < rows; r++) {
      const bg = r % 2 === 0 ? '#ffffff' : '#f8fafc';
      tableHtml += `<tr style="background: ${bg};">`;
      for (let c = 0; c < cols; c++) {
        tableHtml += `<td style="border: 1px solid #cbd5e1; padding: 8px 10px;">Cell ${r + 1},${c + 1}</td>`;
      }
      tableHtml += `</tr>`;
    }
    tableHtml += `</tbody></table><p><br></p>`;

    this.insertHtmlAtCursor(tableHtml);
    this.closeDropdowns();
  }

  // ─── Link Modal (Premium Feature) ─────────────────────────────────────────
  openLinkModal(): void {
    this.saveSelection();
    const sel = window.getSelection();
    this.linkData = {
      url: '',
      text: sel ? sel.toString() : '',
      targetBlank: true
    };
    this.activeDropdown = 'link';
  }

  insertLink(): void {
    if (!this.linkData.url) return;
    this.restoreSelection();

    let target = this.linkData.targetBlank ? ' target="_blank" rel="noopener noreferrer"' : '';
    let displayText = this.linkData.text || this.linkData.url;
    let linkHtml = `<a href="${this.linkData.url}"${target} style="color: #2563eb; text-decoration: underline;">${displayText}</a>`;

    this.insertHtmlAtCursor(linkHtml);
    this.closeDropdowns();
  }

  unlink(): void {
    this.exec('unlink');
    this.closeDropdowns();
  }

  // ─── Image Modal (Premium Feature with local file drop) ───────────────────
  openImageModal(): void {
    this.saveSelection();
    this.imageData = {
      url: '',
      alt: '',
      width: '100%',
      align: 'center',
      file: null
    };
    this.activeDropdown = 'image';
  }

  onImageFileSelected(event: any): void {
    const file = event.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageData.url = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  insertImage(): void {
    if (!this.imageData.url) return;
    this.restoreSelection();

    let alignStyle = 'display: block; margin: 14px auto;';
    if (this.imageData.align === 'left') alignStyle = 'float: left; margin: 0 16px 14px 0;';
    if (this.imageData.align === 'right') alignStyle = 'float: right; margin: 0 0 14px 16px;';

    const imgHtml = `
      <div style="clear: both; text-align: ${this.imageData.align}; margin: 12px 0;">
        <img src="${this.imageData.url}" alt="${this.imageData.alt || 'Food image'}" style="width: ${this.imageData.width}; max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); ${alignStyle}" />
      </div><p><br></p>
    `;

    this.insertHtmlAtCursor(imgHtml);
    this.closeDropdowns();
  }

  // ─── Video Embed Modal (YouTube / Vimeo) ──────────────────────────────────
  openVideoModal(): void {
    this.saveSelection();
    this.videoData = { url: '' };
    this.activeDropdown = 'video';
  }

  insertVideo(): void {
    if (!this.videoData.url) return;
    this.restoreSelection();

    let embedUrl = this.videoData.url;
    // Auto-convert standard YouTube URLs to embed URL
    if (embedUrl.includes('youtube.com/watch?v=')) {
      const videoId = embedUrl.split('watch?v=')[1]?.split('&')[0];
      if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (embedUrl.includes('youtu.be/')) {
      const videoId = embedUrl.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    const videoHtml = `
      <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px; margin: 16px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <iframe src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top:0; left: 0; width: 100%; height: 100%; border: none;"></iframe>
      </div><p><br></p>
    `;

    this.insertHtmlAtCursor(videoHtml);
    this.closeDropdowns();
  }

  // ─── Pre-built Culinary Food Templates (Paid Tier feature) ────────────────
  insertRecipeTemplate(): void {
    const template = `
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 16px 0;">
        <h3 style="color: #e11d48; margin-top: 0; display: flex; align-items: center; gap: 8px;">
          👨‍🍳 Chef's Recipe Ingredients
        </h3>
        <ul style="padding-left: 20px; margin-bottom: 16px; line-height: 1.8;">
          <li><strong>250g</strong> Fresh Malai Paneer, cut into cubes</li>
          <li><strong>3 large</strong> Ripe Tomatoes, blended smooth</li>
          <li><strong>2 tbsp</strong> Pure Desi Ghee or butter</li>
          <li><strong>1 tsp</strong> Cumin seeds (Jeera)</li>
          <li><strong>1 tsp</strong> Kashmiri red chilli powder</li>
          <li><strong>1/2 tsp</strong> Garam masala & Kasuri methi</li>
        </ul>
        <h4 style="color: #334155; margin-bottom: 8px;">Step-by-Step Cooking:</h4>
        <ol style="padding-left: 20px; line-height: 1.8;">
          <li>Heat ghee in a pan and sauté cumin seeds until fragrant.</li>
          <li>Add tomato puree and spices, cooking until oil separates.</li>
          <li>Add paneer cubes and simmer gently for 5 minutes.</li>
        </ol>
      </div><p><br></p>
    `;
    this.insertHtmlAtCursor(template);
    this.closeDropdowns();
  }

  insertNutritionTable(): void {
    const table = `
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background: #1e293b; color: #ffffff;">
            <th style="padding: 10px 14px; text-align: left;">Nutrient</th>
            <th style="padding: 10px 14px; text-align: right;">Amount Per Serving</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 14px;">Calories</td><td style="padding: 8px 14px; text-align: right;">320 kcal</td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9; background: #f8fafc;"><td style="padding: 8px 14px;">Protein</td><td style="padding: 8px 14px; text-align: right;">14 g</td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 14px;">Carbohydrates</td><td style="padding: 8px 14px; text-align: right;">28 g</td></tr>
          <tr style="background: #f8fafc;"><td style="padding: 8px 14px;">Fats</td><td style="padding: 8px 14px; text-align: right;">18 g</td></tr>
        </tbody>
      </table><p><br></p>
    `;
    this.insertHtmlAtCursor(table);
    this.closeDropdowns();
  }

  // ─── Emoji Inserter ───────────────────────────────────────────────────────
  insertEmoji(emoji: string): void {
    this.insertHtmlAtCursor(emoji);
  }

  // ─── Toggle View Modes ────────────────────────────────────────────────────
  toggleSourceMode(): void {
    if (!this.isSourceMode) {
      // Switching to Source Mode
      this.rawHtmlContent = this.editorArea.nativeElement.innerHTML;
      this.isSourceMode = true;
    } else {
      // Switching back to WYSIWYG
      this.editorArea.nativeElement.innerHTML = this.rawHtmlContent;
      this.isSourceMode = false;
      this.onEditorInput();
    }
  }

  onRawHtmlInput(event: any): void {
    this.rawHtmlContent = event.target.value;
    this.content = this.rawHtmlContent;
    this.updateStats();
    this.onChange(this.content);
    this.contentChange.emit(this.content);
  }

  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
  }

  // ─── Copy Clean HTML & Export ─────────────────────────────────────────────
  copyHtml(): void {
    const html = this.isSourceMode ? this.rawHtmlContent : this.editorArea.nativeElement.innerHTML;
    navigator.clipboard.writeText(html).then(() => {
      alert('HTML copied to clipboard!');
    });
  }

  // ─── Helper: Insert HTML at Cursor ────────────────────────────────────────
  private insertHtmlAtCursor(html: string): void {
    this.focusEditor();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      this.editorArea.nativeElement.innerHTML += html;
      this.onEditorInput();
      return;
    }

    const range = sel.getRangeAt(0);
    range.deleteContents();

    const el = document.createElement('div');
    el.innerHTML = html;
    const frag = document.createDocumentFragment();
    let node: ChildNode | null;
    let lastNode: ChildNode | null = null;
    while ((node = el.firstChild)) {
      lastNode = frag.appendChild(node);
    }
    range.insertNode(frag);

    if (lastNode) {
      const newRange = range.cloneRange();
      newRange.setStartAfter(lastNode);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
    }

    this.onEditorInput();
  }

  // ─── Editor Change Handlers ───────────────────────────────────────────────
  onEditorInput(): void {
    if (this.isSourceMode) return;
    this.content = this.editorArea.nativeElement.innerHTML;
    this.rawHtmlContent = this.content;
    this.updateStats();
    this.pushHistory(this.content);
    this.onChange(this.content);
    this.contentChange.emit(this.content);
  }

  onBlur(): void {
    this.onTouched();
  }

  focusEditor(): void {
    if (this.editorArea && this.editorArea.nativeElement) {
      this.editorArea.nativeElement.focus();
    }
  }

  // ─── Dropdown Toggles ─────────────────────────────────────────────────────
  toggleDropdown(name: string, event?: MouseEvent): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.saveSelection();
    this.activeDropdown = this.activeDropdown === name ? null : name;
  }

  closeDropdowns(): void {
    this.activeDropdown = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.rich-editor-wrapper')) {
      this.closeDropdowns();
    }
  }

  // ─── Keyboard Shortcuts ───────────────────────────────────────────────────
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.isSourceMode) return;

    if (event.ctrlKey || event.metaKey) {
      if (event.key === 'b' || event.key === 'B') {
        event.preventDefault();
        this.exec('bold');
      } else if (event.key === 'i' || event.key === 'I') {
        event.preventDefault();
        this.exec('italic');
      } else if (event.key === 'u' || event.key === 'U') {
        event.preventDefault();
        this.exec('underline');
      } else if (event.key === 'z' || event.key === 'Z') {
        event.preventDefault();
        if (event.shiftKey) {
          this.redo();
        } else {
          this.undo();
        }
      } else if (event.key === 'y' || event.key === 'Y') {
        event.preventDefault();
        this.redo();
      }
    }
  }

  // ─── Custom Undo / Redo History ───────────────────────────────────────────
  private pushHistory(val: string): void {
    if (this.isUpdatingInternally) return;
    if (this.history[this.historyIndex] === val) return;
    
    // Truncate future if branching
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    this.history.push(val);
    if (this.history.length > 50) this.history.shift();
    this.historyIndex = this.history.length - 1;
  }

  undo(): void {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.applyHistory();
    }
  }

  redo(): void {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.applyHistory();
    }
  }

  private applyHistory(): void {
    this.isUpdatingInternally = true;
    const val = this.history[this.historyIndex] || '';
    this.editorArea.nativeElement.innerHTML = val;
    this.content = val;
    this.rawHtmlContent = val;
    this.updateStats();
    this.onChange(this.content);
    this.contentChange.emit(this.content);
    this.isUpdatingInternally = false;
  }

  // ─── Stats Calculator ─────────────────────────────────────────────────────
  private updateStats(): void {
    const text = this.editorArea?.nativeElement?.innerText || '';
    this.charCount = text.length;
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    this.wordCount = words.length;
    const minutes = Math.ceil(this.wordCount / 200);
    this.readingTime = `${minutes} min read`;
  }
}
