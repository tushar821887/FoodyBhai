import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppUpdateService } from '../../services/app-update.service';

@Component({
  selector: 'app-download-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-download-banner.html',
  styleUrl: './app-download-banner.css'
})
export class AppDownloadBannerComponent {
  constructor(public appUpdate: AppUpdateService) {}
}
