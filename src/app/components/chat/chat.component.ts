import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  ElementRef,
  ViewChild,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { ChatMessage, ChatRequest, ChatError } from '../../models/chat.model';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements AfterViewChecked {
  private readonly chatService = inject(ChatService);

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  // Signals for state management
  protected readonly messages = signal<ChatMessage[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly currentMessage = signal('');

  // Computed properties
  protected readonly hasMessages = computed(() => this.messages().length > 0);
  protected readonly canSend = computed(() => 
    this.currentMessage().trim().length > 0 && !this.loading()
  );

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  protected sendMessage(): void {
    if (!this.canSend()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: this.currentMessage().trim(),
    };

    // Add user message to the conversation
    this.messages.update(messages => [...messages, userMessage]);
    
    // Clear input and set loading state
    this.currentMessage.set('');
    this.loading.set(true);
    this.error.set(null);

    // Prepare request
    const request: ChatRequest = {
      messages: this.messages(),
      stream: false,
    };

    this.chatService.sendMessage(request).subscribe({
      next: (response) => {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.content,
        };
        this.messages.update(messages => [...messages, assistantMessage]);
        this.loading.set(false);
      },
      error: (err: ChatError) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  protected clearChat(): void {
    this.messages.set([]);
    this.error.set(null);
  }

  protected onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }
}
