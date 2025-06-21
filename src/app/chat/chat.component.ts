// frontend/src/app/chat/chat.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- Import for ngFor, ngIf
import { FormsModule } from '@angular/forms'; // <-- Import for [(ngModel)]
import { AiAssistantService } from '../services/ai-assistant.service'; // <-- Import your new service

interface ChatMessage {
  text: string;
  sender: 'user' | 'ai';
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  // Bind your input to this variable
  userMessage: string = '';
  // Array to hold chat messages
  messages: ChatMessage[] = [];
  isLoading: boolean = false; // To show loading state

  // Inject the AI Assistant Service
  constructor(private aiService: AiAssistantService) {
    // Optional: Add an initial greeting message from the AI
    this.messages.push({
      text: "Hello! I'm here to help you with your development questions. How can I assist you today?",
      sender: 'ai'
    });
  }

  sendMessage(): void {
    if (!this.userMessage.trim() || this.isLoading) {
      return; // Prevent sending empty messages or multiple messages
    }

    // Add user message to chat history
    this.messages.push({ text: this.userMessage, sender: 'user' });
    const messageToSend = this.userMessage; // Store it before clearing input
    this.userMessage = ''; // Clear input field immediately
    this.isLoading = true; // Show loading spinner

    // Call the AI assistant service
    this.aiService.sendMessage(messageToSend).subscribe({
      next: (response) => {
        this.messages.push({ text: response.reply, sender: 'ai' });
        this.isLoading = false; // Hide loading spinner
      },
      error: (error) => {
        console.error('Error sending message to AI:', error);
        this.messages.push({
          text: 'Sorry, I could not get a response. Please try again later.',
          sender: 'ai'
        });
        this.isLoading = false; // Hide loading spinner
      }
    });
  }
}