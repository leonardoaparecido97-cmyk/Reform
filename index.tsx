import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { 
  Calculator, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  RefreshCw, 
  BrainCircuit, 
  Trophy,
  X,
  Search,
  ExternalLink,
  Globe,
  CheckSquare,
  Square,
  Target,
  Dumbbell,
  ShieldAlert,
  Terminal,
  Activity,
  Wifi,
  Database,
  Wallet,
  PieChart,
  ShieldCheck,
  History,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Save,
  ArrowUpDown,
  Lock,
  Crown,
  Key,
  CheckCircle2,
  Star,
  Zap,
  MessageCircle,
  Send,
  Award,
  CreditCard,
  Smartphone,
  ArrowLeft,
  Clock
} from 'lucide-react';

// --- Configuration & Types ---

interface Opportunity {
  id: string;
  sport: string;
  league: string;
  event: string;
  market: string;
  type: '2-way' | '3-way';
  bookmakerA: string;
  oddA: number;
  outcomeA: string;
  linkA?: string;
  bookmakerB: string;
  oddB: number;
  outcomeB: string;
  linkB?: string;
  bookmakerC?: string;
  oddC?: number;
  outcomeC?: string;
  linkC?: string;
  roi: number;
  startTime: string;
  sources?: { uri: string; title: string }[];
}

interface BetRecord {
  id: string;
  date: string;
  event: string;
  market: string;
  investment: number;
  expectedProfit: number;
  status: 'pending' | 'won' | 'lost';
  roi: number;
  bookmakers: string[];
}

interface License {
  active: boolean;
  type: 'FREE' | 'PRO' | 'LIFETIME' | 'TRIAL';
  expiresAt: number | null; // Timestamp
  key: string;
}

const SPORTS = ['Futebol', 'Basquete', 'Tênis', 'MMA', 'Vôlei', 'eSports', 'Futsal', 'Beisebol', 'Futebol Americano', 'Hóquei', 'Boxe', 'Handebol'];

const BOOKMAKERS = [
  'Bet365', 'Betano', 'Pinnacle', 'Betfair Exchange', '1xBet', 
  'Stake', 'Sportingbet', 'KTO', 'Betway', 'Novibet', 
  'Parimatch', 'EstrelaBet', 'Betnacional', 'Pagbet', 'Dafabet',
  'Esportes da Sorte', 'Pixbet', 'Betcris', 'Rivalo', 'Betsson'
];

const MARKET_TYPES = [
  'Vencedor (Moneyline/1x2)',
  'Total de Gols/Pontos (Over/Under)',
  'Ambas Marcam (BTTS)',
  'Handicap Asiático',
  'Empate Anula (DNB)',
  'Dupla Chance',
  'Total de Cantos',
  'Total de Cartões',
  'Resultado Correto'
];

// --- Whatsapp Config ---
const WHATSAPP_NUMBER = "5519992071599";
const TELEGRAM_LINK = "https://t.me/+5519992071599"; 

const PLANS = [
  {
    id: 'trial',
    name: 'Teste VIP 48h',
    duration: '2 Dias',
    price: '5,00',
    highlight: true,
    features: ['Teste TODAS as Casas', 'Acesso Imediato', 'Calculadora PRO', 'Sem Compromisso'],
    link: `https://wa.me/${WHATSAPP_NUMBER}?text=Ol%C3%A1!%20Quero%20testar%20o%20ArbiBot%20PRO%20por%2048h%20pagando%20R$%205,00.`
  },
  {
    id: 'monthly',
    name: 'Plano Mensal',
    duration: '30 Dias',
    price: '97,00',
    features: ['Acesso a TODAS as Casas', 'Calculadora PRO', 'Scanner de Confiança', 'Gestão de Banca', 'Suporte Prioritário'],
    link: `https://wa.me/${WHATSAPP_NUMBER}?text=Ol%C3%A1!%20Gostaria%20de%20adquirir%20o%20plano%20MENSAL%20do%20ArbiBot%20PRO%20por%20R$%2097,00.`
  },
  {
    id: 'semiannual',
    name: 'Plano Semestral',
    duration: '6 Meses',
    price: '297,00',
    popular: true,
    features: ['Economize 50%', 'Acesso a TODAS as Casas', 'Calculadora PRO', 'Scanner de Confiança', 'Gestão de Banca', 'Suporte Prioritário'],
    link: `https://wa.me/${WHATSAPP_NUMBER}?text=Ol%C3%A1!%20Gostaria%20de%20adquirir%20o%20plano%20SEMESTRAL%20do%20ArbiBot%20PRO%20por%20R$%20297,00%20(Com%20Desconto%20PIX).`
  },
  {
    id: 'lifetime',
    name: 'Acesso Vitalício',
    duration: 'Para Sempre',
    price: '497,00',
    features: ['Pagamento Único', 'Atualizações Gratuitas', 'Acesso a TODAS as Casas', 'Scanner de Confiança', 'Gestão de Banca', 'Grupo VIP Secreto'],
    link: `https://wa.me/${WHATSAPP_NUMBER}?text=Ol%C3%A1!%20Gostaria%20de%20adquirir%20o%20acesso%20VITAL%C3%8DCIO%20do%20ArbiBot%20PRO%20por%20R$%20497,00.`
  }
];

// --- Helpers ---

const getBookmakerLink = (bookmaker: string, event: string, providedLink?: string) => {
  if (providedLink && (providedLink.startsWith('http') || providedLink.startsWith('www'))) {
    return providedLink;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(`${bookmaker} ${event} odds`)}`;
};

const getRoiStatus = (roi: number) => {
  if (roi > 10) return { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'ALTO RISCO / ERRO PROVÁVEL' };
  if (roi > 5) return { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'RISCO MÉDIO' };
  if (roi > 0) return { color: 'text-brand-accent', bg: 'bg-brand-accent/10', border: 'border-brand-accent/20', label: 'ARBITRAGEM GARANTIDA' };
  return { color: 'text-blue-300', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'ODDS DE VALOR' };
};

// --- AI Service ---

const getClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries === 0) throw error;
    const isTransient = 
      error?.message?.includes('Rpc failed') || 
      error?.message?.includes('xhr error') || 
      error?.message?.includes('fetch failed') ||
      error?.status === 500 || 
      error?.status === 503;

    if (isTransient) {
      console.warn(`AI Request failed. Retrying... (${retries} attempts left)`);
      await new Promise(r => setTimeout(r, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

const scanRealOdds = async (sports: string[], selectedBookmakers: string[], selectedMarkets: string[], isPro: boolean): Promise<Opportunity[]> => {
  const activeSports = isPro ? sports : ['Futebol'];
  const activeBookies = isPro ? selectedBookmakers : ['Bet365', 'Betano'];
  
  const sportList = activeSports.length > 0 ? activeSports.join(', ') : 'All Major Sports';
  const bookmakerList = activeBookies.join(', ');
  const marketList = selectedMarkets.join(', ');
  
  const prompt = `
    STRICTLY SEARCH FOR REAL-TIME LIVE DATA. DO NOT INVENT DATA.
    
    Search for currently available betting odds for upcoming matches in these sports: ${sportList}.
    
    TARGET BOOKMAKERS: ${bookmakerList}.
    TARGET MARKETS: ${marketList}.
    
    TASK: Find the best odds differences between bookmakers using Google Search.
    
    OBJECTIVE:
    1. PRIORITY: Find Arbitrage Opportunities (Surebets) where (1/OddA + 1/OddB...) < 1.0.
    2. SECONDARY: If no Surebets are found, return matches with the closest odds (Lowest Margin/Highest Value).
    
    INSTRUCTIONS:
    1. EXTRACT real odds from the search results. 
    2. Look for 2-WAY markets (e.g., Over/Under, BTTS). Compare Bookie A vs Bookie B.
    3. Look for 3-WAY markets (e.g., 1x2 Winner). Compare Bookie A vs Bookie B vs Bookie C.
    
    Return a JSON array strictly in this format:
    [
      {
        "type": "2-way" or "3-way",
        "event": "Team A vs Team B",
        "league": "League Name",
        "market": "Market Name",
        "sport": "Sport Name",
        
        "bookmakerA": "Bookmaker Name",
        "oddA": 2.10,
        "outcomeA": "Selection A",
        "linkA": "URL",
        
        "bookmakerB": "Bookmaker Name",
        "oddB": 2.05,
        "outcomeB": "Selection B",
        "linkB": "URL",
        
        // Optional for 3-way
        "bookmakerC": "Bookmaker Name",
        "oddC": 3.50,
        "outcomeC": "Selection C",
        "linkC": "URL",
        
        "startTime": "Time/Date"
      }
    ]
    
    Find at least 5 distinct events with the best odds differences available right now.
  `;

  // Internal function to execute the scan with configurable tools
  const executeScan = async () => {
    const ai = getClient();
    // FORCE GOOGLE SEARCH GROUNDING for real data
    const config = { tools: [{ googleSearch: {} }] };
    
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: config
    }));

    const text = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks.map((chunk: any) => chunk.web).filter((web: any) => web && web.uri && web.title);

    let jsonString = text;
    // Improved regex to handle various markdown JSON formats
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) jsonString = jsonMatch[1];

    try {
      const parsedData = JSON.parse(jsonString);
      if (Array.isArray(parsedData)) {
        return parsedData.map((item, index) => {
          let prob = (1/item.oddA) + (1/item.oddB);
          if (item.type === '3-way' && item.oddC) prob += (1/item.oddC);
          const roi = ((1/prob) - 1) * 100;
          return {
            id: `live-${Date.now()}-${index}`,
            type: item.type || '2-way',
            sport: item.sport || (activeSports.length === 1 ? activeSports[0] : 'Esporte'),
            league: item.league || 'Unknown League',
            event: item.event,
            market: item.market,
            bookmakerA: item.bookmakerA,
            oddA: Number(item.oddA),
            outcomeA: item.outcomeA,
            linkA: item.linkA,
            bookmakerB: item.bookmakerB,
            oddB: Number(item.oddB),
            outcomeB: item.outcomeB,
            linkB: item.linkB,
            bookmakerC: item.bookmakerC,
            oddC: item.oddC ? Number(item.oddC) : undefined,
            outcomeC: item.outcomeC,
            linkC: item.linkC,
            startTime: item.startTime,
            roi: Number(roi.toFixed(2)),
            sources: sources.slice(0, 3) 
          };
        }).filter((item: Opportunity) => item.roi > -5.0);
      }
      return [];
    } catch (e) { 
      console.warn("JSON Parse Error:", e);
      return []; 
    }
  };

  try {
    return await executeScan();
  } catch (error) { 
    console.error("AI Scan Fatal Error:", error);
    throw error; // Propagate error to UI
  }
};

const analyzeOpportunity = async (opp: Opportunity): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `Analyze this arbitrage opportunity for risk: ${JSON.stringify(opp)}. Return analysis in Portuguese.`;
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { tools: [{ googleSearch: {} }] }
    }));
    return response.text || "Análise indisponível.";
  } catch (error) { return "Erro na análise."; }
};

const checkBookmakerTrust = async (bookmakerName: string): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `Check reputation for bookmaker: ${bookmakerName} in Brazil. Return summary in Portuguese.`;
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { tools: [{ googleSearch: {} }] }
    }));
    return response.text || "Sem dados.";
  } catch (error) { return "Erro ao verificar."; }
};

// --- Components ---

const TrustBadges = () => (
  <div className="flex flex-wrap justify-center gap-6 mt-8 opacity-80 scale-90 md:scale-100">
    <div className="flex items-center gap-2 bg-brand-900/60 px-4 py-2 rounded-full border border-brand-700/50">
      <ShieldCheck className="text-brand-accent" size={20} />
      <span className="text-xs font-bold text-gray-300">COMPRA SEGURA</span>
    </div>
    <div className="flex items-center gap-2 bg-brand-900/60 px-4 py-2 rounded-full border border-brand-700/50">
      <Zap className="text-yellow-400" size={20} />
      <span className="text-xs font-bold text-gray-300">ACESSO IMEDIATO</span>
    </div>
    <div className="flex items-center gap-2 bg-brand-900/60 px-4 py-2 rounded-full border border-brand-700/50">
      <MessageCircle className="text-blue-400" size={20} />
      <span className="text-xs font-bold text-gray-300">SUPORTE 24/7</span>
    </div>
  </div>
);

const StickyFooter = () => (
  <div className="fixed bottom-0 left-0 w-full z-[51] bg-brand-900/95 backdrop-blur-md border-t border-brand-700 shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
      <div className="flex flex-col md:flex-row gap-1 md:gap-6">
        <div className="flex items-center gap-2 text-emerald-400">
          <ShieldCheck size={18} />
          <span className="text-xs md:text-sm font-bold text-gray-200">Segurança SSL Blindada</span>
        </div>
        <div className="flex items-center gap-1.5 hidden md:flex">
           <div className="flex text-yellow-500">
             {[1,2,3,4,5].map(i => <Star key={i} size={10} fill="currentColor" />)}
           </div>
           <span className="text-[10px] md:text-xs text-gray-400 font-medium">4.9/5 - Atendimento VIP</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <a 
          href={TELEGRAM_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all shadow-lg hover:scale-105"
        >
          <Send size={18} />
          <span className="hidden md:block ml-2 text-sm font-bold">Grupo Free</span>
        </a>
        <a 
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-brand-900 rounded-full px-4 py-2 transition-all shadow-lg hover:shadow-green-500/30 hover:scale-105 animate-pulse"
        >
          <MessageCircle size={20} fill="currentColor" />
          <div className="flex flex-col leading-none">
            <span className="text-[9px] font-black uppercase tracking-wide opacity-80">Suporte</span>
            <span className="text-xs md:text-sm font-bold">WhatsApp</span>
          </div>
        </a>
      </div>
    </div>
  </div>
);

const LandingPage = ({ onEnter }: { onEnter: () => void }) => {
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col relative overflow-hidden pb-24">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-brand-accent/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]"></div>
      </div>
      <div className="z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="mb-6 animate-fade-in-down">
          <div className="inline-flex items-center gap-2 bg-brand-800/50 border border-brand-700/50 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent"></span>
            </span>
            <span className="text-xs font-medium text-brand-accent tracking-wide">IA GEMINI 2.0 INTEGRADA</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-4 leading-tight">
            ArbiBot <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-emerald-400">AI</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-light">
            O robô de arbitragem mais avançado do mercado. Encontre <span className="text-white font-medium">Surebets</span> com lucro garantido em segundos.
          </p>
        </div>
        <button 
          onClick={onEnter}
          className="group relative px-8 py-4 bg-gradient-to-r from-brand-accent to-emerald-500 rounded-xl font-bold text-brand-900 text-lg shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] transition-all hover:scale-105"
        >
          <div className="flex items-center gap-3">
            <TrendingUp size={24} />
            ACESSAR SISTEMA
            <ArrowUpDown size={18} className="group-hover:translate-x-1 transition-transform"/>
          </div>
        </button>
        <TrustBadges />
        <p className="mt-8 text-xs text-gray-500">*Disponível para Bet365, Betano, Pinnacle e +20 casas.</p>
      </div>
      <StickyFooter />
    </div>
  );
};

const Header = ({ activeTab, setActiveTab, license, onOpenPro }: { activeTab: string, setActiveTab: (t: string) => void, license: License, onOpenPro: () => void }) => {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!license.active || !license.expiresAt) return;
    if (license.type === 'LIFETIME' || license.expiresAt > 9000000000000) {
      setTimeLeft("∞ VITALÍCIO");
      return;
    }
    const updateTimer = () => {
      const now = Date.now();
      const distance = license.expiresAt! - now;
      if (distance < 0) { setTimeLeft("EXPIRADO"); return; }
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      const d = days > 0 ? `${days}d ` : '';
      const h = hours.toString().padStart(2, '0');
      const m = minutes.toString().padStart(2, '0');
      const s = seconds.toString().padStart(2, '0');
      setTimeLeft(`${d}${h}:${m}:${s}`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [license]);

  return (
    <header className="bg-brand-800 border-b border-brand-700 sticky top-0 z-30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-accent rounded-lg flex items-center justify-center text-brand-900 shadow-lg shadow-brand-accent/20 shrink-0">
              <TrendingUp size={24} strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">ArbiBot <span className="text-brand-accent">AI</span></h1>
              {license.active ? (
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                  <span className="text-[10px] font-bold text-yellow-400 border border-yellow-500/30 px-1.5 py-0.5 rounded bg-yellow-500/10 flex items-center gap-1 w-fit">
                    <Crown size={10} /> {license.type === 'TRIAL' ? 'TESTE VIP' : 'PRO ATIVO'}
                  </span>
                  {timeLeft && (
                    <span className="text-[10px] font-mono font-bold text-brand-accent flex items-center gap-1">
                      <Clock size={10} /> {timeLeft}
                    </span>
                  )}
                </div>
              ) : (
                 <span className="text-[10px] font-bold text-gray-400 border border-gray-600 px-1.5 py-0.5 rounded bg-gray-800 flex items-center gap-1 w-fit">
                  VERSÃO GRÁTIS
                </span>
              )}
            </div>
          </div>
          {!license.active && (
             <button onClick={onOpenPro} className="md:hidden bg-gradient-to-r from-yellow-600 to-yellow-400 text-brand-900 font-bold px-3 py-1.5 rounded-full text-xs animate-pulse shadow-lg shadow-yellow-500/20 flex items-center gap-1">
               <Crown size={12} fill="currentColor" /> SEJA PRO
             </button>
          )}
        </div>
        <nav className="flex bg-brand-900/50 p-1 rounded-lg border border-brand-700/50 w-full md:w-auto justify-center">
          <button onClick={() => setActiveTab('scanner')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'scanner' ? 'bg-brand-700 text-white' : 'text-gray-400 hover:text-white'}`}><Search size={16} /> Scanner</button>
          <button onClick={() => setActiveTab('bankroll')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'bankroll' ? 'bg-brand-700 text-white' : 'text-gray-400 hover:text-white'}`}><Wallet size={16} /> {!license.active && <Lock size={12} className="text-yellow-500" />} Banca</button>
          <button onClick={() => setActiveTab('trust')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'trust' ? 'bg-brand-700 text-white' : 'text-gray-400 hover:text-white'}`}><ShieldCheck size={16} /> {!license.active && <Lock size={12} className="text-yellow-500" />} Confiança</button>
        </nav>
        <div className="hidden md:flex items-center gap-4 text-sm font-medium">
           {!license.active ? (
             <button onClick={onOpenPro} className="bg-gradient-to-r from-yellow-600 to-yellow-400 hover:from-yellow-500 hover:to-yellow-300 text-brand-900 font-bold px-4 py-2 rounded-lg transition-all shadow-lg shadow-yellow-500/20 flex items-center gap-2 transform hover:scale-105">
               <Crown size={16} fill="currentColor" /> LIBERAR VERSÃO PRO
             </button>
           ) : (
             <div className="flex flex-col items-end">
                <div className="text-gray-400 flex items-center gap-2"><CheckCircle2 size={16} className="text-brand-accent"/> Licença Válida</div>
                {timeLeft && <div className="text-xs font-mono text-yellow-500 font-bold mt-0.5 bg-yellow-500/10 px-2 rounded border border-yellow-500/20 flex items-center gap-1"><Clock size={10} /> {timeLeft}</div>}
             </div>
           )}
        </div>
      </div>
    </header>
  );
};

const Paywall = ({ onUnlock, onClose }: { onUnlock: (key: string) => boolean, onClose: () => void }) => {
  const [keyInput, setKeyInput] = useState('');
  const [error, setError] = useState('');

  const handleValidation = () => {
    if (onUnlock(keyInput)) onClose();
    else setError('Código inválido ou expirado. Entre em contato para comprar.');
  };

  return (
    <div className="fixed inset-0 bg-brand-900/95 z-[50] flex items-start justify-center p-4 backdrop-blur-sm overflow-y-auto pb-32 pt-4 md:pt-10">
      <div className="max-w-6xl w-full bg-brand-800 rounded-2xl border border-yellow-500/20 shadow-2xl relative overflow-hidden my-4 md:my-8">
        <div className="bg-gradient-to-r from-brand-900 to-brand-800 p-6 md:p-8 text-center border-b border-brand-700 relative">
          <button onClick={onClose} className="absolute top-4 left-4 md:left-auto md:right-4 text-gray-400 hover:text-white flex items-center gap-1 z-10">
            <ArrowLeft className="md:hidden" size={24} />
            <X className="hidden md:block" size={24} />
            <span className="md:hidden font-bold text-sm">Voltar</span>
          </button>
          <Crown size={48} className="text-yellow-400 mx-auto mb-4 fill-yellow-400/20 animate-bounce" />
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">Desbloqueie o Poder Total do <span className="text-brand-accent">ArbiBot</span></h2>
          <p className="text-gray-400 text-sm md:text-lg">Aumente seus lucros com acesso ilimitado a todas as ferramentas.</p>
          <div className="mt-4 bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-2 rounded-lg inline-flex items-center gap-2 font-bold animate-pulse text-xs md:text-sm">
            <Zap size={16} fill="currentColor" /> 5% DE DESCONTO NO PIX - Fale no Suporte!
          </div>
        </div>
        <div className="p-6 md:p-8">
           <div className="grid md:grid-cols-4 gap-4 mb-12 items-start">
             {PLANS.map(plan => (
               <div key={plan.id} className={`relative bg-brand-900 rounded-xl p-6 border transition-transform hover:scale-105 ${plan.popular ? 'border-yellow-500 shadow-xl shadow-yellow-500/10 z-10 scale-105' : plan.highlight ? 'border-brand-accent shadow-lg shadow-brand-accent/10' : 'border-brand-700'}`}>
                 {plan.popular && <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-brand-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><Star size={10} fill="currentColor"/> MAIS VENDIDO</div>}
                 {plan.highlight && <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-brand-accent text-brand-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><Zap size={10} fill="currentColor"/> RECOMENDADO</div>}
                 <h3 className={`text-lg font-bold mb-2 ${plan.id === 'trial' ? 'text-brand-accent' : 'text-white'}`}>{plan.name}</h3>
                 <div className="flex items-baseline gap-1 mb-4"><span className="text-sm text-gray-400">R$</span><span className="text-3xl font-bold text-white">{plan.price}</span></div>
                 <p className="text-brand-400 text-sm font-medium mb-6">{plan.duration}</p>
                 <ul className="space-y-3 mb-8">{plan.features.map((feat, i) => (<li key={i} className="flex items-center gap-2 text-xs text-gray-300"><CheckCircle2 size={14} className="text-brand-accent shrink-0"/> {feat}</li>))}</ul>
                 <a href={plan.link} target="_blank" rel="noopener noreferrer" className={`block w-full text-center py-3 rounded-lg font-bold transition-colors text-sm flex items-center justify-center gap-2 ${plan.popular ? 'bg-yellow-500 hover:bg-yellow-400 text-brand-900' : plan.highlight ? 'bg-brand-accent hover:bg-emerald-400 text-brand-900' : 'bg-brand-700 hover:bg-brand-600 text-white'}`}>{plan.id === 'trial' ? 'TESTAR AGORA' : 'COMPRAR'}</a>
               </div>
             ))}
           </div>
           <div className="bg-brand-900/50 rounded-xl p-6 border border-brand-700 max-w-xl mx-auto text-center mb-8">
             <h4 className="text-white font-bold mb-4 flex items-center justify-center gap-2"><Key size={18} className="text-gray-400"/> Já tem um código de acesso?</h4>
             <div className="flex flex-col md:flex-row gap-2">
               <input type="text" placeholder="Cole seu código (Ex: VlP-PRO-123)" className="flex-1 bg-brand-800 border border-brand-600 rounded-lg px-4 py-3 text-white outline-none focus:border-brand-accent" value={keyInput} onChange={(e) => setKeyInput(e.target.value)} />
               <button onClick={handleValidation} className="bg-brand-accent hover:bg-emerald-400 text-brand-900 font-bold px-6 py-3 rounded-lg transition-colors">ATIVAR</button>
             </div>
             {error && <p className="text-red-400 text-sm mt-2 font-medium">{error}</p>}
           </div>
           <div className="pt-4 border-t border-brand-700/50 flex flex-col items-center gap-4">
              <TrustBadges />
              <button onClick={onClose} className="text-gray-500 hover:text-white text-sm underline md:hidden">Voltar para o App</button>
           </div>
        </div>
      </div>
    </div>
  );
};

const ScanConsole = ({ isSearching, selectedSports, selectedBookmakers }: { isSearching: boolean, selectedSports: string[], selectedBookmakers: string[] }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  useEffect(() => {
    if (!isSearching) return;
    setLogs(['> Iniciando protocolo de escaneamento...', '> Conectando ao Gemini 2.0 Flash Agent...']);
    setProgress(5);
    const steps = [
      { t: 800, msg: '> Inicializando módulo de busca...' },
      { t: 1600, msg: '> Verificando integridade da conexão (Ping: 14ms)...' },
      { t: 2500, msg: `> Configurando filtros: ${selectedSports.length} Esportes, ${selectedBookmakers.length} Casas...` },
      { t: 4000, msg: '> Acessando Google Search Grounding para dados em tempo real...' },
      { t: 6000, msg: '> Buscando odds recentes em: ' + selectedBookmakers.slice(0, 3).join(', ') + '...' },
      { t: 8000, msg: '> Coletando dados brutos de múltiplos sites de apostas...' },
      { t: 10000, msg: '> Normalizando nomes de times e ligas...' },
      { t: 12000, msg: '> Cruzando odds entre casas para encontrar divergências...' },
      { t: 14000, msg: '> Calculando probabilidades implícitas para detectar Surebets...' },
      { t: 16000, msg: '> Verificando liquidez e limites de mercado...' },
      { t: 18000, msg: '> Aplicando filtro de segurança contra "Bad Lines"...' },
      { t: 20000, msg: '> Revalidando ROI das oportunidades encontradas...' },
      { t: 22000, msg: '> O processo pode demorar devido à análise profunda de múltiplas fontes...' },
      { t: 24000, msg: '> Formatando resultados e gerando links diretos...' },
      { t: 26000, msg: '> Finalizando processamento...' },
    ];
    let timeouts: ReturnType<typeof setTimeout>[] = [];
    steps.forEach(({ t, msg }, index) => {
      const timeout = setTimeout(() => {
        setLogs(prev => [...prev, msg]);
        const percent = Math.min(5 + ((index + 1) / steps.length) * 90, 98);
        setProgress(percent);
      }, t);
      timeouts.push(timeout);
    });
    return () => timeouts.forEach(clearTimeout);
  }, [isSearching, selectedSports, selectedBookmakers]);

  return (
    <div className="bg-brand-900 border border-brand-700 rounded-xl overflow-hidden shadow-2xl max-w-2xl mx-auto my-12">
      <div className="bg-brand-800 p-3 flex items-center justify-between border-b border-brand-700">
        <div className="flex items-center gap-2"><Terminal size={16} className="text-gray-400" /><span className="text-xs font-mono text-gray-400">ArbiBot_Console_v3.exe</span></div>
        <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div><div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div><div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div></div>
      </div>
      <div className="p-6 bg-black/50 backdrop-blur-sm">
        <div className="mb-6">
          <div className="flex justify-between text-xs font-mono text-brand-accent mb-2"><span>STATUS: ESCANEANDO</span><span>{Math.round(progress)}%</span></div>
          <div className="w-full h-2 bg-brand-800 rounded-full overflow-hidden"><div className="h-full bg-brand-accent shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div></div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-brand-800/50 rounded p-3 border border-brand-700 flex flex-col items-center justify-center text-center"><Activity className="text-blue-400 mb-1" size={20} /><span className="text-[10px] text-gray-500 uppercase">Status</span><span className="text-xs font-bold text-blue-400 animate-pulse">Ativo</span></div>
          <div className="bg-brand-800/50 rounded p-3 border border-brand-700 flex flex-col items-center justify-center text-center"><Database className="text-purple-400 mb-1" size={20} /><span className="text-[10px] text-gray-500 uppercase">Casas</span><span className="text-xs font-bold text-purple-400">{selectedBookmakers.length} Alvos</span></div>
          <div className="bg-brand-800/50 rounded p-3 border border-brand-700 flex flex-col items-center justify-center text-center"><Wifi className="text-green-400 mb-1" size={20} /><span className="text-[10px] text-gray-500 uppercase">Fonte</span><span className="text-xs font-bold text-green-400">Google Search</span></div>
        </div>
        <div ref={scrollRef} className="h-48 overflow-y-auto font-mono text-xs space-y-1.5 p-2 scroll-smooth">
          {logs.map((log, i) => (<div key={i} className="text-green-400/80 border-l-2 border-transparent hover:border-brand-accent/30 pl-2 transition-colors"><span className="text-gray-600 mr-2">[{new Date().toLocaleTimeString()}]</span>{log}</div>))}
          <div className="animate-pulse text-brand-accent">_</div>
        </div>
      </div>
    </div>
  );
};

const FilterBar = ({ selectedSports, toggleSport, toggleAllSports, selectedBookmakers, toggleBookmaker, toggleAllBookmakers, selectedMarkets, toggleMarket, toggleAllMarkets, onSearch, isSearching, isPro, onOpenPro }: any) => {
  const allSportsSelected = selectedSports.length === SPORTS.length;
  const allBookiesSelected = selectedBookmakers.length === BOOKMAKERS.length;
  const allMarketsSelected = selectedMarkets.length === MARKET_TYPES.length;

  return (
    <div className="bg-brand-800 border-b border-brand-700 py-4 px-4 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex-grow overflow-hidden w-full">
            <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 md:pb-0 no-scrollbar">
              <span className="text-xs text-gray-400 uppercase font-bold mr-1 flex items-center gap-1 shrink-0"><Dumbbell size={12} /> Esportes:</span>
              {!isPro && <div className="flex items-center gap-2 px-3 py-1 bg-brand-900 border border-brand-700 rounded-full shrink-0"><Lock size={10} className="text-yellow-500" /><span className="text-xs text-gray-400">Grátis: Apenas Futebol</span></div>}
              {isPro && <button onClick={toggleAllSports} className={`px-2 py-1 rounded-full text-xs font-bold transition-all border shrink-0 flex items-center gap-1 ${allSportsSelected ? 'bg-brand-accent text-brand-900 border-brand-accent' : 'bg-brand-900 text-gray-400 border-brand-700'}`}>{allSportsSelected ? <CheckSquare size={12} /> : <Square size={12} />} Todos</button>}
              {SPORTS.map(sport => {
                const locked = !isPro && sport !== 'Futebol';
                return <button key={sport} onClick={() => !locked && toggleSport(sport)} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0 flex items-center gap-1 ${locked ? 'bg-brand-900 text-gray-600 border-brand-800 cursor-not-allowed opacity-60' : selectedSports.includes(sport) ? 'bg-brand-accent/20 text-brand-accent border-brand-accent/50' : 'bg-brand-900 text-gray-400 hover:text-white border border-brand-700 hover:border-brand-600'}`}>{locked && <Lock size={8}/>} {sport}</button>;
              })}
              {!isPro && <button onClick={onOpenPro} className="text-xs text-yellow-500 hover:underline shrink-0 font-bold ml-2">Liberar Tudo</button>}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-brand-700 pt-3">
          <span className="text-xs text-gray-400 uppercase font-bold mr-1 flex items-center gap-1"><Target size={12} /> Mercados:</span>
           <button onClick={toggleAllMarkets} className={`px-2 py-1 rounded text-[10px] md:text-xs font-bold transition-all border flex items-center gap-1 ${allMarketsSelected ? 'bg-brand-accent text-brand-900 border-brand-accent' : 'bg-brand-900 text-gray-400 border-brand-700'}`}>{allMarketsSelected ? <CheckSquare size={12} /> : <Square size={12} />} Todos</button>
          {MARKET_TYPES.map(market => (<button key={market} onClick={() => toggleMarket(market)} className={`px-2 py-1 rounded text-[10px] md:text-xs font-bold transition-all border ${selectedMarkets.includes(market) ? 'bg-purple-600/20 text-purple-400 border-purple-500/50' : 'bg-brand-900 text-gray-600 border-brand-700 hover:border-gray-500'}`}>{market.split('(')[0]}</button>))}
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-brand-700 pt-3">
          <span className="text-xs text-gray-400 uppercase font-bold mr-1 flex items-center gap-1"><Globe size={12} /> Casas:</span>
          {!isPro && <div className="flex items-center gap-2 px-3 py-1 bg-brand-900 border border-brand-700 rounded-full"><Lock size={10} className="text-yellow-500" /><span className="text-xs text-gray-400">Grátis: Apenas Bet365/Betano</span></div>}
          {isPro && <button onClick={toggleAllBookmakers} className={`px-2 py-1 rounded text-[10px] md:text-xs font-bold transition-all border flex items-center gap-1 ${allBookiesSelected ? 'bg-brand-accent text-brand-900 border-brand-accent' : 'bg-brand-900 text-gray-400 border-brand-700'}`}>{allBookiesSelected ? <CheckSquare size={12} /> : <Square size={12} />} Todas</button>}
          {BOOKMAKERS.map(bookie => {
            const allowed = ['Bet365', 'Betano'];
            const locked = !isPro && !allowed.includes(bookie);
            return <button key={bookie} onClick={() => !locked && toggleBookmaker(bookie)} className={`px-2 py-1 rounded text-[10px] md:text-xs font-bold transition-all border flex items-center gap-1 ${locked ? 'bg-brand-900 text-gray-600 border-brand-800 cursor-not-allowed opacity-60' : selectedBookmakers.includes(bookie) ? 'bg-blue-600/20 text-blue-400 border-blue-500/50' : 'bg-brand-900 text-gray-600 border-brand-700 hover:border-gray-500'}`}>{locked && <Lock size={8}/>} {bookie}</button>;
          })}
          {!isPro && <button onClick={onOpenPro} className="text-xs text-yellow-500 hover:underline font-bold ml-1">Desbloquear +20 Casas</button>}
        </div>
        <div className="flex items-center justify-end border-t border-brand-700 pt-3 mt-2">
            <button onClick={onSearch} disabled={isSearching} className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all shadow-lg ${isSearching ? 'bg-brand-700 text-gray-400 cursor-not-allowed' : 'bg-brand-accent hover:bg-emerald-400 text-brand-900 hover:scale-[1.02]'}`}>{isSearching ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} />} {isSearching ? 'Processando...' : 'Recalcular Operações'}</button>
        </div>
      </div>
    </div>
  );
};

const ArbitrageCard: React.FC<{ data: Opportunity, onSelect: (data: Opportunity) => void }> = ({ data, onSelect }) => {
  const linkA = getBookmakerLink(data.bookmakerA, data.event, data.linkA);
  const linkB = getBookmakerLink(data.bookmakerB, data.event, data.linkB);
  const linkC = data.bookmakerC ? getBookmakerLink(data.bookmakerC, data.event, data.linkC) : undefined;
  const status = getRoiStatus(data.roi);
  const is3Way = data.type === '3-way' && data.oddC;

  return (
    <div className={`bg-brand-800 rounded-xl p-5 border transition-all shadow-lg hover:shadow-brand-accent/5 group flex flex-col h-full ${data.roi > 10 ? 'border-red-500/30' : 'border-brand-700 hover:border-brand-accent/50'}`}>
      <div className="flex justify-between items-start mb-4">
        <div><div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider"><Trophy size={12} className="text-brand-accent" />{data.sport} • {data.league}</div><h3 className="text-lg font-bold text-white group-hover:text-brand-accent transition-colors line-clamp-2">{data.event}</h3><p className="text-sm text-gray-400">{data.market} • {data.startTime}</p></div>
        <div className="text-right shrink-0 ml-2"><div className={`inline-flex flex-col items-end`}><div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border ${status.bg} ${status.color} ${status.border}`}><span className="text-lg font-bold">{data.roi > 0 ? '+' : ''}{