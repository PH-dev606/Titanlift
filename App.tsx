import React, { useState, useEffect, useMemo, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { 
  Dumbbell, 
  History as HistoryIcon, 
  TrendingUp, 
  LayoutDashboard, 
  Plus,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  Trash2,
  Timer,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  Trophy,
  ArrowLeft,
  Edit2,
  Check,
  X,
  Search,
  PlusCircle,
  Bell
} from 'lucide-react';
import { WorkoutSession, PersonalRecord, ActiveExercise, WorkoutSet, WorkoutTemplate } from './types';
import { EXERCISES, WORKOUT_TEMPLATES } from './constants';
import { getExerciseTip, getMotivationalQuote } from './services/geminiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- Components ---

const Navbar = () => (
  <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-6 py-3 flex justify-between items-center z-50 md:top-0 md:bottom-auto md:flex-col md:w-20 md:h-screen md:border-r md:border-t-0">
    <Link to="/" className="p-2 text-indigo-500 hover:text-indigo-400"><LayoutDashboard size={24} /></Link>
    <Link to="/workouts" className="p-2 text-gray-400 hover:text-indigo-400"><Dumbbell size={24} /></Link>
    <Link to="/progress" className="p-2 text-gray-400 hover:text-indigo-400"><TrendingUp size={24} /></Link>
    <Link to="/history" className="p-2 text-gray-400 hover:text-indigo-400"><HistoryIcon size={24} /></Link>
  </nav>
);

const RestTimer = () => {
  const [seconds, setSeconds] = useState(60);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
    if (!isActive && timeLeft === 0) {
      setTimeLeft(seconds);
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(0);
  };

  return (
    <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Timer size={16} className="text-indigo-400" />
        <span className="text-xs font-bold text-gray-400 uppercase tracking-tight">Descanso:</span>
      </div>
      
      <div className="flex items-center gap-3">
        {timeLeft > 0 ? (
          <div className="flex items-center gap-3">
            <span className={`text-xl font-black tabular-nums ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-indigo-400'}`}>
              {timeLeft}s
            </span>
            <button onClick={toggleTimer} className="p-2 bg-gray-700 rounded-full text-white hover:bg-gray-600">
              {isActive ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button onClick={resetTimer} className="p-2 bg-gray-700 rounded-full text-white hover:bg-gray-600">
              <RotateCcw size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={seconds}
              onChange={(e) => setSeconds(Math.max(1, Number(e.target.value)))}
              className="bg-gray-700/50 w-14 text-center rounded-lg py-1 text-sm font-bold border border-gray-600 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
            <span className="text-xs text-gray-500 font-bold">s</span>
            <button 
              onClick={toggleTimer}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl flex items-center gap-1"
            >
              <Play size={14} fill="currentColor" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Home = ({ prs, sessions, templates }: { prs: PersonalRecord[], sessions: WorkoutSession[], templates: WorkoutTemplate[] }) => {
  const [quote, setQuote] = useState("Buscando motivação...");

  useEffect(() => {
    getMotivationalQuote().then(setQuote);
  }, []);

  return (
    <div className="p-6 pb-24 md:pl-28 md:pt-10 max-w-4xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">TitanLift</h1>
        <p className="text-gray-400 italic text-sm">"{quote}"</p>
      </header>

      <section className="mb-10">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-xl font-bold text-gray-100">Escolha seu Treino</h2>
          <Link to="/workouts" className="text-indigo-400 text-sm font-medium flex items-center gap-1 hover:underline">
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {templates.slice(0, 4).map(template => (
            <Link 
              key={template.id} 
              to={`/active/${template.id}`}
              className="bg-gray-900 border border-gray-800 p-6 rounded-3xl hover:border-indigo-500/50 hover:bg-gray-900/50 transition-all group relative overflow-hidden"
            >
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-gray-100 group-hover:text-indigo-400 mb-1">{template.name}</h3>
                <p className="text-gray-500 text-xs mb-4 line-clamp-1">{template.description}</p>
                <div className="flex items-center text-indigo-500 font-bold text-sm">
                  Começar <Play size={14} className="ml-1 fill-current" />
                </div>
              </div>
              <Dumbbell className="absolute -right-4 -bottom-4 text-gray-800/20 group-hover:text-indigo-500/10 transition-colors" size={100} />
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link to="/history" className="bg-indigo-600/10 border border-indigo-500/20 p-6 rounded-3xl flex items-center justify-between group hover:bg-indigo-600/20 transition-all">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-2xl">
              <HistoryIcon size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Histórico</h3>
              <p className="text-gray-400 text-xs">{sessions.length} treinos realizados</p>
            </div>
          </div>
          <ChevronRight className="text-indigo-500 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link to="/progress" className="bg-emerald-600/10 border border-emerald-500/20 p-6 rounded-3xl flex items-center justify-between group hover:bg-emerald-600/20 transition-all">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-600 p-3 rounded-2xl">
              <TrendingUp size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Recordes</h3>
              <p className="text-gray-400 text-xs">{prs.length} PRs ativos</p>
            </div>
          </div>
          <ChevronRight className="text-emerald-500 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="bg-gray-900/50 rounded-3xl p-6 border border-gray-800">
          <h2 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">
            <Timer className="text-indigo-500" size={20} /> Última Atividade
          </h2>
          {sessions.length > 0 ? (
            <div className="flex justify-between items-center bg-gray-800/30 p-4 rounded-2xl border border-gray-700/50">
              <div>
                <p className="font-bold text-indigo-400">{sessions[0].templateName}</p>
                <p className="text-xs text-gray-500">{new Date(sessions[0].date).toLocaleDateString()}</p>
              </div>
              <Link to={`/result/${sessions[0].id}`} className="text-gray-400 hover:text-white"><ChevronRight size={20}/></Link>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Nenhum treino registrado ainda. Que tal começar hoje?</p>
          )}
      </div>
    </div>
  );
};

export default Home;
