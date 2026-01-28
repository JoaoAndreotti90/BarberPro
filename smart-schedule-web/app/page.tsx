'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import {
  Scissors,
  Send,
  X,
  MessageCircle,
  Clock,
  MapPin,
  Phone,
  Instagram,
  Star,
  Sparkles
} from 'lucide-react';

export default function Home() {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Olá. Sou o assistente da BarberPro. Como posso ajudar?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (!loading && chatOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [loading, chatOpen]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    setInputMessage('');

    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

      const response = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });

      const data = await response.json();
      const finalContent = typeof data === 'string' ? data : (data.response || JSON.stringify(data));

      setMessages(prev => [...prev, { role: 'assistant', content: finalContent }]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Erro de conexão. O servidor pode estar offline." }]);
    } finally {
      setLoading(false);
    }
  };

  const services = [
    { name: 'Corte Tradicional', price: 'R$ 45', icon: Scissors },
    { name: 'Corte + Barba', price: 'R$ 70', icon: Sparkles },
    { name: 'Barba', price: 'R$ 35', icon: Star },
    { name: 'Platinado', price: 'R$ 150', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500 selection:text-black">

      <div className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1920&h=1080&fit=crop"
            alt="Interior da Barbearia BarberPro"
            fill
            priority
            className="object-cover object-center"
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
        </div>

        <header className="relative z-10 flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Scissors className="w-6 h-6 text-black" />
            </div>
            <span className="text-2xl font-bold tracking-tight">BarberPro</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 font-medium">
            <a href="#servicos" className="hover:text-amber-500 transition-colors">Serviços</a>
            <a href="#galeria" className="hover:text-amber-500 transition-colors">Galeria</a>
            <a href="#contato" className="hover:text-amber-500 transition-colors">Contato</a>
          </nav>
          <button
            onClick={() => setChatOpen(true)}
            className="hidden md:block bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 px-6 rounded-md transition-all hover:scale-105"
          >
            Agendar Horário
          </button>
        </header>

        <div className="relative z-10 flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center px-4">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight tracking-tighter">
            Estilo que<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-300">
              define você
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl font-light">
            A melhor experiência em cortes masculinos e tratamentos de barba premium
          </p>

          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={() => setChatOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-lg px-8 py-4 rounded-lg flex items-center justify-center transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.5)]"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Fale com nosso assistente
            </button>
            <button
              className="border-2 border-white text-white hover:bg-white hover:text-black font-bold text-lg px-8 py-4 rounded-lg transition-all"
            >
              Ver Serviços
            </button>
          </div>

          <div className="grid grid-cols-3 gap-8 md:gap-16 mt-20 border-t border-white/10 pt-8">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-amber-500">10+</div>
              <div className="text-sm text-gray-400 mt-1 uppercase tracking-wider">Anos XP</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-amber-500">5K+</div>
              <div className="text-sm text-gray-400 mt-1 uppercase tracking-wider">Clientes</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-amber-500">4.9</div>
              <div className="text-sm text-gray-400 mt-1 uppercase tracking-wider">Estrelas</div>
            </div>
          </div>
        </div>
      </div>

      <section id="servicos" className="py-24 px-8 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">Nossos Serviços</h2>
            <p className="text-xl text-gray-400">Excelência em cada detalhe</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div key={index} className="group bg-zinc-900 border border-zinc-800 p-8 rounded-xl hover:border-amber-500 transition-all hover:-translate-y-2 cursor-pointer shadow-lg hover:shadow-amber-900/20">
                <div className="bg-black w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:bg-amber-500 transition-colors">
                  <service.icon className="w-8 h-8 text-amber-500 group-hover:text-black transition-colors" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white">{service.name}</h3>
                <p className="text-3xl font-bold text-amber-500">{service.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="galeria" className="py-24 px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">Galeria</h2>
            <p className="text-xl text-gray-400">Nossos melhores trabalhos</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&h=600&fit=crop',
              'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500&h=600&fit=crop',
              'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=500&h=600&fit=crop',
              'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=500&h=600&fit=crop',
              'https://images.unsplash.com/photo-1621607512214-68297480165e?w=500&h=600&fit=crop',
              'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=500&h=600&fit=crop',
            ].map((img, i) => (
              <div key={i} className="relative overflow-hidden rounded-xl aspect-[3/4] group cursor-pointer">
                <Image
                  src={img}
                  alt={`Trabalho ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6 z-10">
                  <span className="text-white font-bold text-lg translate-y-4 group-hover:translate-y-0 transition-transform">Ver Detalhes</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contato" className="py-24 px-8 bg-zinc-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-4">Onde nos encontrar</h2>
          <p className="text-xl text-gray-400 mb-12">Venha conhecer nosso espaço</p>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col items-center group">
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-800 group-hover:border-amber-500 transition-colors">
                <MapPin className="w-8 h-8 text-amber-500" />
              </div>
              <p className="text-gray-300">Rua das Barbearias, 123<br />São Paulo - SP</p>
            </div>
            <div className="flex flex-col items-center group">
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-800 group-hover:border-amber-500 transition-colors">
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
              <p className="text-gray-300">Seg-Sex: 9h - 20h<br />Sáb: 9h - 18h</p>
            </div>
            <div className="flex flex-col items-center group">
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-800 group-hover:border-amber-500 transition-colors">
                <Phone className="w-8 h-8 text-amber-500" />
              </div>
              <p className="text-gray-300">(11) 99999-9999<br />contato@barberpro.com</p>
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <button className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 px-8 rounded-full flex items-center gap-2 transition-colors border border-zinc-700">
              <Instagram className="w-5 h-5" />
              Siga no Instagram
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-black py-8 px-8 text-center text-gray-500 border-t border-zinc-900">
        <p>&copy; 2026 BarberPro. Todos os direitos reservados.</p>
      </footer>

      {chatOpen && (
        <div className="fixed inset-0 z-50 flex flex-col w-full h-full bg-zinc-900 border border-zinc-700 shadow-2xl shadow-black rounded-none md:inset-auto md:bottom-6 md:right-6 md:w-96 md:h-[600px] md:rounded-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">

          <div className="bg-gradient-to-r from-amber-500 to-amber-700 p-4 rounded-t-none md:rounded-t-2xl flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Barber Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <p className="text-xs text-white/80 font-medium">Online agora</p>
                </div>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} className="hover:bg-black/20 p-2 rounded-lg transition-colors text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-900/50">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-amber-500/50" />
                <p className="text-sm">Olá. Como posso ajudar?</p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${msg.role === 'user'
                  ? 'bg-amber-500 text-black font-medium rounded-br-none'
                  : 'bg-zinc-800 text-gray-100 border border-zinc-700 rounded-bl-none'
                  }`}>
                  {msg.role === 'user' ? (
                    <p className="text-sm break-words leading-relaxed">{msg.content}</p>
                  ) : (
                    <div className="text-sm break-words leading-relaxed">
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                          li: ({ node, ...props }) => <li className="" {...props} />,
                          strong: ({ node, ...props }) => <strong className="text-amber-500 font-bold" {...props} />
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 rounded-bl-none">
                  <div className="flex gap-1.5 items-center h-5">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-zinc-900 border-t border-zinc-800">
            <div className="flex gap-2 relative">
              <input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Digite sua mensagem..."
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder:text-gray-500 transition-all"
                disabled={loading}
                autoFocus
              />
              <button
                onClick={sendMessage}
                className="absolute right-2 top-1.5 p-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !inputMessage.trim()}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center mt-2">
              <p className="text-[10px] text-gray-600">Powered by Gemini AI</p>
            </div>
          </div>
        </div>
      )}

      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full shadow-2xl shadow-amber-500/20 flex items-center justify-center hover:scale-110 transition-transform z-50 group"
        >
          <MessageCircle className="w-8 h-8 text-black group-hover:animate-pulse" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-black"></span>
        </button>
      )}
    </div>
  );
}