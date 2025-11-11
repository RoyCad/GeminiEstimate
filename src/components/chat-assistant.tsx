
'use client';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send, X, Loader2, Bot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { getProjectChatResponse } from '@/ai/flows/project-chat';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';


type Message = {
    role: 'user' | 'assistant';
    content: string;
};

const suggestedQuestions = [
    "What's the total cost of my project so far?",
    "How many laborers worked last week?",
    "Show me the latest payments I made.",
    "Which materials have been purchased?",
];

export default function ChatAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();


    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                { role: 'assistant', content: `Hello ${user?.displayName?.split(' ')[0]}! I am your project assistant. How can I help you today?` }
            ]);
        }
    }, [isOpen, messages.length, user]);

    useEffect(() => {
        // Auto-scroll to the bottom when new messages are added
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);


    const handleSend = async (question?: string) => {
        const userMessageContent = question || input;
        if (!userMessageContent.trim() || !user) return;

        const newMessages: Message[] = [...messages, { role: 'user', content: userMessageContent }];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const response = await getProjectChatResponse({
                userId: user.uid,
                query: userMessageContent,
            });
            setMessages([...newMessages, { role: 'assistant', content: response.answer }]);
        } catch (error) {
            console.error('Chatbot error:', error);
            setMessages([...newMessages, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    }

    if (!isOpen) {
        return (
            <Button
                className="fixed bottom-8 right-8 rounded-full h-16 w-16 shadow-lg z-50"
                onClick={() => setIsOpen(true)}
            >
                <MessageSquare className="h-8 w-8" />
            </Button>
        );
    }

    return (
        <Card className={cn(
            "shadow-2xl flex flex-col z-50",
            isMobile 
                ? "fixed inset-0 w-full h-full rounded-none" 
                : "fixed bottom-8 right-8 w-96 h-[600px] glass-card"
        )}>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Project Assistant</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-5 w-5" />
                </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
                 <ScrollArea className="h-full p-6" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex items-end gap-2 ${message.role === 'user' ? 'justify-end' : ''}`}
                            >
                                {message.role === 'assistant' && <AvatarIcon />}
                                <div
                                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                                        message.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted'
                                    }`}
                                >
                                     <div className="prose prose-sm max-w-full text-current" dangerouslySetInnerHTML={{ __html: message.content.replace(/```/g, '').replace(/\* \*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br />') }} />
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                             <div className="flex items-end gap-2">
                                <AvatarIcon />
                                <div className="rounded-lg px-4 py-2 bg-muted">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                </div>
                            </div>
                        )}
                        {messages.length <= 1 && (
                            <div className='pt-4 space-y-2'>
                                <p className="text-sm text-muted-foreground">Or try a suggestion:</p>
                                <div className="flex flex-wrap gap-2">
                                {suggestedQuestions.map(q => (
                                    <Badge key={q} variant="outline" className="cursor-pointer hover:bg-muted" onClick={() => handleSend(q)}>{q}</Badge>
                                ))}
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter>
                <div className="relative w-full">
                    <Input
                        placeholder="Ask about your project..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                    />
                    <Button
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => handleSend()}
                        disabled={isLoading}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}

const AvatarIcon = () => (
  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
    <Bot className="h-5 w-5" />
  </div>
);

function BotIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  )
}
