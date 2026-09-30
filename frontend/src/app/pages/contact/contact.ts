import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-contact',
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  contactData = {
    name: '',
    email: '',
    phone: '',
    message: ''
  };

  isSubmitting = false;
  submitSuccess = false;
  submitError = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  sendMessage() {
    if (!this.contactData.name || !this.contactData.message) {
      alert("Please fill in your name and message.");
      return;
    }

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = false;

    this.http.post('https://formsubmit.co/ajax/tusharmanusharma@gmail.com', {
      name: this.contactData.name,
      email: this.contactData.email || 'Not provided',
      phone: this.contactData.phone || 'Not provided',
      message: this.contactData.message,
      _subject: `New Contact Form Submission from ${this.contactData.name}`
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        // Clear form
        this.contactData = { name: '', email: '', phone: '', message: '' };
        this.cdr.detectChanges();
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          this.submitSuccess = false;
          this.cdr.detectChanges();
        }, 5000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.submitError = true;
        this.cdr.detectChanges();
        console.error('Error sending message', error);
      }
    });
  }
}
