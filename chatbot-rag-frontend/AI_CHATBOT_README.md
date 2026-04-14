# Production-Ready AI Chatbot

A ChatGPT-style AI chatbot frontend built with Next.js, designed to teach machine learning concepts and help with interview preparation. Features real-time API integration with FastAPI backend, markdown rendering, chat history management, and light/dark mode support.

## Features

✨ **Core Features**
- Real backend integration with FastAPI (`http://127.0.0.1:8000/chat`)
- UUID-based session management with localStorage persistence
- ChatGPT-style UI with left/right message alignment
- Markdown rendering with code block copy buttons
- Multiple chat sessions with full CRUD operations
- Collapsible sidebar for chat history
- Light/dark mode toggle with system preference detection
- Auto-scroll to latest messages
- Timestamps on all messages
- Loading indicators while waiting for responses
- Comprehensive error handling with user-friendly messages

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **State Management**: React Context API
- **Styling**: Tailwind CSS + shadcn/ui components
- **Markdown**: react-markdown + remark-gfm
- **Theme**: next-themes
- **Icons**: lucide-react
- **Utilities**: uuid for unique IDs

## Project Structure

```
app/
├── page.tsx              # Main chat page
├── layout.tsx            # Root layout with ThemeProvider
└── globals.css           # Global styles

components/
├── chat-sidebar.tsx      # Chat history sidebar
├── message.tsx           # Individual message with markdown
├── message-list.tsx      # Message container with auto-scroll
├── message-input.tsx     # Message input with header and theme toggle
├── theme-toggle.tsx      # Light/dark mode toggle
└── ui/                   # shadcn/ui components

lib/
├── storage.ts            # localStorage utilities for chat persistence
├── api.ts                # Backend API service with error handling
└── chat-context.tsx      # React Context for state management
```

## Getting Started

### Prerequisites
- Node.js 18+
- FastAPI backend running at `http://127.0.0.1:8000`

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
pnpm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Backend API Integration

### Endpoint
```
POST http://127.0.0.1:8000/chat
```

### Request Format
```typescript
{
  "message": string,      // User's message
  "session_id": string    // UUID-based session ID
}
```

### Response Format
```typescript
{
  "response": string      // Assistant's response
}
```

### Error Handling
The frontend handles:
- Connection failures (backend not running)
- Request timeouts (30-second limit)
- HTTP errors with appropriate messages
- Network errors with recovery suggestions

## State Management

### Chat Context (`lib/chat-context.tsx`)
The application uses React Context to manage:
- **chats**: Array of Chat objects with messages
- **currentChat**: Currently active chat
- **sessionId**: Persistent UUID for backend
- **isLoading**: Loading state during API calls
- **error**: Error messages for display

### Actions
- `createNewChat()`: Create new chat session
- `switchChat(chatId)`: Switch between chats
- `deleteCurrentChat()`: Delete active chat
- `clearCurrentChat()`: Clear messages in chat
- `sendChatMessage(content)`: Send message and get response
- `clearError()`: Clear error message

## Storage

### localStorage Keys
- `chat_sessions`: Array of all chats with messages
- `current_session_id`: Persistent session UUID

### Data Persistence
- Chat history persists across page reloads
- Session ID maintains conversation context with backend
- Auto-generates first chat on app startup

## UI Components

### MessageList
- Auto-scrolls to latest message with smooth animation
- Displays empty state with welcome message
- Maps messages to Message component

### Message
- Right-aligned user messages (blue background)
- Left-aligned assistant messages (gray background)
- Markdown rendering with syntax highlighting
- Code block copy buttons
- Timestamps for all messages
- Responsive layout (xs-lg width constraints)

### MessageInput
- Auto-resizing textarea
- Ctrl+Enter to send message
- Clear chat button
- Send button with loading state
- Error message display with dismiss button
- Theme toggle in header

### ChatSidebar
- Collapsible sidebar (click icon to toggle)
- Create new chat button
- Chat list with selection highlighting
- Delete button (hover to show)
- Connection status indicator
- Responsive behavior on mobile

## Styling

### Design System
- **Colors**: Blue (#2563eb) for user messages, Gray for assistant, White/Dark backgrounds
- **Typography**: Geist font family (sans + mono)
- **Spacing**: Tailwind spacing scale
- **Responsive**: Mobile-first design with Tailwind breakpoints

### Dark Mode
- Automatic detection of system preference
- Manual toggle via button in header
- Persisted across sessions via next-themes
- Smooth transitions between modes

## Code Examples

### Sending a Message
```typescript
const { sendChatMessage, isLoading, error } = useChatContext();

await sendChatMessage("Explain neural networks");
```

### Managing Chats
```typescript
const { 
  createNewChat, 
  switchChat, 
  deleteCurrentChat,
  chats,
  currentChat 
} = useChatContext();

// Create new
createNewChat();

// Switch to chat
switchChat(chatId);

// Delete current
deleteCurrentChat();
```

### Getting Session ID
```typescript
const { sessionId } = useChatContext();
// Use sessionId with backend API
```

## Error Handling

The application provides user-friendly error messages for:
- Backend connection failures
- Request timeouts
- HTTP errors (4xx, 5xx)
- Network issues

Errors display in a dismissible alert above the input field with an X button to clear.

## Performance Optimizations

- Auto-resizing textarea (no layout shift)
- Debounced localStorage operations
- Efficient re-renders via Context
- Smooth scrolling with native browser API
- Markdown parsing only for assistant messages
- Lazy component rendering in sidebar

## Mobile Responsiveness

- Sidebar collapses to icons on mobile
- Chat messages adjust width constraints (xs → lg)
- Full-width input on small screens
- Touch-friendly button sizes
- Proper viewport meta tags

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Modern browsers with ES2020+ support required.

## Configuration

### API Endpoint
Edit `lib/api.ts` to change backend URL:
```typescript
const API_BASE = 'http://127.0.0.1:8000';
```

### API Timeout
Change timeout (milliseconds) in `lib/api.ts`:
```typescript
const API_TIMEOUT = 30000; // 30 seconds
```

### Chat Title Generation
Edit `lib/storage.ts` to customize title generation:
```typescript
export function generateChatTitle(message: string): string {
  const words = message.split(' ').slice(0, 5);
  return words.join(' ') + (message.split(' ').length > 5 ? '...' : '');
}
```

## Troubleshooting

### Backend Connection Failed
- Ensure FastAPI backend is running at `http://127.0.0.1:8000`
- Check CORS configuration on backend
- Verify network connectivity

### Messages Not Persisting
- Check browser localStorage is enabled
- Clear browser cache and reload
- Check browser console for errors

### Slow Performance
- Reduce number of stored messages
- Clear localStorage: `localStorage.clear()`
- Check backend response times

### Theme Toggle Not Working
- Ensure `suppressHydrationWarning` is in `<html>` tag
- Check `next-themes` is properly initialized
- Verify browser supports CSS custom properties

## Future Enhancements

- Message search and filtering
- Custom chat titles editing
- Export chat as PDF/Markdown
- Voice input/output
- Multi-language support
- Message editing and deletion
- Conversation branching
- Real-time typing indicators
- User authentication

## License

MIT
