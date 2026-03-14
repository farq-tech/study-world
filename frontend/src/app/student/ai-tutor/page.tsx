'use client';

import React, { useState, useRef, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send, Loader2, BookOpen, Calculator, HelpCircle, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  { text: 'اشرح لي درس الجمع والطرح', icon: '📐', subject: 'الرياضيات' },
  { text: 'ساعدني أفهم أنواع الجملة', icon: '📖', subject: 'لغتي' },
  { text: 'ما هي أركان الإسلام؟', icon: '🕌', subject: 'الدراسات الإسلامية' },
  { text: 'اشرح لي أجزاء النبات', icon: '🌱', subject: 'العلوم' },
  { text: 'اختبرني في جدول الضرب', icon: '✖️', subject: 'الرياضيات' },
  { text: 'علمني كلمات إنجليزية جديدة', icon: '🌍', subject: 'الإنجليزي' },
];

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'مرحباً! 😊 أنا معلمك الذكي. كيف يمكنني مساعدتك اليوم؟\n\nيمكنني:\n- شرح الدروس 📚\n- مساعدتك في الواجبات ✏️\n- اختبارك بأسئلة 📝\n- شرح أي موضوع بطريقة سهلة 🌟',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState('عام');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: text, subject });
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data.data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'عذراً، حدث خطأ. حاول مرة أخرى! 😅',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gradient-to-l from-blue-500 to-purple-500 p-3 rounded-2xl">
          <Bot className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">المعلم الذكي</h1>
          <p className="text-sm text-gray-500">اسأل عن أي شيء تريد تعلمه!</p>
        </div>
        <div className="mr-auto">
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="bg-blue-50 text-blue-700 rounded-xl px-3 py-2 text-sm border-0 focus:ring-2 focus:ring-blue-400"
          >
            <option value="عام">كل المواد</option>
            <option value="الرياضيات">🔢 الرياضيات</option>
            <option value="لغتي">📖 لغتي</option>
            <option value="العلوم">🔬 العلوم</option>
            <option value="الدراسات الإسلامية">🕌 الإسلامية</option>
            <option value="الإنجليزي">🌍 الإنجليزي</option>
          </select>
        </div>
      </div>

      {/* Chat area */}
      <Card className="flex-1 overflow-hidden flex flex-col">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}>
                {msg.role === 'assistant' && <Bot className="h-4 w-4 inline ml-1 text-purple-500" />}
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-end">
              <div className="bg-gray-100 rounded-2xl px-4 py-3 rounded-bl-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">يفكر...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </CardContent>

        {/* Suggested questions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-gray-400 mb-2">اقتراحات:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => { setSubject(q.subject); sendMessage(q.text); }}
                  className="bg-blue-50 text-blue-700 rounded-xl px-3 py-2 text-xs hover:bg-blue-100 transition-colors"
                >
                  {q.icon} {q.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب سؤالك هنا..."
              className="flex-1"
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !input.trim()} size="icon" className="shrink-0">
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
