import { useState } from 'react';
import { Send, Bot, User, MessageSquare, X } from 'lucide-react';

interface ServiceAssistantProps {
  serviceName: string;
  variant?: 'desktop' | 'mobile' | 'both';
}

export function ServiceAssistant({ serviceName, variant = 'both' }: ServiceAssistantProps) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Selam! I can help you with your ${serviceName}. Do you have your current passport ready?`
    },
    {
      id: 2,
      sender: 'user',
      text: 'Yes, I have it. How much is the fee?'
    },
    {
      id: 3,
      sender: 'ai',
      text: 'The standard 32-page passport renewal fee is 2,000 ETB. For the 64-page version, it is 4,000 ETB.'
    }
  ]);
  const [input, setInput] = useState('');
  
  // Mobile chat visibility state
  const [isOpen, setIsOpen] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: 'user', text: input }]);
    setInput('');
  };

  const ChatContent = (
    <div className="flex flex-col h-full lg:h-full bg-surface lg:border border-border lg:rounded-xl shadow-sm overflow-hidden relative">
      {/* Mobile Close Button */}
      <button 
        onClick={() => setIsOpen(false)}
        className="lg:hidden absolute top-4 right-4 p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Header */}
      <div className="bg-primary p-4 md:p-5 text-white shrink-0">
        <h3 className="font-bold flex items-center gap-2">
          <Bot className="w-5 h-5" /> Service Assistant
        </h3>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400"></span>
          <span className="text-xs text-primary-foreground/80 font-medium">Active & Ready</span>
        </div>
        <div className="mt-4 bg-white/10 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider inline-block">
          CONTEXT: {serviceName}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.sender === 'user' ? 'bg-accent text-white' : 'bg-primary text-white'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`p-3 rounded-xl text-sm shadow-sm max-w-[85%] leading-relaxed ${
              msg.sender === 'user' 
                ? 'bg-primary text-white rounded-tr-none' 
                : 'bg-white border border-border text-text-main rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {/* Quick Suggestions */}
        <div className="flex flex-wrap gap-2 mt-auto pt-4">
          <button className="text-xs font-medium bg-white border border-border px-3 py-1.5 rounded-full hover:border-primary/50 hover:text-primary transition-colors">
            How to pay?
          </button>
          <button className="text-xs font-medium bg-white border border-border px-3 py-1.5 rounded-full hover:border-primary/50 hover:text-primary transition-colors">
            Office hours
          </button>
          <button className="text-xs font-medium bg-white border border-border px-3 py-1.5 rounded-full hover:border-primary/50 hover:text-primary transition-colors">
            Lost passport?
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-border flex items-center gap-2 shrink-0">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..." 
          className="flex-1 bg-slate-50 border border-border rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
        />
        <button 
          onClick={handleSend}
          className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center shrink-0 hover:bg-primary/90 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop View */}
      {(variant === 'both' || variant === 'desktop') && (
        <div className="hidden lg:block h-full">
          {ChatContent}
        </div>
      )}

      {/* Mobile View */}
      {(variant === 'both' || variant === 'mobile') && (
        <div className="lg:hidden">
          {/* FAB */}
          <button 
            onClick={() => setIsOpen(true)}
            className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-40 bg-[#0B251C] text-white px-6 py-3.5 rounded-full shadow-2xl font-bold flex items-center gap-2 transition-transform duration-300 w-max whitespace-nowrap ${isOpen ? 'translate-y-24 opacity-0' : 'translate-y-0 opacity-100'}`}
          >
            <SparklesIcon /> Ask about {serviceName}
          </button>

          {/* Mobile Modal Chat */}
          <div className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <div className={`absolute bottom-0 left-0 right-0 h-[85dvh] bg-background rounded-t-2xl transition-transform duration-300 transform flex flex-col overflow-hidden ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
              <div className="flex-1 overflow-hidden h-full">
                 {ChatContent}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SparklesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/>
      <path d="M19 17v4"/>
      <path d="M3 5h4"/>
      <path d="M17 19h4"/>
    </svg>
  );
}
