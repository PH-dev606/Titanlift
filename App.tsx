import React, { useState, useEffect, useMemo, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  Dumbbell, 
  History as HistoryIcon, 
  TrendingUp, 
  LayoutDashboard, 
  Plus,
  ChevronRight,
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
  PlusCircle,
  PlusSquare,
  Settings2,
  Home as HomeIcon,
  Calculator,
  Clock,
  NotebookPen,
  CalendarDays,
  Heart
} from 'lucide-react';
import { WorkoutSession, PersonalRecord, ActiveExercise, WorkoutSet, WorkoutTemplate, Exercise } from './types';
import { EXERCISES as DEFAULT_EXERCISES, WORKOUT_TEMPLATES as DEFAULT_TEMPLATES } from './constants';
import { getMotivationalQuote } from './services/geminiService';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, YAxis } from 'recharts';

// --- Utils ---

const getStartOfWeek = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff)).setHours(0, 0, 0, 0);
};

const formatDuration = (ms: number) => {
  if (ms <= 0 || isNaN(ms)) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const formatDurationFull = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
};

// --- Components ---

const Toast = ({ message, visible }: { message: string, visible: boolean }) => (
  <div className={`fixed bottom-28 left-1/2 -translate-x-1/2 z-[200] transition-all duration-300 transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
    <div className="bg-gray-800 text-white px-6 py-3 rounded-2xl shadow-2xl border border-gray-700 font-medium text-sm whitespace-nowrap">
      {message}
    </div>
  </div>
);

const ExitConfirmDialog = ({ onCancel, onConfirm }: { onCancel: () => void, onConfirm: () => void }) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-6">
    <div className="bg-gray-900 border border-gray-800 w-full max-sm rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
      <div className="bg-indigo-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
        <Dumbbell size={32} className="text-indigo-500" />
      </div>
      <h2 className="text-xl font-black text-white mb-3">Sair para o Início?</h2>
      <p className="text-gray-400 text-sm mb-8 leading-relaxed">
        Seu progresso atual fica salvo. O tempo total da academia continua contando.
      </p>
      <div className="flex flex-col gap-3">
        <button 
          onClick={onConfirm}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98]"
        >
          Sair do Treino Atual
        </button>
        <button 
          onClick={onCancel}
          className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98]"
        >
          Continuar Malhando
        </button>
      </div>
    </div>
  </div>
);

const PlateCalculator = ({ weight, onClose }: { weight: number, onClose: () => void }) => {
  const barWeight = 20;
  const targetSide = (weight - barWeight) / 2;
  const availablePlates = [25, 20, 15, 10, 5, 2, 1];
  
  const calculatePlates = (target: number) => {
    let remaining = target;
    const result: number[] = [];
    availablePlates.forEach(plate => {
      while (remaining >= plate) {
        result.push(plate);
        remaining -= plate;
      }
    });
    return result;
  };

  const plates = targetSide > 0 ? calculatePlates(targetSide) : [];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-6">
      <div className="bg-gray-900 border border-gray-800 w-full max-w-xs rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black text-indigo-400 uppercase text-xs tracking-widest">Anilhas (por lado)</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20}/></button>
        </div>
        <div className="text-center mb-6">
          <p className="text-4xl font-black text-white">{weight} <span className="text-sm text-gray-500">kg</span></p>
          <p className="text-[10px] text-gray-500 uppercase mt-1">Total com Barra de 20kg</p>
        </div>
        <div className="space-y-2">
          {plates.length > 0 ? (
            <div className="flex flex-wrap gap-2 justify-center">
              {plates.map((p, i) => (
                <div key={i} className="bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 px-3 py-1 rounded-lg text-xs font-black">
                  {p}kg
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-center text-gray-600 italic">Peso apenas da barra.</p>
          )}
        </div>
        <button onClick={onClose} className="w-full mt-8 bg-gray-800 py-3 rounded-xl font-bold text-sm">Fechar</button>
      </div>
    </div>
  );
};

const Navbar = () => (
  <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex justify-between items-center z-50 md:top-0 md:bottom-auto md:flex-col md:w-20 md:h-screen md:border-r md:border-t-0">
    <Link to="/" className="p-2 text-indigo-500 hover:text-indigo-400"><LayoutDashboard size={24} /></Link>
    <Link to="/workouts" className="p-2 text-gray-400 hover:text-indigo-400"><Dumbbell size={24} /></Link>
    <Link to="/progress" className="p-2 text-gray-400 hover:text-indigo-400"><TrendingUp size={24} /></Link>
    <Link to="/history" className="p-2 text-gray-400 hover:text-indigo-400"><HistoryIcon size={24} /></Link>
  </nav>
);

const RestTimer = ({ exerciseId }: { exerciseId: string }) => {
  const PREF_MIN_KEY = `titanlift_pref_rest_min_${exerciseId}`;
  const PREF_SEC_KEY = `titanlift_pref_rest_sec_${exerciseId}`;
  const END_TIME_KEY = `titanlift_rest_end_${exerciseId}`;

  const [minInput, setMinInput] = useState<number | ''>(() => parseInt(localStorage.getItem(PREF_MIN_KEY) || '1'));
  const [secInput, setSecInput] = useState<number | ''>(() => parseInt(localStorage.getItem(PREF_SEC_KEY) || '30'));
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    localStorage.setItem(PREF_MIN_KEY, minInput.toString());
  }, [minInput, PREF_MIN_KEY]);
  
  useEffect(() => {
    localStorage.setItem(PREF_SEC_KEY, secInput.toString());
  }, [secInput, PREF_SEC_KEY]);

  useEffect(() => {
    const checkTimer = () => {
      const endTimeStr = localStorage.getItem(END_TIME_KEY);
      if (endTimeStr) {
        const remaining = parseInt(endTimeStr) - Date.now();
        if (remaining > 0) {
          setTimeLeft(Math.floor(remaining / 1000));
          setIsActive(true);
        } else {
          localStorage.removeItem(END_TIME_KEY);
          setIsActive(false);
          setTimeLeft(0);
        }
      }
    };

    checkTimer();
    const interval = setInterval(checkTimer, 1000);
    
    const handleStartTimer = (e: any) => {
      if (e.detail.exerciseId === exerciseId) startTimer();
    };
    window.addEventListener('titanlift_start_rest', handleStartTimer);

    return () => {
      clearInterval(interval);
      window.removeEventListener('titanlift_start_rest', handleStartTimer);
    };
  }, [exerciseId]);

  const startTimer = () => {
    const m = typeof minInput === 'number' ? minInput : 0;
    const s = typeof secInput === 'number' ? secInput : 0;
    const totalSeconds = (m * 60) + s;
    if (totalSeconds > 0) {
      const endTime = Date.now() + (totalSeconds * 1000);
      localStorage.setItem(END_TIME_KEY, endTime.toString());
      setTimeLeft(totalSeconds);
      setIsActive(true);
    }
  };

  const togglePause = () => {
    if (isActive) {
      localStorage.removeItem(END_TIME_KEY);
      setIsActive(false);
    } else {
      if (timeLeft > 0) {
        const endTime = Date.now() + (timeLeft * 1000);
        localStorage.setItem(END_TIME_KEY, endTime.toString());
        setIsActive(true);
      } else {
        startTimer();
      }
    }
  };

  const resetTimer = () => {
    localStorage.removeItem(END_TIME_KEY);
    setIsActive(false);
    setTimeLeft(0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-1.5 px-3 flex items-center justify-start gap-3">
      <div className="flex items-center gap-1.5">
        <Timer size={12} className="text-indigo-400" />
        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Descanso</span>
      </div>
      
      <div className="flex items-center gap-2">
        {timeLeft > 0 ? (
          <div className="flex items-center gap-2">
            <span className={`text-sm font-black tabular-nums tracking-[0.1em] px-2 py-0.5 bg-gray-950/50 rounded-lg border border-gray-800/50 ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-indigo-400'}`}>
              {formatTime(timeLeft)}
            </span>
            <div className="flex gap-1">
              <button onClick={togglePause} className="p-1.5 bg-indigo-600/20 text-indigo-400 rounded-lg hover:bg-indigo-600/30 active:scale-90 transition-all border border-indigo-500/20">
                {isActive ? <Pause size={12} /> : <Play size={12} fill="currentColor" />}
              </button>
              <button onClick={resetTimer} className="p-1.5 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 active:scale-90 transition-all border border-gray-600">
                <RotateCcw size={12} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <input 
                type="number" 
                value={minInput === 0 ? '' : minInput}
                placeholder="0"
                onChange={(e) => setMinInput(e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)))}
                className="bg-gray-900 border border-gray-700 w-10 text-center rounded-lg py-1 text-[16px] font-black text-white outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-gray-700 font-black text-xs">:</span>
              <input 
                type="number" 
                value={secInput === 0 ? '' : secInput}
                placeholder="0"
                onChange={(e) => setSecInput(e.target.value === '' ? 0 : Math.min(59, Math.max(0, Number(e.target.value))))}
                className="bg-gray-900 border border-gray-700 w-10 text-center rounded-lg py-1 text-[16px] font-black text-white outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <button 
              onClick={startTimer}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-lg shadow-lg active:scale-90 transition-all"
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
  const [quote, setQuote] = useState("A disciplina é o destino.");
  const [activeDuration, setActiveDuration] = useState<string>("00:00:00");
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [timerIsRunning, setTimerIsRunning] = useState(false);

  useEffect(() => {
    getMotivationalQuote().then(setQuote);
    
    const interval = setInterval(() => {
      const startTimeKey = 'titanlift_active_start_time';
      const elapsedTimeKey = 'titanlift_active_elapsed_time';
      const timerRunningKey = 'titanlift_timer_is_running';
      
      // Encontrar qual o treino mais recente que está ativo
      const lastActiveTemplate = localStorage.getItem('titanlift_last_active_template');
      const keysInternal = Object.keys(localStorage);
      const activeDraftKeys = keysInternal.filter(k => k.startsWith('titanlift_draft_'));
      
      if (activeDraftKeys.length > 0) {
        // Prioriza o último que foi aberto, ou o primeiro que encontrar
        const found = activeDraftKeys.find(k => k.includes(lastActiveTemplate || '')) || activeDraftKeys[0];
        setActiveTemplateId(found.replace('titanlift_draft_', ''));
      } else {
        setActiveTemplateId(null);
      }

      const isRunning = localStorage.getItem(timerRunningKey) === 'true';
      setTimerIsRunning(isRunning);
      
      let totalMs = parseInt(localStorage.getItem(elapsedTimeKey) || '0');
      if (isRunning) {
        const startTime = localStorage.getItem(startTimeKey);
        if (startTime) {
          totalMs += Date.now() - parseInt(startTime);
        }
      }
      setActiveDuration(formatDuration(totalMs));
      
    }, 200);
    
    return () => clearInterval(interval);
  }, []);

  const handleTimerStart = () => {
    localStorage.setItem('titanlift_active_start_time', Date.now().toString());
    localStorage.setItem('titanlift_timer_is_running', 'true');
    setTimerIsRunning(true);
  };

  const handleTimerPause = () => {
    const startTime = localStorage.getItem('titanlift_active_start_time');
    const elapsed = parseInt(localStorage.getItem('titanlift_active_elapsed_time') || '0');
    if (startTime) {
      const sessionElapsed = Date.now() - parseInt(startTime);
      localStorage.setItem('titanlift_active_elapsed_time', (elapsed + sessionElapsed).toString());
    }
    localStorage.removeItem('titanlift_active_start_time');
    localStorage.setItem('titanlift_timer_is_running', 'false');
    setTimerIsRunning(false);
  };

  const handleTimerReset = () => {
    if (window.confirm("Zerar cronômetro total da sua sessão na academia?")) {
      // Hard Reset de todas as chaves de tempo
      localStorage.setItem('titanlift_active_elapsed_time', '0');
      localStorage.removeItem('titanlift_active_start_time');
      localStorage.setItem('titanlift_timer_is_running', 'false');
      
      // Update UI state immediately
      setTimerIsRunning(false);
      setActiveDuration("00:00:00");
    }
  };

  const weekDaysStatus = useMemo(() => {
    const startOfWeek = getStartOfWeek(new Date());
    const days = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
    const status = [false, false, false, false, false, false, false];
    
    sessions.forEach(s => {
      const sessionDate = new Date(s.date);
      if (sessionDate.getTime() >= startOfWeek) {
        let dayIdx = sessionDate.getDay() - 1;
        if (dayIdx === -1) dayIdx = 6;
        status[dayIdx] = true;
      }
    });
    
    return days.map((label, i) => ({ label, active: status[i] }));
  }, [sessions]);

  return (
    <div className="p-6 pb-32 md:pl-28 md:pt-10 max-w-4xl mx-auto">
      <header className="mb-8 pt-4">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">TitanLift</h1>
        <p className="text-gray-400 italic text-sm">"{quote}"</p>
      </header>

      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-5 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Sua Semana</h2>
          <span className="text-[10px] font-bold text-indigo-400">Freq. Semanal</span>
        </div>
        <div className="flex justify-between items-center px-2">
          {weekDaysStatus.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all duration-500 ${day.active ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}>
                {day.active ? <CheckCircle2 size={16} /> : day.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`border rounded-[2.5rem] p-8 mb-10 transition-all duration-500 ${activeTemplateId ? 'bg-gradient-to-br from-indigo-900/30 to-indigo-950/50 border-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.1)]' : 'bg-gray-900 border-gray-800'}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Clock size={20} className={timerIsRunning ? 'text-indigo-400 animate-pulse' : 'text-gray-500'} />
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-300">Tempo de Academia</h2>
          </div>
          {activeTemplateId && (
            <Link to={`/active/${activeTemplateId}?resume=true`} className="text-[10px] font-black uppercase bg-indigo-600/20 px-3 py-1 rounded-full text-indigo-400 border border-indigo-500/30 animate-pulse">Retomar Treino</Link>
          )}
        </div>
        
        <div className="text-center py-4">
          <span className={`text-6xl font-black tabular-nums tracking-tighter ${activeDuration !== '00:00:00' ? 'text-white' : 'text-gray-700'}`}>
            {activeDuration}
          </span>
          
          <div className="flex items-center justify-center gap-4 mt-8 bg-gray-950/40 p-3 rounded-[2rem] border border-gray-800/50 max-w-[280px] mx-auto overflow-hidden">
            <button 
              onClick={handleTimerReset}
              title="Resetar Cronômetro"
              className="p-3.5 bg-gray-800 text-gray-400 rounded-2xl border border-gray-700 active:scale-90 transition-all hover:bg-gray-700 hover:text-red-400"
            >
              <RotateCcw size={18} />
            </button>
            
            <div className="flex items-center gap-2 flex-1">
              {timerIsRunning ? (
                <button 
                  onClick={handleTimerPause}
                  className="flex-1 p-3.5 rounded-2xl border transition-all active:scale-90 flex items-center justify-center bg-amber-500/10 border-amber-500/40 text-amber-500"
                >
                  <Pause size={20} fill="currentColor" />
                </button>
              ) : (
                <button 
                  onClick={handleTimerStart}
                  className="flex-1 p-3.5 rounded-2xl border transition-all active:scale-90 flex items-center justify-center bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20"
                >
                  <Play size={20} fill="currentColor" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="mb-10">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-xl font-bold text-gray-100">Planos</h2>
          <Link to="/workouts" className="text-indigo-400 text-sm font-medium flex items-center gap-1 hover:underline">
            Ver Todos <ArrowRight size={14} />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {templates.slice(0, 4).map(template => (
            <Link 
              key={template.id} 
              to={`/active/${template.id}`}
              className="bg-gray-900 border border-gray-800 p-6 rounded-3xl hover:border-indigo-500/50 hover:bg-gray-900/40 transition-all group relative overflow-hidden"
            >
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-gray-100 group-hover:text-indigo-400 mb-1">{template.name}</h3>
                <p className="text-gray-500 text-xs mb-4 line-clamp-1">{template.description}</p>
                <div className="flex items-center text-indigo-500 font-bold text-sm">
                  Iniciar <Play size={14} className="ml-1 fill-current" />
                </div>
              </div>
              <Dumbbell className="absolute -right-4 -bottom-4 text-gray-800/10 group-hover:text-indigo-500/10 transition-colors" size={100} />
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/history" className="bg-gray-900 border border-gray-800 p-6 rounded-3xl flex items-center justify-between group hover:bg-gray-800 transition-all">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-600/20"><HistoryIcon size={24} className="text-white" /></div>
            <div>
              <h3 className="font-bold text-lg">Histórico</h3>
              <p className="text-gray-500 text-xs">Últimas sessões</p>
            </div>
          </div>
          <ChevronRight className="text-indigo-500 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link to="/progress" className="bg-gray-900 border border-gray-800 p-6 rounded-3xl flex items-center justify-between group hover:bg-gray-800 transition-all">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-600 p-3 rounded-2xl shadow-lg shadow-emerald-600/20"><TrendingUp size={24} className="text-white" /></div>
            <div>
              <h3 className="font-bold text-lg">Evolução</h3>
              <p className="text-gray-500 text-xs">{prs.length} Recordes</p>
            </div>
          </div>
          <ChevronRight className="text-emerald-500 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

const WorkoutList = ({ 
  templates, 
  onUpdateTemplates,
  exercises,
  onUpdateExercises
}: { 
  templates: WorkoutTemplate[], 
  onUpdateTemplates: (t: WorkoutTemplate[]) => void,
  exercises: Exercise[],
  onUpdateExercises: (e: Exercise[]) => void
}) => {
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [isManageMode, setIsManageMode] = useState(false);
  const [tempName, setTempName] = useState("");

  const startEditTemplate = (t: WorkoutTemplate) => {
    setEditingTemplateId(t.id);
    setTempName(t.name);
  };

  const saveEditTemplate = () => {
    if (editingTemplateId && tempName.trim()) {
      const updated = templates.map(t => t.id === editingTemplateId ? { ...t, name: tempName } : t);
      onUpdateTemplates(updated);
      setEditingTemplateId(null);
    }
  };

  const startEditExercise = (ex: Exercise) => {
    setEditingExerciseId(ex.id);
    setTempName(ex.name);
  };

  const saveEditExercise = () => {
    if (editingExerciseId && tempName.trim()) {
      const updated = exercises.map(ex => ex.id === editingExerciseId ? { ...ex, name: tempName } : ex);
      onUpdateExercises(updated);
      setEditingExerciseId(null);
    }
  };

  const deleteTemplate = (id: string) => {
    if (window.confirm("Deseja realmente excluir este plano?")) {
      onUpdateTemplates(templates.filter(t => t.id !== id));
    }
  };

  const addNewWorkout = () => {
    const newId = `custom-${Date.now()}`;
    const newWorkout: WorkoutTemplate = {
      id: newId,
      name: "Novo Treino",
      description: "Personalizado",
      exercises: []
    };
    onUpdateTemplates([newWorkout, ...templates]);
    setIsManageMode(true);
    setTimeout(() => startEditTemplate(newWorkout), 100);
  };

  return (
    <div className="p-6 pb-32 md:pl-28 md:pt-10 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8 pt-4">
        <h1 className="text-3xl font-black">Planos de Treino</h1>
        <button 
          onClick={() => {
            setIsManageMode(!isManageMode);
            setEditingTemplateId(null);
            setEditingExerciseId(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm ${isManageMode ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}
        >
          <Settings2 size={18} /> {isManageMode ? "Finalizar" : "Gerenciar"}
        </button>
      </div>

      {isManageMode && (
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 bg-gray-900/40 p-5 rounded-3xl border border-gray-800">
          <h2 className="text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-4">Base de Exercícios (Clique para editar)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {exercises.map(ex => (
              <div key={ex.id} className="bg-gray-900 border border-gray-800 p-3 rounded-xl flex justify-between items-center gap-2">
                {editingExerciseId === ex.id ? (
                  <input 
                    className="bg-gray-800 text-white text-[16px] w-full p-2 rounded-lg outline-none border border-indigo-500"
                    value={tempName}
                    onChange={e => setTempName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveEditExercise()}
                    onBlur={saveEditExercise}
                    autoFocus
                  />
                ) : (
                  <>
                    <span className="text-[12px] truncate font-bold text-gray-100">{ex.name}</span>
                    <button onClick={() => startEditExercise(ex)} className="text-gray-600 hover:text-indigo-400 p-1"><Edit2 size={12}/></button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {templates.map(template => (
          <div key={template.id} className="relative group">
            <div className={`bg-gray-900 border border-gray-800 p-6 rounded-[2rem] transition-all ${isManageMode ? 'ring-2 ring-indigo-500/20' : 'hover:border-indigo-500/50'}`}>
              <div className="flex justify-between items-start mb-2">
                {editingTemplateId === template.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input 
                      className="bg-gray-800 border border-indigo-500 rounded-2xl px-4 py-3 text-white font-bold outline-none flex-1 text-[16px]"
                      value={tempName}
                      onChange={e => setTempName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveEditTemplate()}
                      autoFocus
                    />
                    <button onClick={saveEditTemplate} className="text-white bg-emerald-600 p-3 rounded-2xl shadow-lg"><Check size={20}/></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 w-full justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-gray-100">{template.name}</h3>
                      {isManageMode && (
                        <button onClick={() => startEditTemplate(template)} className="text-gray-500 hover:text-indigo-400 p-1"><Edit2 size={16} /></button>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                       {isManageMode ? (
                        <button onClick={() => deleteTemplate(template.id)} className="bg-red-500/10 text-red-500 p-3 rounded-2xl border border-red-500/20"><Trash2 size={20}/></button>
                      ) : (
                        <Link to={`/active/${template.id}`} className="bg-indigo-600 p-3 rounded-2xl text-white shadow-xl shadow-indigo-600/30 active:scale-95 transition-all">
                           <Play size={20} fill="currentColor" />
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-gray-500 text-xs mb-6 font-medium">{template.description}</p>
              <div className="flex flex-wrap gap-2">
                {template.exercises.map(exId => (
                  <span key={exId} className="bg-gray-800/80 text-gray-400 text-[10px] px-3 py-1 rounded-full uppercase font-black tracking-tight">
                    {exercises.find(e => e.id === exId)?.name || 'Exercício'}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="fixed bottom-24 right-6 flex flex-col gap-4 items-center z-50 md:bottom-10 md:right-10">
        <Link to="/" className="bg-gray-800 p-3.5 rounded-full shadow-2xl text-gray-400 border border-gray-700 active:scale-90">
          <HomeIcon size={22} />
        </Link>
        <button onClick={addNewWorkout} className="bg-indigo-600 p-4 rounded-full shadow-2xl text-white border border-indigo-400 active:scale-90">
          <Plus size={26} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

const ActiveWorkout = ({ 
  prs, 
  templates, 
  exercises,
  onUpdateTemplates,
  onUpdateExercises,
  onSaveSession 
}: { 
  prs: PersonalRecord[], 
  templates: WorkoutTemplate[], 
  exercises: Exercise[],
  onUpdateTemplates: (t: WorkoutTemplate[]) => void,
  onUpdateExercises: (e: Exercise[]) => void,
  onSaveSession: (session: WorkoutSession) => void 
}) => {
  const { id: templateId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const template = templates.find(t => t.id === templateId);
  const searchParams = new URLSearchParams(location.search);
  const isResuming = searchParams.get('resume') === 'true';
  
  const DRAFT_KEY = `titanlift_draft_${templateId}`;
  const START_TIME_KEY = 'titanlift_active_start_time';
  const TIMER_RUNNING_KEY = 'titanlift_timer_is_running';
  const LAST_ACTIVE_IDX_KEY = `titanlift_last_idx_${templateId}`;
  
  const exerciseRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [activeExercises, setActiveExercises] = useState<ActiveExercise[]>(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try { return JSON.parse(draft); } catch(e) { }
    }
    
    return template?.exercises.map(exId => {
      const memoryKey = `titanlift_config_v2_${exId}`;
      const memory = localStorage.getItem(memoryKey);
      
      if (memory) {
        try {
          const config = JSON.parse(memory);
          return {
            exerciseId: exId,
            name: exercises.find(e => e.id === exId)?.name || 'Exercício',
            sets: config.sets.map((s: any) => ({ ...s, completed: false })),
            notes: config.notes || ''
          };
        } catch {}
      }

      return {
        exerciseId: exId,
        name: exercises.find(e => e.id === exId)?.name || 'Exercício',
        sets: Array(3).fill(null).map(() => ({ reps: 10, weight: 0, completed: false })),
        notes: ''
      };
    }) || [];
  });

  const [activeDuration, setActiveDuration] = useState("00:00:00");
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
  const [focusedExerciseIdx, setFocusedExerciseIdx] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('titanlift_last_active_template', templateId || '');
    
    const interval = setInterval(() => {
      const isRunning = localStorage.getItem(TIMER_RUNNING_KEY) === 'true';
      const elapsedTimeKey = 'titanlift_active_elapsed_time';
      let totalMs = parseInt(localStorage.getItem(elapsedTimeKey) || '0');
      
      if (isRunning) {
        const startTime = localStorage.getItem(START_TIME_KEY);
        if (startTime) totalMs += Date.now() - parseInt(startTime);
      }
      setActiveDuration(formatDuration(totalMs));
    }, 200);

    if (isResuming) {
      const lastIdx = parseInt(localStorage.getItem(LAST_ACTIVE_IDX_KEY) || '0');
      setTimeout(() => {
        setFocusedExerciseIdx(lastIdx);
        exerciseRefs.current[lastIdx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 400);
    }

    return () => clearInterval(interval);
  }, [isResuming, templateId]);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(activeExercises));
  }, [activeExercises, DRAFT_KEY]);

  const [plateWeight, setPlateWeight] = useState<number | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showAddExerciseList, setShowAddExerciseList] = useState(false);
  const [isManageMode, setIsManageMode] = useState(false);
  const [editingExIndex, setEditingExIndex] = useState<number | null>(null);
  const [newExerciseName, setNewExerciseName] = useState("");

  const startSessionTimer = () => {
    if (localStorage.getItem(TIMER_RUNNING_KEY) !== 'true' && parseInt(localStorage.getItem('titanlift_active_elapsed_time') || '0') === 0) {
      localStorage.setItem(START_TIME_KEY, Date.now().toString());
      localStorage.setItem(TIMER_RUNNING_KEY, 'true');
    }
  };

  const totalCompletedSets = useMemo(() => activeExercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0), [activeExercises]);
  const totalSets = useMemo(() => activeExercises.reduce((acc, ex) => acc + ex.sets.length, 0), [activeExercises]);
  const overallProgress = totalSets > 0 ? (totalCompletedSets / totalSets) * 100 : 0;

  const persistExerciseConfig = (exerciseIdx: number) => {
    const ex = activeExercises[exerciseIdx];
    const memoryKey = `titanlift_config_v2_${ex.exerciseId}`;
    localStorage.setItem(memoryKey, JSON.stringify({
      sets: ex.sets.map(s => ({ weight: s.weight, reps: s.reps })),
      notes: ex.notes
    }));
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof WorkoutSet, value: any) => {
    startSessionTimer();
    const updated = [...activeExercises];
    const oldValue = updated[exerciseIndex].sets[setIndex][field];
    updated[exerciseIndex].sets[setIndex] = { ...updated[exerciseIndex].sets[setIndex], [field]: value };
    
    if (field === 'completed' && value === true && oldValue === false) {
      const exId = updated[exerciseIndex].exerciseId;
      window.dispatchEvent(new CustomEvent('titanlift_start_rest', { detail: { exerciseId: exId } }));
      localStorage.setItem(LAST_ACTIVE_IDX_KEY, exerciseIndex.toString());
    }

    // Salvamento individual para evitar perda de dados
    persistExerciseConfig(exerciseIndex);
    setActiveExercises(updated);
  };

  const updateNote = (exerciseIndex: number, value: string) => {
    const updated = [...activeExercises];
    updated[exerciseIndex].notes = value;
    setActiveExercises(updated);
    persistExerciseConfig(exerciseIndex);
  };

  const addExerciseToPlan = (ex: Exercise) => {
    const memoryKey = `titanlift_config_v2_${ex.id}`;
    const memory = localStorage.getItem(memoryKey);
    let initialSets = Array(3).fill(null).map(() => ({ reps: 10, weight: 0, completed: false }));
    let initialNotes = '';

    if (memory) {
      try {
        const config = JSON.parse(memory);
        initialSets = config.sets.map((s: any) => ({ ...s, completed: false }));
        initialNotes = config.notes || '';
      } catch {}
    }

    setActiveExercises(prev => [...prev, {
      exerciseId: ex.id,
      name: ex.name,
      sets: initialSets,
      notes: initialNotes
    }]);

    if (templateId && templateId !== 'custom') {
      const updatedTemplates = templates.map(t => {
        if (t.id === templateId) {
          const newExercisesList = [...t.exercises];
          if (!newExercisesList.includes(ex.id)) newExercisesList.push(ex.id);
          return { ...t, exercises: newExercisesList };
        }
        return t;
      });
      onUpdateTemplates(updatedTemplates);
    }
    setShowAddExerciseList(false);
  };

  const handleCreateNewExercise = () => {
    if (!newExerciseName.trim()) return;
    const newEx: Exercise = {
      id: `custom-ex-${Date.now()}`,
      name: newExerciseName.trim(),
      category: 'Personalizado'
    };
    onUpdateExercises([...exercises, newEx]);
    addExerciseToPlan(newEx);
    setNewExerciseName("");
    setShowAddExerciseList(false);
  };

  const handleFinish = () => {
    // Calculamos o tempo gasto ATÉ O MOMENTO (baseado na diferença se o timer estiver rodando)
    const isRunning = localStorage.getItem(TIMER_RUNNING_KEY) === 'true';
    const elapsedBase = parseInt(localStorage.getItem('titanlift_active_elapsed_time') || '0');
    let finalMs = elapsedBase;
    if (isRunning) {
      const startTime = localStorage.getItem(START_TIME_KEY);
      if (startTime) finalMs += Date.now() - parseInt(startTime);
    }
    
    const session: WorkoutSession = {
      id: Date.now().toString(),
      templateId: templateId || 'custom',
      templateName: template?.name || 'Personalizado',
      date: new Date().toISOString(),
      exercises: activeExercises,
      durationMs: finalMs
    };
    
    onSaveSession(session);
    
    // IMPORTANTE: Limpamos apenas o rascunho DESTE treino
    // O cronômetro "Tempo de Academia" na Home CONTINUA contando, pois ele é global da sessão.
    localStorage.removeItem(DRAFT_KEY);
    localStorage.removeItem(LAST_ACTIVE_IDX_KEY);
    localStorage.removeItem('titanlift_last_active_template');
    
    navigate(`/result/${session.id}`);
  };

  if (!template) return <div className="p-10 text-center text-gray-500">Plano não encontrado</div>;

  return (
    <div className="p-4 pb-32 md:pl-28 md:pt-10 max-w-4xl mx-auto">
      <div className="fixed top-12 left-0 right-0 z-[100] bg-gray-950/95 backdrop-blur-lg px-6 pt-[env(safe-area-inset-top)] pb-4 border-b border-gray-800 shadow-2xl md:left-20">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-2">
               <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                 <Clock size={12} /> Academia: {activeDuration}
               </span>
               <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{Math.round(overallProgress)}%</span>
            </div>
            <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
               <div className="h-full bg-indigo-500 transition-all duration-700 ease-in-out shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{width: `${overallProgress}%`}} />
            </div>
          </div>
      </div>

      <div className="flex justify-between items-center mb-6 pt-36">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowExitConfirm(true)} className="p-2 -ml-2 text-gray-500 hover:text-white transition-all"><ArrowLeft size={24} /></button>
          <h1 className="text-2xl font-black truncate max-w-[180px]">{template.name}</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsManageMode(!isManageMode)} className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs uppercase shadow-xl transition-all ${isManageMode ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            <Settings2 size={18} /> <span className="hidden sm:inline">Gerenciar</span>
          </button>
          <button onClick={handleFinish} className="bg-emerald-600 text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-emerald-500 active:scale-95 transition-all">Finalizar</button>
        </div>
      </div>

      <div className="space-y-4">
        {activeExercises.map((ex, exIdx) => {
          const isFocused = focusedExerciseIdx === exIdx;
          return (
            <div 
              key={exIdx} 
              ref={el => { exerciseRefs.current[exIdx] = el; }}
              onClick={() => {
                setFocusedExerciseIdx(exIdx);
                localStorage.setItem(LAST_ACTIVE_IDX_KEY, exIdx.toString());
              }}
              className={`bg-gray-900 rounded-[2rem] p-4 border transition-all duration-300 shadow-xl relative overflow-hidden ${isFocused ? 'border-indigo-500/50 bg-gray-900/90' : 'border-gray-800'}`}
            >
              {isFocused && (
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,1)]" />
              )}

              <div className="flex justify-between items-center mb-4 px-2">
                <div className="flex-1 flex items-center gap-2">
                  {editingExIndex === exIdx ? (
                    <div className="flex gap-2 w-full items-center">
                      <input 
                        className="bg-gray-800 border border-indigo-500 rounded-xl px-3 py-2 text-white font-bold outline-none flex-1 text-[16px]"
                        value={ex.name}
                        onChange={(e) => {
                          const updated = [...activeExercises];
                          updated[exIdx].name = e.target.value;
                          setActiveExercises(updated);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && setEditingExIndex(null)}
                        autoFocus
                      />
                      <button onClick={() => setEditingExIndex(null)} className="bg-emerald-600 text-white p-2 rounded-xl transition-all active:scale-90"><Check size={18} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className={`text-lg font-black transition-colors ${isFocused ? 'text-indigo-400' : 'text-gray-100'}`}>{ex.name}</h2>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingNoteIndex(editingNoteIndex === exIdx ? null : exIdx); }} 
                        className={`p-2 rounded-lg transition-colors ${ex.notes ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-600 hover:text-indigo-400'}`}
                      >
                        <NotebookPen size={18} />
                      </button>
                      {isManageMode && <button onClick={() => setEditingExIndex(exIdx)} className="text-gray-500 hover:text-indigo-400 p-1"><Edit2 size={14} /></button>}
                    </div>
                  )}
                </div>
                {isManageMode && (
                  <button onClick={() => { if (confirm("Remover este exercício do treino atual?")) { const updated = [...activeExercises]; updated.splice(exIdx, 1); setActiveExercises(updated); } }} className="bg-red-500/10 text-red-500 p-2 rounded-xl border border-red-500/20 ml-2 transition-all active:scale-90">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {editingNoteIndex === exIdx && (
                <textarea 
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-gray-300 mb-4 h-24 outline-none focus:ring-1 focus:ring-indigo-500" 
                  placeholder="Dicas técnicas ou observações da série..." 
                  value={ex.notes} 
                  onChange={(e) => updateNote(exIdx, e.target.value)} 
                />
              )}
              
              <div className="mb-6"><RestTimer exerciseId={ex.exerciseId} /></div>
              
              <div className="space-y-1.5 mb-5">
                <div className="grid gap-2 [grid-template-columns:3rem_1fr_1fr_2rem_1.5rem] text-[9px] font-black text-gray-600 px-2 uppercase text-center items-center mb-1">
                  <span>Série</span><span>Peso (kg)</span><span>Reps</span><span>OK</span><span />
                </div>
                {ex.sets.map((set, setIdx) => (
                  <div key={setIdx} className="grid items-center gap-2 [grid-template-columns:3rem_1fr_1fr_2rem_1.5rem]">
                    <span className="text-xs font-black text-gray-600 text-center">{setIdx + 1}</span>
                    <div className="relative">
                      <input 
                        type="number" inputMode="decimal" 
                        className="w-full bg-gray-800 h-11 rounded-xl text-center font-bold border border-gray-800 text-[16px] outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                        value={set.weight === 0 ? '' : set.weight} 
                        placeholder="0" 
                        onChange={(e) => updateSet(exIdx, setIdx, 'weight', e.target.value === '' ? 0 : Number(e.target.value))} 
                      />
                      <button onClick={() => setPlateWeight(Number(set.weight))} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-indigo-400"><Calculator size={14}/></button>
                    </div>
                    <select 
                      className="w-full bg-gray-800 h-11 rounded-xl text-center font-bold border border-gray-800 text-[16px] appearance-none outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer" 
                      value={set.reps || 10} 
                      onChange={(e) => updateSet(exIdx, setIdx, 'reps', Number(e.target.value))}
                    >
                      {Array.from({ length: 30 }, (_, i) => i + 1).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                    <button 
                      className={`h-11 w-full rounded-xl flex items-center justify-center transition-all ${set.completed ? 'bg-emerald-600 text-white shadow-emerald-600/20' : 'bg-gray-800 text-gray-600'}`} 
                      onClick={() => updateSet(exIdx, setIdx, 'completed', !set.completed)}
                    ><CheckCircle2 size={20} /></button>
                    <button 
                      onClick={() => { const updated = [...activeExercises]; updated[exIdx].sets.splice(setIdx, 1); setActiveExercises(updated); persistExerciseConfig(exIdx); }} 
                      disabled={ex.sets.length <= 1} 
                      className="text-gray-700 hover:text-red-500 p-2 disabled:opacity-0 transition-all"
                    ><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => { const updated = [...activeExercises]; const lastSet = updated[exIdx].sets[updated[exIdx].sets.length - 1]; updated[exIdx].sets.push({...lastSet, completed: false}); setActiveExercises(updated); persistExerciseConfig(exIdx); }} 
                className="w-full border border-dashed border-gray-800 text-gray-500 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800/50 transition-all active:scale-95"
              >
                <Plus size={14} className="inline mr-1"/> Nova Série
              </button>
            </div>
          );
        })}
      </div>

      <button onClick={() => setShowAddExerciseList(true)} className="w-full mt-8 bg-gray-900 border border-indigo-500/20 text-indigo-400 py-4 rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 active:scale-95 transition-all"><PlusCircle size={20}/> Incluir Exercício</button>
      
      {showAddExerciseList && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[300] p-6 pt-20 animate-in fade-in zoom-in-95 flex flex-col">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black">Lista de Exercícios</h3>
              <button onClick={() => setShowAddExerciseList(false)} className="bg-gray-800 p-2 rounded-full active:scale-90 transition-all"><X size={24}/></button>
           </div>
           <div className="bg-gray-900 border border-gray-800 p-4 rounded-3xl mb-8">
             <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Novo Exercício</p>
             <div className="flex gap-2">
               <input className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white font-bold outline-none text-[16px] focus:ring-2 focus:ring-indigo-500" placeholder="Nome do movimento..." value={newExerciseName} onChange={(e) => setNewExerciseName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreateNewExercise()} />
               <button onClick={handleCreateNewExercise} className="bg-indigo-600 text-white p-3 rounded-xl disabled:opacity-50 active:scale-90 transition-all" disabled={!newExerciseName.trim()}><PlusSquare size={24}/></button>
             </div>
           </div>
           <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Sua Biblioteca</p>
           <div className="grid gap-3 overflow-y-auto flex-1 no-scrollbar pb-20">
              {exercises.map(ex => (
                <button key={ex.id} onClick={() => addExerciseToPlan(ex)} className="bg-gray-900 border border-gray-800 p-5 rounded-[2rem] text-left flex items-center justify-between group active:bg-gray-800 transition-all">
                  <span className="font-bold text-lg text-gray-100">{ex.name}</span>
                  <Plus className="text-indigo-500 group-active:scale-125 transition-transform" />
                </button>
              ))}
           </div>
        </div>
      )}

      {plateWeight !== null && <PlateCalculator weight={plateWeight} onClose={() => setPlateWeight(null)} />}
      {showExitConfirm && <ExitConfirmDialog onCancel={() => setShowExitConfirm(false)} onConfirm={() => navigate('/')} />}
    </div>
  );
};

const WorkoutResult = ({ sessions }: { sessions: WorkoutSession[] }) => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const session = sessions.find(s => s.id === sessionId);

  if (!session) return <div className="p-10 text-center text-gray-500">Sessão não encontrada</div>;

  return (
    <div className="p-6 pb-32 md:pl-28 md:pt-10 max-w-4xl mx-auto">
      <div className="text-center mb-10 pt-4">
        <div className="inline-flex bg-emerald-600 p-6 rounded-[2.5rem] mb-6 shadow-2xl animate-bounce"><Trophy size={48} className="text-white" /></div>
        <h1 className="text-4xl font-black mb-2 text-white">Treino Salvo!</h1>
        <p className="text-gray-500 font-medium">Histórico atualizado com sucesso.</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] p-8 mb-6 shadow-xl">
        <div className="flex flex-col items-center gap-2 mb-8">
            <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Sessão Finalizada em</p>
            <p className="text-xs text-gray-500 mt-2 font-bold">{new Date(session.date).toLocaleDateString()} às {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        
        <div className="space-y-4 mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-800 pb-2">Exercícios Realizados</h3>
            {session.exercises.map((ex, i) => (
                <div key={i} className="flex justify-between items-center py-1">
                    <span className="text-sm font-bold text-gray-300">{ex.name}</span>
                    <span className="text-xs font-black text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full">{ex.sets.filter(s => s.completed).length} Séries</span>
                </div>
            ))}
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800 text-center space-y-4">
          <div className="inline-flex items-center justify-center p-2 bg-indigo-500/10 rounded-full text-indigo-400"><Heart size={16} fill="currentColor" /></div>
          <p className="text-sm font-black text-gray-100">TitanLift: Evolução é o foco.</p>
        </div>
      </div>

      <button onClick={() => navigate('/')} className="w-full bg-indigo-600 py-5 rounded-3xl font-black uppercase tracking-widest text-sm shadow-2xl active:scale-95 transition-all">Ir para a Home</button>
    </div>
  );
};

const History = ({ sessions, onDeleteSession }: { sessions: WorkoutSession[], onDeleteSession: (id: string) => void }) => {
  const stats = useMemo(() => {
    return [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(s => ({
      displayFull: `${new Date(s.date).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}`,
      seconds: Math.round((s.durationMs || 0) / 1000),
      duration: formatDuration(s.durationMs || 0)
    }));
  }, [sessions]);

  return (
    <div className="p-6 pb-32 md:pl-28 md:pt-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black mb-8 pt-4">Histórico</h1>

      <div className="bg-gray-900 border border-gray-800 rounded-[2rem] p-6 mb-8">
        <div className="flex items-center gap-3 mb-6"><CalendarDays size={20} className="text-indigo-400" /><h2 className="text-sm font-black uppercase tracking-widest text-gray-300">Intensidade</h2></div>
        <div className="h-40 w-full min-h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats}>
              <XAxis dataKey="displayFull" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6b7280', fontWeight: 'bold'}} />
              <YAxis hide />
              <Tooltip cursor={{fill: 'rgba(99,102,241,0.05)'}} content={({ active, payload }) => active && payload?.[0] ? <div className="bg-gray-950 border border-gray-800 p-2 rounded-xl text-[10px] font-black text-indigo-400">{payload[0].payload.duration}</div> : null} />
              <Bar dataKey="seconds" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-4">
        {sessions.length === 0 ? (
          <div className="text-center py-20 bg-gray-900/20 border border-dashed border-gray-800 rounded-[2rem]">
            <HistoryIcon size={40} className="text-gray-800 mx-auto mb-4" />
            <p className="text-gray-500 font-bold">Nenhum treino registrado.</p>
          </div>
        ) : sessions.map(s => (
          <div key={s.id} className="bg-gray-900 border border-gray-800 p-6 rounded-[2rem] shadow-sm hover:border-gray-700 transition-all relative">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <p className="font-black text-indigo-400 text-lg">{s.templateName}</p>
                <p className="text-[10px] text-gray-400 font-black uppercase mt-1">{new Date(s.date).toLocaleDateString()} às {new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <button onClick={() => window.confirm("Excluir este treino do seu histórico?") && onDeleteSession(s.id)} className="text-gray-600 hover:text-red-500 p-2 transition-all active:scale-90"><Trash2 size={20} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-950/40 p-3 rounded-2xl border border-gray-800/50"><p className="text-[8px] font-black text-gray-600 uppercase mb-1">Volume Estimado</p><p className="text-sm font-black text-gray-100">{s.exercises.reduce((a, b) => a + b.sets.reduce((c, d) => c + d.weight, 0), 0)}kg</p></div>
                <div className="bg-gray-950/40 p-3 rounded-2xl border border-gray-800/50"><p className="text-[8px] font-black text-gray-600 uppercase mb-1">Séries OK</p><p className="text-sm font-black text-gray-100">{s.exercises.reduce((a, b) => a + b.sets.filter(s => s.completed).length, 0)}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Progress = ({ prs, sessions }: { prs: PersonalRecord[], sessions: WorkoutSession[] }) => {
  const totalTrainingTime = useMemo(() => sessions.reduce((acc, s) => acc + (s.durationMs || 0), 0), [sessions]);
  return (
    <div className="p-6 pb-32 md:pl-28 md:pt-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black mb-8 pt-4">Evolução</h1>
      <div className="bg-gradient-to-br from-indigo-900/20 to-emerald-900/10 border border-gray-800 rounded-[2rem] p-6 mb-8">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Tempo Total Acumulado</p>
        <p className="text-4xl font-black text-white">{formatDurationFull(totalTrainingTime)}</p>
      </div>
      <h2 className="text-lg font-black text-gray-300 mb-4 uppercase tracking-widest text-center">Melhores Cargas</h2>
      <div className="grid gap-4">
        {prs.length === 0 ? (
          <div className="text-center py-20 text-gray-600">Complete exercícios para ver seus recordes aqui.</div>
        ) : prs.map(pr => (
          <div key={pr.exerciseId} className="bg-gray-900 border border-gray-800 p-6 rounded-[2rem] flex justify-between items-center shadow-xl">
            <div>
              <h3 className="font-black text-white text-lg">{pr.exerciseName}</h3>
              <p className="text-xs text-gray-500 font-bold">{new Date(pr.date).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-emerald-400">{pr.weight}<span className="text-xs text-emerald-600 ml-1">kg</span></p>
              <p className="text-[10px] text-gray-600 uppercase font-black">Carga Máxima</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [prs, setPrs] = useState<PersonalRecord[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const s = localStorage.getItem('titanlift_sessions');
    const p = localStorage.getItem('titanlift_prs');
    const t = localStorage.getItem('titanlift_templates');
    const e = localStorage.getItem('titanlift_exercises');
    
    let loadedSessions: WorkoutSession[] = [];
    if (s) try { loadedSessions = JSON.parse(s); } catch { }
    // Manter treinos por 30 dias no histórico visível
    const filteredSessions = loadedSessions.filter(session => (Date.now() - new Date(session.date).getTime()) <= 30 * 24 * 60 * 60 * 1000);
    
    setSessions(filteredSessions);
    if (p) try { setPrs(JSON.parse(p)); } catch { }
    if (t) try { setTemplates(JSON.parse(t)); } catch { setTemplates(DEFAULT_TEMPLATES); } else setTemplates(DEFAULT_TEMPLATES);
    if (e) try { setExercises(JSON.parse(e)); } catch { setExercises(DEFAULT_EXERCISES); } else setExercises(DEFAULT_EXERCISES);
  }, []);

  useEffect(() => {
    localStorage.setItem('titanlift_sessions', JSON.stringify(sessions));
    localStorage.setItem('titanlift_prs', JSON.stringify(prs));
    localStorage.setItem('titanlift_templates', JSON.stringify(templates));
    localStorage.setItem('titanlift_exercises', JSON.stringify(exercises));
  }, [sessions, prs, templates, exercises]);

  const saveSession = (newSession: WorkoutSession) => {
    setSessions(prev => [newSession, ...prev]);
    const updatedPrs = [...prs];
    newSession.exercises.forEach(ex => {
      const bestSet = ex.sets.reduce((max, set) => set.weight > max.weight ? set : max, { weight: 0, reps: 0, completed: false });
      if (bestSet.weight > 0) {
        const idx = updatedPrs.findIndex(p => p.exerciseId === ex.exerciseId);
        if (idx === -1 || bestSet.weight > updatedPrs[idx].weight) {
          const newPr = { exerciseId: ex.exerciseId, exerciseName: ex.name, weight: bestSet.weight, reps: bestSet.reps, date: newSession.date };
          if (idx > -1) updatedPrs[idx] = newPr; else updatedPrs.push(newPr);
        }
      }
    });
    setPrs(updatedPrs);
    showToast("Treino finalizado e salvo!");
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    showToast("Sessão excluída.");
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-inter">
        <Navbar />
        <main className="flex-1 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Home prs={prs} sessions={sessions} templates={templates} />} />
            <Route path="/workouts" element={<WorkoutList templates={templates} onUpdateTemplates={setTemplates} exercises={exercises} onUpdateExercises={setExercises} />} />
            <Route path="/active/:id" element={<ActiveWorkout prs={prs} templates={templates} exercises={exercises} onUpdateTemplates={setTemplates} onUpdateExercises={setExercises} onSaveSession={saveSession} />} />
            <Route path="/result/:sessionId" element={<WorkoutResult sessions={sessions} />} />
            <Route path="/history" element={<History sessions={sessions} onDeleteSession={deleteSession} />} />
            <Route path="/progress" element={<Progress prs={prs} sessions={sessions} />} />
          </Routes>
        </main>
        <Toast message={toastMessage} visible={toastVisible} />
      </div>
    </Router>
  );
}
