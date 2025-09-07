"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { User, FitnessProfile } from '@/server/models/userModel';
import ProfileView from './profile/ProfileView';
import ProfileDrawer from './ProfileDrawer';
import { initializeViewportHeight } from '@/shared/utils/viewport';

type EventType = 'token' | 'user_update' | 'profile_update' | 'ready_to_save' | 'user_created' | 'milestone' | 'error';
type Role = 'user' | 'assistant';

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  summary?: boolean;
}

export default function ChatContainer() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [essentialsComplete, setEssentialsComplete] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const currentAssistantIdRef = useRef<string | null>(null);
  const [summaryAnchorId, setSummaryAnchorId] = useState<string | null>(null);
  
  // New state management for partial objects (Phase 4)
  const [currentUser, setCurrentUser] = useState<Partial<User>>(() => {
    // Auto-detect timezone and set default preferred send hour on initialization
    try {
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return {
        timezone: detectedTimezone,
        preferredSendHour: 8, // Default to 8 AM
      };
    } catch {
      return {
        timezone: 'America/New_York', // Fallback
        preferredSendHour: 8,
      };
    }
  });
  const [currentProfile, setCurrentProfile] = useState<Partial<FitnessProfile>>({});
  const [canSave, setCanSave] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [createdUser, setCreatedUser] = useState<User | null>(null);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isStreaming]);

  // Initialize viewport height handling
  useEffect(() => {
    const cleanup = initializeViewportHeight();
    return cleanup;
  }, []);


  // Scroll to summary anchor when set
  useEffect(() => {
    if (summaryAnchorId) {
      const el = document.getElementById(`msg-${summaryAnchorId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [summaryAnchorId]);

  const placeholderSuggestions = useMemo(
    () => [
      'I want to get stronger for climbing',
      'Help me lose 10 pounds in 3 months',
      'I have dumbbells and a bench at home',
      'I can work out 3 days a week',
    ],
    []
  );

  const send = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    
    if (!isExpanded) setIsExpanded(true);

    const userMsg: ChatMessage = { id: uuidv4(), role: 'user', content: trimmed };
    const assistantMsg: ChatMessage = { id: uuidv4(), role: 'assistant', content: '' };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    currentAssistantIdRef.current = assistantMsg.id;
    setInput('');

    const response = await fetch('/api/chat/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: trimmed,
        currentUser,
        currentProfile,
        saveWhenReady: false, // Only true when user explicitly confirms
        conversationHistory: messages // Send the recent conversation history for better context
      }),
    });
    if (!response.ok || !response.body) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    setConnected(true);
    setIsStreaming(true);

    let buffer = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let idx: number;
      while ((idx = buffer.indexOf('\n\n')) !== -1) {
        const raw = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        const lines = raw.split('\n');
        let event: EventType = 'token';
        let dataStr = '';
        for (const line of lines) {
          if (line.startsWith('event:')) event = line.slice(6).trim() as EventType;
          if (line.startsWith('data:')) dataStr += (dataStr ? '\n' : '') + line.slice(5).trim();
        }
        try {
          const data = dataStr ? JSON.parse(dataStr) : '';
          if (event === 'token') {
            setMessages((prev) => {
              const next = [...prev];
              const lastIdx = next.length - 1;
              if (lastIdx >= 0 && next[lastIdx].role === 'assistant') {
                next[lastIdx] = { ...next[lastIdx], content: next[lastIdx].content + String(data) };
              }
              return next;
            });
          } else if (event === 'user_update') {
            setCurrentUser(data as Partial<User>);
          } else if (event === 'profile_update') {
            setCurrentProfile(data as Partial<FitnessProfile>);
          } else if (event === 'ready_to_save') {
            const saveData = data as { canSave: boolean; missing: string[] };
            setCanSave(saveData.canSave);
            setMissingFields(saveData.missing);
          } else if (event === 'user_created') {
            const userData = data as { user: User; success: true };
            setCreatedUser(userData.user);
            setEssentialsComplete(true);
            // Redirect to success page or next step
            setTimeout(() => {
              window.location.href = '/success';
            }, 2000);
          } else if (event === 'milestone') {
            if (data === 'essentials_complete') {
              setEssentialsComplete(true);
            } else if (data === 'summary') {
              setEssentialsComplete(true);
              const anchorId = currentAssistantIdRef.current;
              if (anchorId) {
                setSummaryAnchorId(anchorId);
                setMessages((prev) => prev.map(m => m.id === anchorId ? { ...m, summary: true } : m));
              }
            }
          } else if (event === 'error') {
            console.error('Onboarding error:', data);
            // Could show error message to user
          }
        } catch {
          // ignore parse errors
        }
      }
    }
    setConnected(false);
    setIsStreaming(false);
    
    // Refocus input after response is complete
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, [input, isExpanded, currentUser, currentProfile, messages]);

  // Handle final save when user confirms profile
  const handleSaveProfile = useCallback(async () => {
    if (!canSave) return;
    
    setIsStreaming(true);
    
    const response = await fetch('/api/chat/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: 'Please save my profile and create my account.',
        currentUser,
        currentProfile,
        saveWhenReady: true,
        conversationHistory: messages
      }),
    });
    
    if (!response.ok || !response.body) {
      setIsStreaming(false);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    setConnected(true);

    let buffer = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let idx: number;
      while ((idx = buffer.indexOf('\n\n')) !== -1) {
        const raw = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        const lines = raw.split('\n');
        let event: EventType = 'token';
        let dataStr = '';
        for (const line of lines) {
          if (line.startsWith('event:')) event = line.slice(6).trim() as EventType;
          if (line.startsWith('data:')) dataStr += (dataStr ? '\n' : '') + line.slice(5).trim();
        }
        try {
          const data = dataStr ? JSON.parse(dataStr) : '';
          if (event === 'user_created') {
            const userData = data as { user: User; success: true };
            setCreatedUser(userData.user);
            setEssentialsComplete(true);
            // Redirect to success page
            setTimeout(() => {
              window.location.href = '/success';
            }, 2000);
          } else if (event === 'error') {
            console.error('Save error:', data);
            // Could show error message to user
          }
        } catch {
          // ignore parse errors
        }
      }
    }
    setConnected(false);
    setIsStreaming(false);
    
    // Refocus input after save is complete (if not redirecting)
    if (!createdUser) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [canSave, currentUser, currentProfile, createdUser, messages]);

  // Hero state
  if (!isExpanded && !hasMessages) {
    return (
      <div className="w-full">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 via-white to-white" />
          
          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm text-emerald-700 backdrop-blur mb-6">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                AI Fitness Coach
              </div>
              <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-4">
                Start your fitness journey
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Tell us about your goals, and we&apos;ll create a personalized training plan in minutes
              </p>
            </div>

            {/* Main Input */}
            <div className="relative max-w-2xl mx-auto">
              <div className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="What are your fitness goals?"
                  className="w-full px-6 py-5 text-lg placeholder:text-gray-400 focus:outline-none"
                  autoFocus
                />
                <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {placeholderSuggestions.slice(0, 2).map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setInput(suggestion)}
                        className="text-xs px-3 py-1 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={send}
                    disabled={!input.trim()}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Personalized plans
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                SMS coaching
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                5-minute setup
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Trusted by thousands getting stronger every day
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-3">&ldquo;Finally found a program that adapts to my busy schedule. The SMS reminders keep me accountable.&rdquo;</p>
                <p className="text-sm text-gray-500">Sarah M. • Marketing Manager</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-3">&ldquo;Lost 15 pounds in 2 months. The personalized workouts actually work with my home gym setup.&rdquo;</p>
                <p className="text-sm text-gray-500">Mike R. • Software Engineer</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-3">&ldquo;The AI coach understands my climbing goals and built a perfect strength program.&rdquo;</p>
                <p className="text-sm text-gray-500">Alex T. • Rock Climber</p>
              </div>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="py-20 px-4">
          <div className="mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  How GymText Works
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  We combine AI-powered planning with human-like coaching to create fitness programs that actually stick.
                </p>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-semibold">1</div>
                    <div>
                      <p className="font-semibold text-gray-900">Quick chat onboarding</p>
                      <p className="text-gray-600">Tell us your goals, schedule, and equipment in a simple conversation</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-semibold">2</div>
                    <div>
                      <p className="font-semibold text-gray-900">AI builds your plan</p>
                      <p className="text-gray-600">Get a structured program with progressive overload and periodization</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-semibold">3</div>
                    <div>
                      <p className="font-semibold text-gray-900">Daily SMS coaching</p>
                      <p className="text-gray-600">Receive workouts, reminders, and adjustments via text</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-100 rounded-2xl p-8">
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">You</p>
                    <p className="text-gray-900">I want to build muscle but only have 30 minutes a day</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-emerald-600 mb-1">GymText Coach</p>
                    <p className="text-gray-900">Perfect! I&apos;ll create a time-efficient program focused on compound movements. What equipment do you have access to?</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Everything you need to succeed
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Structured Programming</h3>
                <p className="text-gray-600">Real mesocycles, deload weeks, and progressive overload built into every plan</p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Flexible Scheduling</h3>
                <p className="text-gray-600">Workouts adapt to your availability, from 2-6 days per week</p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">SMS Coaching</h3>
                <p className="text-gray-600">Daily check-ins, form tips, and motivation delivered via text</p>
              </div>
            </div>
          </div>
        </section>

        {/* Getting Started */}
        <section className="py-20 px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Ready to transform your fitness?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of people achieving their fitness goals with personalized AI coaching
            </p>
            <button
              onClick={() => inputRef.current?.focus()}
              className="px-8 py-4 bg-emerald-600 text-white rounded-lg text-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              Start Your Free Trial
            </button>
            <p className="mt-4 text-sm text-gray-500">
              No credit card required • Cancel anytime
            </p>
          </div>
        </section>
      </div>
    );
  }

  // Chat state (expanded)  
  return (
    <div className="h-screen-safe flex flex-col lg:flex-row bg-white relative">
      {/* Mobile Header - only visible on smaller screens */}
      <header className="lg:hidden border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-lg font-medium text-gray-900">GymText Onboarding</div>
            {canSave && !essentialsComplete && (
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                Ready to Save
              </span>
            )}
            {essentialsComplete && (
              <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                Account Created
              </span>
            )}
            {createdUser && (
              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                Welcome, {createdUser.name}!
              </span>
            )}
          </div>
          {(Object.keys(currentUser).length > 0 || Object.keys(currentProfile).length > 0) && (
            <button
              onClick={() => setIsProfileDrawerOpen(true)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Open profile drawer"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </button>
          )}
        </div>
      </header>


      {/* Chat Area - Left side on desktop (60%), full width on mobile */}
      <div className="flex-1 lg:w-3/5 flex flex-col min-h-0 relative">
        {/* Desktop Header - only visible on larger screens */}
        <header className="hidden lg:block border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-lg font-medium text-gray-900">GymText Onboarding</div>
              {canSave && !essentialsComplete && (
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                  Ready to Save
                </span>
              )}
              {essentialsComplete && (
                <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                  Account Created
                </span>
              )}
              {createdUser && (
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                  Welcome, {createdUser.name}!
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Minimize"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </header>


        {/* Messages area */}
        <div className="flex-1 overflow-y-auto min-h-0 pb-20 lg:pb-0">
          <div className="px-4 lg:px-6 py-8 max-w-4xl lg:max-w-none">
            {messages.length === 0 ? (
              <div className="text-center py-20">
                <h1 className="text-2xl font-medium text-gray-900 mb-2">
                  Welcome to GymText Onboarding
                </h1>
                <p className="text-gray-600">
                  Tell us about your fitness goals, and we&apos;ll create a personalized plan for you.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
                  >
                    <div
                      className={
                        m.role === 'user'
                          ? 'max-w-[70%] rounded-2xl bg-gray-100 px-4 py-2 text-gray-900'
                          : `max-w-[70%] ${m.summary ? 'rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3' : ''} text-gray-900`
                      }
                      id={`msg-${m.id}`}
                    >
                      {m.summary && (
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                          Essentials Summary
                        </div>
                      )}
                      <div>{m.content}</div>
                    </div>
                  </div>
                ))}
                {connected && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
                <div ref={scrollAnchorRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input area */}
        <div className="fixed lg:relative bottom-0 left-0 right-0 lg:bottom-auto lg:left-auto lg:right-auto border-t border-gray-200 px-4 lg:px-6 py-4 bg-white pb-safe z-50 lg:z-auto lg:w-full">
          <div className="max-w-4xl lg:max-w-none w-full">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Ask anything about your fitness goals..."
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 pr-12 text-gray-900 placeholder:text-gray-500 focus:border-gray-400 focus:outline-none"
                  disabled={isStreaming}
                />
                <button
                  onClick={send}
                  disabled={!input.trim() || isStreaming}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="mt-2 text-center text-xs text-gray-500">
              GymText can make mistakes. Check important info.
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Profile Section - Right side (40%), only visible on larger screens */}
      <div className="hidden lg:block lg:w-2/5 border-l border-gray-200 bg-gradient-to-b from-emerald-50 to-blue-50 overflow-hidden h-full">
        <ProfileView
          currentUser={currentUser}
          currentProfile={currentProfile}
          canSave={canSave}
          missingFields={missingFields}
          onSaveProfile={handleSaveProfile}
          isStreaming={isStreaming}
        />
      </div>

      {/* Mobile Profile Drawer */}
      <ProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        currentUser={currentUser}
        currentProfile={currentProfile}
        canSave={canSave}
        missingFields={missingFields}
        onSaveProfile={handleSaveProfile}
        isStreaming={isStreaming}
      />
    </div>
  );
}