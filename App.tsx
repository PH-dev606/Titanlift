import React, { useState, useEffect, useMemo, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
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
  Settings2,
  Home as HomeIcon,
  Calculator,
  Activity,
  BarChart3,
  AlertTriangle,
  Search,
  PlusSquare
} from 'lucide-react';
import { WorkoutSession, PersonalRecord, ActiveExercise, WorkoutSet, WorkoutTemplate, Exercise } from './types';
import { EXERCISES as DEFAULT_EXERCISES, WORKOUT_TEMPLATES as DEFAULT_TEMPLATES } from './constants';
import { getMotivationalQuote } from './services/geminiService';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
    <div className="bg-gray-900 border border-gray-800 w-full max-w-sm rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
      <div className="bg-amber-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertTriangle size={32} className="text-amber-500" />
      </div>
      <h2 className="text-xl font-black text-white mb-3">Sair do treino?</h2>
      <p className="text-gray-400 text-sm mb-8 leading-relaxed">
        Seu progresso atual é salvo automaticamente como rascunho.
      </p>
      <div className="flex flex-col gap-3">
        <button 
          onClick={onConfirm}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98]"
        >
          Sair para Início
        </button>
        <button 
          onClick={onCancel}
          className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98]"
        >
          Continuar Treino
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
          <h3 className="font-black text-indigo-400 uppercase text-xs tracking-widest">Barra (20kg) + Anilhas</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20}/></button>
        </div>
        <div className="text-center mb-6">
          <p className="text-4xl font-black text-white">{weight} <span className="text-sm text-gray-500">kg</span></p>
          <p className="text-[10px] text-gray-500 uppercase mt-1">{plates.reduce((a, b) => a + b, 0)}kg por lado</p>
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
        <button onClick={onClose} className="w-full mt-8 bg-gray-800 py-3 rounded-xl font-bold text-sm">Entendido</button>
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

const RestTimer = () => {
  const [minInput, setMinInput] = useState<number | ''>(0);
  const [secInput, setSecInput] = useState<number | ''>(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (window.navigator.vibrate) window.navigator.vibrate([300, 100, 300]);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
    if (!isActive && timeLeft === 0) {
      const m = typeof minInput === 'number' ? minInput : 0;
      const s = typeof secInput === 'number' ? secInput : 0;
      const totalSeconds = (m * 60) + s;
      if (totalSeconds > 0) setTimeLeft(totalSeconds);
      else return;
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
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
              <button onClick={toggleTimer} className="p-1.5 bg-indigo-600/20 text-indigo-400 rounded-lg hover:bg-indigo-600/30 active:scale-90 transition-all border border-indigo-500/20">
                {isActive ? <Pause size={12} /> : <Play size={12} fill="currentColor" />}
              </button>
              {/* Corrected: Using onClick instead of resetTimer to fix property assignment error on line 194/196 */}
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
                onChange={(e) => setMinInput(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                className="bg-gray-900 border border-gray-700 w-10 text-center rounded-lg py-1 text-[16px] font-black text-white outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-gray-700 font-black text-xs">:</span>
              <input 
                type="number" 
                value={secInput === 0 ? '' : secInput}
                placeholder="0"
                onChange={(e) => setSecInput(e.target.value === '' ? '' : Math.min(59, Math.max(0, Number(e.target.value))))}
                className="bg-gray-900 border border-gray-700 w-10 text-center rounded-lg py-1 text-[16px] font-black text-white outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <button 
              onClick={toggleTimer}
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

  useEffect(() => {
    getMotivationalQuote().then(setQuote);
  }, []);

  const totalVolumeLast7Days = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sessions
      .filter(s => new Date(s.date) >= weekAgo)
      .reduce((acc, s) => acc + (Number(s.totalVolume) || 0), 0);
  }, [sessions]);

  return (
    <div className="p-6 pb-32 md:pl-28 md:pt-10 max-w-4xl mx-auto">
      <header className="mb-10 pt-4">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">TitanLift</h1>
        <p className="text-gray-400 italic text-sm">"{quote}"</p>
      </header>

      <div className="bg-gradient-to-br from-indigo-900/20 to-emerald-900/10 border border-gray-800 rounded-3xl p-6 mb-10">
        <div className="flex items-center gap-3 mb-4">
          <Activity size={20} className="text-indigo-400" />
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-300">Volume Semanal</h2>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-black text-white">{totalVolumeLast7Days.toLocaleString()}</span>
          <span className="text-gray-500 font-bold mb-1">kg totais</span>
        </div>
        <div className="mt-4 w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500" style={{ width: `${Math.min(100, (totalVolumeLast7Days / 10000) * 100)}%` }} />
        </div>
        <p className="text-[10px] text-gray-500 mt-2">Sua meta: 10.000kg/semana</p>
      </div>

      <section className="mb-10">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-xl font-bold text-gray-100">Planos Rápidos</h2>
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
                  Começar <Play size={14} className="ml-1 fill-current" />
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
              <p className="text-gray-500 text-xs">{sessions.length} treinos realizados</p>
            </div>
          </div>
          <ChevronRight className="text-indigo-500 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link to="/progress" className="bg-gray-900 border border-gray-800 p-6 rounded-3xl flex items-center justify-between group hover:bg-gray-800 transition-all">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-600 p-3 rounded-2xl shadow-lg shadow-emerald-600/20"><TrendingUp size={24} className="text-white" /></div>
            <div>
              <h3 className="font-bold text-lg">Evolução</h3>
              <p className="text-gray-500 text-xs">{prs.length} Recordes Pessoais</p>
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
        <h1 className="text-3xl font-black">Seus Planos</h1>
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
          <h2 className="text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-4">Base de Exercícios (Toque no nome para editar)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {exercises.map(ex => (
              <div key={ex.id} className="bg-gray-900 border border-gray-800 p-3 rounded-xl flex justify-between items-center gap-2">
                {editingExerciseId === ex.id ? (
                  <div className="flex w-full gap-1">
                    <input 
                      className="bg-gray-800 text-white text-[16px] w-full p-2 rounded-lg outline-none border border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      value={tempName}
                      onChange={e => setTempName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveEditExercise()}
                      onBlur={saveEditExercise}
                      autoFocus
                    />
                  </div>
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
                      className="bg-gray-800 border border-indigo-500 rounded-2xl px-4 py-3 text-white font-bold outline-none flex-1 text-[16px] focus:ring-2 focus:ring-indigo-500"
                      value={tempName}
                      onChange={e => setTempName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveEditTemplate()}
                      autoFocus
                    />
                    <button onClick={saveEditTemplate} className="text-white bg-emerald-600 p-3 rounded-2xl shadow-lg shadow-emerald-600/20"><Check size={20}/></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 w-full justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-gray-100">{template.name}</h3>
                      {isManageMode && (
                        <button 
                          onClick={() => startEditTemplate(template)}
                          className="text-gray-500 hover:text-indigo-400 p-1"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                       {isManageMode ? (
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteTemplate(template.id);
                          }} 
                          className="bg-red-500/10 text-red-500 p-3 rounded-2xl border border-red-500/20 hover:bg-red-500/20 active:scale-90 transition-all z-10"
                        >
                          <Trash2 size={20}/>
                        </button>
                      ) : (
                        <Link 
                          to={`/active/${template.id}`} 
                          className="bg-indigo-600 p-3 rounded-2xl text-white shadow-xl shadow-indigo-600/30 active:scale-95 transition-all"
                        >
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
      
      {/* Botões Flutuantes Compactos */}
      <div className="fixed bottom-24 right-6 flex flex-col gap-4 items-center z-50 md:bottom-10 md:right-10">
        <Link to="/" className="bg-gray-800 p-3.5 rounded-full shadow-2xl text-gray-400 hover:text-white transition-all border border-gray-700 active:scale-90 hover:bg-gray-750">
          <HomeIcon size={22} />
        </Link>
        <button onClick={addNewWorkout} className="bg-indigo-600 p-4 rounded-full shadow-2xl text-white hover:bg-indigo-500 transition-all border border-indigo-400 active:scale-90 shadow-indigo-600/40">
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
  onUpdateExercises,
  onSaveSession 
}: { 
  prs: PersonalRecord[], 
  templates: WorkoutTemplate[], 
  exercises: Exercise[],
  onUpdateExercises: (e: Exercise[]) => void,
  onSaveSession: (session: WorkoutSession) => void 
}) => {
  const { id: templateId } = useParams();
  const navigate = useNavigate();
  const template = templates.find(t => t.id === templateId);
  
  const DRAFT_KEY = `titanlift_draft_${templateId}`;
  
  const [activeExercises, setActiveExercises] = useState<ActiveExercise[]>(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try { return JSON.parse(draft); } catch(e) { }
    }
    return template?.exercises.map(exId => ({
      exerciseId: exId,
      name: exercises.find(e => e.id === exId)?.name || 'Exercício',
      sets: Array(3).fill(null).map(() => ({ reps: 10, weight: 0, completed: false }))
    })) || [];
  });

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(activeExercises));
  }, [activeExercises, DRAFT_KEY]);

  const [plateWeight, setPlateWeight] = useState<number | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showAddExerciseList, setShowAddExerciseList] = useState(false);
  const [isManageMode, setIsManageMode] = useState(false);
  const [editingExIndex, setEditingExIndex] = useState<number | null>(null);
  const [newExerciseName, setNewExerciseName] = useState("");

  const totalCompletedSets = useMemo(() => activeExercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0), [activeExercises]);
  const totalSets = useMemo(() => activeExercises.reduce((acc, ex) => acc + ex.sets.length, 0), [activeExercises]);
  const overallProgress = totalSets > 0 ? (totalCompletedSets / totalSets) * 100 : 0;

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof WorkoutSet, value: any) => {
    const updated = [...activeExercises];
    updated[exerciseIndex].sets[setIndex] = { ...updated[exerciseIndex].sets[setIndex], [field]: value };
    setActiveExercises(updated);
  };

  const addExercise = (ex: Exercise) => {
    setActiveExercises([...activeExercises, {
      exerciseId: ex.id,
      name: ex.name,
      sets: [{ reps: 10, weight: 0, completed: false }]
    }]);
    setShowAddExerciseList(false);
  };

  const handleCreateNewExercise = () => {
    if (!newExerciseName.trim()) return;
    
    const newEx: Exercise = {
      id: `custom-ex-${Date.now()}`,
      name: newExerciseName.trim(),
      category: 'Personalizado'
    };
    
    // Atualiza base global
    onUpdateExercises([...exercises, newEx]);
    
    // Adiciona ao treino atual
    setActiveExercises([...activeExercises, {
      exerciseId: newEx.id,
      name: newEx.name,
      sets: [{ reps: 10, weight: 0, completed: false }]
    }]);
    
    setNewExerciseName("");
    setShowAddExerciseList(false);
  };

  const handleFinish = () => {
    const sessionVolume = activeExercises.reduce((acc, ex) => 
      acc + ex.sets.filter(s => s.completed).reduce((sAcc, s) => sAcc + (Number(s.weight || 0) * Number(s.reps || 0)), 0), 0);

    const session: WorkoutSession = {
      id: Date.now().toString(),
      templateId: templateId || 'custom',
      templateName: template?.name || 'Personalizado',
      date: new Date().toISOString(),
      exercises: activeExercises,
      totalVolume: sessionVolume,
      isNewPrs: []
    };
    onSaveSession(session);
    localStorage.removeItem(DRAFT_KEY);
    navigate(`/result/${session.id}`);
  };

  if (!template) return <div className="p-10 text-center">Treino não encontrado</div>;

  return (
    <div className="p-4 pb-32 md:pl-28 md:pt-10 max-w-4xl mx-auto">
      <div className="fixed top-12 left-0 right-0 z-[100] bg-gray-950/95 backdrop-blur-lg px-6 pt-[env(safe-area-inset-top)] pb-4 border-b border-gray-800 shadow-2xl md:left-20">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-2">
               <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Treino em Andamento</span>
               <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{Math.round(overallProgress)}%</span>
            </div>
            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden shadow-inner">
               <div className="h-full bg-indigo-500 transition-all duration-700 ease-in-out shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{width: `${overallProgress}%`}} />
            </div>
          </div>
      </div>

      <div className="flex justify-between items-center mb-6 pt-36">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowExitConfirm(true)} className="p-2 -ml-2 text-gray-500 hover:text-white active:scale-90 transition-all"><ArrowLeft size={24} /></button>
          <h1 className="text-2xl font-black truncate max-w-[180px]">{template.name}</h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsManageMode(!isManageMode)} 
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs uppercase shadow-xl transition-all ${isManageMode ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            <Settings2 size={18} />
            <span className="hidden sm:inline">Gerenciar</span>
            {isManageMode && <span className="sm:hidden">Sair</span>}
          </button>
          <button onClick={handleFinish} className="bg-emerald-600 text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase shadow-xl shadow-emerald-600/20 active:scale-95 transition-all">Finalizar</button>
        </div>
      </div>

      <div className="space-y-6">
        {activeExercises.map((ex, exIdx) => (
          <div key={exIdx} className="bg-gray-900 rounded-[2rem] p-4 border border-gray-800 shadow-xl relative">
            <div className="flex justify-between items-center mb-4 px-2">
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
                  <button 
                    onClick={() => setEditingExIndex(null)}
                    className="bg-emerald-600 text-white p-2 rounded-xl shadow-lg active:scale-90 transition-all"
                  >
                    <Check size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-gray-100">{ex.name}</h2>
                  {isManageMode && (
                    <button onClick={() => setEditingExIndex(exIdx)} className="text-gray-500 p-1">
                      <Edit2 size={14} />
                    </button>
                  )}
                </div>
              )}
              {isManageMode && (
                <button 
                  onClick={() => {
                    if (confirm("Remover exercício deste treino?")) {
                      const updated = [...activeExercises];
                      updated.splice(exIdx, 1);
                      setActiveExercises(updated);
                    }
                  }}
                  className="bg-red-500/10 text-red-500 p-2 rounded-xl border border-red-500/20"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            
            <div className="mb-6"><RestTimer /></div>
            
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
                      className="w-full bg-gray-800 h-11 rounded-xl text-center font-bold border border-gray-800 outline-none text-[16px] focus:ring-2 focus:ring-indigo-500 focus:bg-gray-750 transition-all"
                      value={set.weight === 0 ? '' : set.weight}
                      placeholder="0"
                      onChange={(e) => updateSet(exIdx, setIdx, 'weight', e.target.value === '' ? 0 : Number(e.target.value))}
                    />
                    <button onClick={() => setPlateWeight(Number(set.weight))} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-indigo-400"><Calculator size={14}/></button>
                  </div>
                  <div className="relative">
                    <select
                      className="w-full bg-gray-800 h-11 rounded-xl text-center font-bold border border-gray-800 outline-none text-[16px] appearance-none cursor-pointer text-gray-300 focus:ring-2 focus:ring-indigo-500"
                      value={set.reps || 10}
                      onChange={(e) => updateSet(exIdx, setIdx, 'reps', Number(e.target.value))}
                    >
                      {Array.from({ length: 25 }, (_, i) => i + 1).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <button
                    className={`h-11 w-full rounded-xl flex items-center justify-center transition-all shadow-sm ${set.completed ? 'bg-emerald-600 text-white shadow-emerald-600/20' : 'bg-gray-800 text-gray-600'}`}
                    onClick={() => updateSet(exIdx, setIdx, 'completed', !set.completed)}
                  ><CheckCircle2 size={20} /></button>
                  <button onClick={() => {
                    const updated = [...activeExercises];
                    updated[exIdx].sets.splice(setIdx, 1);
                    setActiveExercises(updated);
                  }} disabled={ex.sets.length <= 1} className="text-gray-700 hover:text-red-500 p-2 disabled:opacity-0"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
            <button onClick={() => {
              const updated = [...activeExercises];
              const lastSet = updated[exIdx].sets[updated[exIdx].sets.length - 1];
              updated[exIdx].sets.push({...lastSet, completed: false});
              setActiveExercises(updated);
            }} className="w-full border border-dashed border-gray-800 text-gray-500 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest active:bg-gray-800 transition-all flex items-center justify-center gap-2">
              <Plus size={14}/> Próxima Série
            </button>
          </div>
        ))}
      </div>

      <button 
        onClick={() => setShowAddExerciseList(true)} 
        className="w-full mt-8 bg-gray-900 border border-indigo-500/20 text-indigo-400 py-4 rounded-3xl font-black text-xs uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10"
      >
        <PlusCircle size={20}/> Adicionar Exercício
      </button>
      
      {/* Modal de Seleção de Exercício (Fica na mesma página) */}
      {showAddExerciseList && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[300] p-6 pt-20 animate-in fade-in zoom-in-95 duration-200 flex flex-col">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black">Adicionar Exercício</h3>
              <button onClick={() => setShowAddExerciseList(false)} className="bg-gray-800 p-2 rounded-full"><X size={24}/></button>
           </div>
           
           <div className="bg-gray-900 border border-gray-800 p-4 rounded-3xl mb-8">
             <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Adicionar Exercício Novo</p>
             <div className="flex gap-2">
               <input 
                 className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white font-bold outline-none text-[16px] focus:ring-2 focus:ring-indigo-500"
                 placeholder="Nome do exercício..."
                 value={newExerciseName}
                 onChange={(e) => setNewExerciseName(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleCreateNewExercise()}
               />
               <button 
                 onClick={handleCreateNewExercise}
                 className="bg-indigo-600 text-white p-3 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-90 transition-all disabled:opacity-50"
                 disabled={!newExerciseName.trim()}
               >
                 <PlusSquare size={24}/>
               </button>
             </div>
           </div>

           <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Escolher da Base</p>
           <div className="grid gap-3 overflow-y-auto flex-1 no-scrollbar pb-20">
              {exercises.map(ex => (
                <button 
                  key={ex.id}
                  onClick={() => addExercise(ex)}
                  className="bg-gray-900 border border-gray-800 p-5 rounded-[2rem] text-left hover:border-indigo-500 transition-all flex items-center justify-between group active:bg-gray-800"
                >
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

  const volumeHistory = useMemo(() => {
    if (!session) return [];
    return sessions
      .filter(s => s.templateId === session.templateId)
      .slice(0, 5)
      .reverse()
      .map(s => ({ 
        date: new Date(s.date).toLocaleDateString([], { day: '2-digit', month: '2-digit' }), 
        volume: Number(s.totalVolume) || 0,
        isCurrent: s.id === session.id
      }));
  }, [sessions, session]);

  if (!session) return <div className="p-10 text-center">Sessão não encontrada</div>;

  return (
    <div className="p-6 pb-32 md:pl-28 md:pt-10 max-w-4xl mx-auto">
      <div className="text-center mb-10 pt-4">
        <div className="inline-flex bg-emerald-600 p-6 rounded-[2.5rem] mb-6 shadow-2xl shadow-emerald-600/30 animate-bounce"><Trophy size={48} className="text-white" /></div>
        <h1 className="text-4xl font-black mb-2 text-white">Treino Pago!</h1>
        <p className="text-gray-500 font-medium">Você é o seu único limite.</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] p-8 mb-10 shadow-xl">
        <div className="flex items-center gap-3 mb-8">
          <BarChart3 size={20} className="text-indigo-400" />
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-300">Volume por Sessão (kg)</h2>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volumeHistory}>
              <XAxis dataKey="date" hide />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '16px', fontSize: '11px', fontWeight: 'bold', color: '#fff' }}
              />
              <Bar dataKey="volume" radius={[6, 6, 0, 0]}>
                {volumeHistory.map((entry, index) => (
                  <Cell key={index} fill={entry.isCurrent ? '#6366f1' : '#1f2937'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between items-center mt-8 pt-8 border-t border-gray-800">
           <div>
              <p className="text-[10px] text-gray-600 font-black uppercase mb-1">Carga Total</p>
              <p className="text-3xl font-black text-white">{(Number(session.totalVolume) || 0).toLocaleString()} <span className="text-xs text-gray-600">kg</span></p>
           </div>
           <div className="text-right">
              <p className="text-[10px] text-gray-600 font-black uppercase mb-1">Status</p>
              <p className="text-xl font-black text-emerald-400 flex items-center gap-2">Finalizado <CheckCircle2 size={18}/></p>
           </div>
        </div>
      </div>

      <button onClick={() => navigate('/')} className="w-full bg-indigo-600 py-5 rounded-3xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-indigo-600/30 active:scale-95 transition-all">Continuar Evoluindo</button>
    </div>
  );
};

const History = ({ sessions, onDeleteSession }: { sessions: WorkoutSession[], onDeleteSession: (id: string) => void }) => (
  <div className="p-6 pb-32 md:pl-28 md:pt-10 max-w-4xl mx-auto">
    <h1 className="text-3xl font-black mb-8 pt-4">Seu Histórico</h1>
    <div className="space-y-4">
      {sessions.map(s => (
        <div key={s.id} className="bg-gray-900 border border-gray-800 p-6 rounded-[2rem] flex justify-between items-center shadow-sm hover:border-gray-700 transition-all">
          <div>
            <p className="font-black text-indigo-400 text-lg">{s.templateName}</p>
            <p className="text-xs text-gray-500 font-bold">{new Date(s.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-5">
            <span className="text-xs font-black text-gray-400 uppercase tracking-tighter">{(Number(s.totalVolume) || 0).toLocaleString()}kg levados</span>
            <button onClick={() => window.confirm("Excluir este treino do histórico?") && onDeleteSession(s.id)} className="text-gray-700 hover:text-red-500 p-2 active:scale-90 transition-all"><Trash2 size={20}/></button>
          </div>
        </div>
      ))}
      {sessions.length === 0 && (
        <div className="text-center py-24 bg-gray-900/40 rounded-[3rem] border-2 border-dashed border-gray-800">
           <HistoryIcon size={48} className="mx-auto text-gray-800 mb-4" />
           <p className="text-gray-600 font-bold">Nenhum treino registrado.<br/>Hora de suar a camisa!</p>
        </div>
      )}
    </div>
  </div>
);

const Progress = ({ prs }: { prs: PersonalRecord[] }) => (
  <div className="p-6 pb-32 md:pl-28 md:pt-10 max-w-4xl mx-auto">
    <h1 className="text-3xl font-black mb-8 pt-4">Seus Recordes</h1>
    <div className="grid gap-4">
      {prs.map(pr => (
        <div key={pr.exerciseId} className="bg-gray-900 border border-gray-800 p-6 rounded-[2rem] flex justify-between items-center shadow-xl">
          <div>
            <h3 className="font-black text-white text-lg">{pr.exerciseName}</h3>
            <p className="text-xs text-gray-500 font-bold">Batido em {new Date(pr.date).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-emerald-400">{pr.weight}<span className="text-xs text-emerald-600 ml-1">kg</span></p>
            <p className="text-[10px] text-gray-600 uppercase font-black">Recorde Pessoal</p>
          </div>
        </div>
      ))}
      {prs.length === 0 && (
        <div className="text-center py-24 bg-gray-900/40 rounded-[3rem] border-2 border-dashed border-gray-800">
           <Trophy size={48} className="mx-auto text-gray-800 mb-4" />
           <p className="text-gray-600 font-bold">Sem recordes ainda.<br/>Cada repetição conta!</p>
        </div>
      )}
    </div>
  </div>
);

export default function App() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [prs, setPrs] = useState<PersonalRecord[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem('titanlift_sessions');
    const p = localStorage.getItem('titanlift_prs');
    const t = localStorage.getItem('titanlift_templates');
    const e = localStorage.getItem('titanlift_exercises');
    
    if (s) try { setSessions(JSON.parse(s)); } catch { }
    if (p) try { setPrs(JSON.parse(p)); } catch { }
    
    if (t) try { setTemplates(JSON.parse(t)); } catch { setTemplates(DEFAULT_TEMPLATES); }
    else setTemplates(DEFAULT_TEMPLATES);
    
    if (e) try { setExercises(JSON.parse(e)); } catch { setExercises(DEFAULT_EXERCISES); }
    else setExercises(DEFAULT_EXERCISES);
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
      const best = ex.sets.filter(s => s.completed).reduce((m, c) => Number(c.weight || 0) > Number(m.weight || 0) ? c : m, { weight: 0, reps: 0, completed: true });
      if (Number(best.weight) > 0) {
        const idx = updatedPrs.findIndex(p => p.exerciseId === ex.exerciseId);
        if (idx === -1 || Number(best.weight) > updatedPrs[idx].weight) {
          const newPr = { exerciseId: ex.exerciseId, exerciseName: ex.name, weight: Number(best.weight), reps: Number(best.reps), date: newSession.date };
          if (idx > -1) updatedPrs[idx] = newPr; else updatedPrs.push(newPr);
        }
      }
    });
    setPrs(updatedPrs);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-inter">
        <Navbar />
        <main className="flex-1 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Home prs={prs} sessions={sessions} templates={templates} />} />
            <Route path="/workouts" element={
              <WorkoutList 
                templates={templates} 
                onUpdateTemplates={setTemplates} 
                exercises={exercises}
                onUpdateExercises={setExercises}
              />
            } />
            <Route path="/active/:id" element={
              <ActiveWorkout 
                prs={prs} 
                templates={templates} 
                exercises={exercises}
                onUpdateExercises={setExercises}
                onSaveSession={saveSession} 
              />
            } />
            <Route path="/result/:sessionId" element={<WorkoutResult sessions={sessions} />} />
            <Route path="/history" element={<History sessions={sessions} onDeleteSession={(id) => setSessions(prev => prev.filter(s => s.id !== id))} />} />
            <Route path="/progress" element={<Progress prs={prs} />} />
          </Routes>
        </main>
        <Toast message="Progresso Sincronizado!" visible={toastVisible} />
      </div>
    </Router>
  );
}