
import React, { useState, useEffect, useMemo } from 'react';
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
  ArrowRight,
  Trophy,
  ArrowLeft,
  Edit2,
  Check,
  X,
  Search,
  PlusCircle
} from 'lucide-react';
import { WorkoutSession, PersonalRecord, ActiveExercise, WorkoutSet } from './types';
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

const Home = ({ prs, sessions }: { prs: PersonalRecord[], sessions: WorkoutSession[] }) => {
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
          {WORKOUT_TEMPLATES.map(template => (
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

const WorkoutList = () => {
  return (
    <div className="p-6 pb-24 md:pl-28 md:pt-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black mb-8">Todos os Planos</h1>
      <div className="grid gap-4">
        {WORKOUT_TEMPLATES.map(template => (
          <Link 
            key={template.id} 
            to={`/active/${template.id}`}
            className="bg-gray-900 border border-gray-800 p-6 rounded-3xl hover:border-indigo-500 transition-colors group"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-gray-100 group-hover:text-indigo-400">{template.name}</h3>
              <Plus className="text-gray-600 group-hover:text-indigo-500" size={20} />
            </div>
            <p className="text-gray-400 text-sm mb-6">{template.description}</p>
            <div className="flex flex-wrap gap-2">
              {template.exercises.map(exId => (
                <span key={exId} className="bg-gray-800 text-gray-400 text-[10px] px-3 py-1.5 rounded-full uppercase font-bold tracking-wider">
                  {EXERCISES.find(e => e.id === exId)?.name}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const ExercisePicker = ({ onSelect, onClose }: { onSelect: (name: string, id?: string) => void, onClose: () => void }) => {
  const [search, setSearch] = useState("");
  
  const filteredExercises = useMemo(() => {
    return EXERCISES.filter(ex => ex.name.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-4">
      <div className="bg-gray-900 w-full max-w-lg rounded-3xl border border-gray-800 shadow-2xl flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">Adicionar Exercício</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24}/></button>
        </div>
        
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text"
              placeholder="Pesquisar exercício ou criar novo..."
              className="w-full bg-gray-800 border border-gray-700 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {search && filteredExercises.length === 0 && (
            <button 
              onClick={() => onSelect(search)}
              className="w-full text-left px-4 py-4 hover:bg-indigo-500/10 rounded-2xl flex items-center gap-3 group"
            >
              <div className="bg-indigo-600 p-2 rounded-lg"><Plus size={18}/></div>
              <div>
                <p className="font-bold text-indigo-400">Criar "{search}"</p>
                <p className="text-xs text-gray-500">Adicionar exercício personalizado</p>
              </div>
            </button>
          )}
          
          {filteredExercises.map(ex => (
            <button 
              key={ex.id}
              onClick={() => onSelect(ex.name, ex.id)}
              className="w-full text-left px-4 py-4 hover:bg-gray-800 rounded-2xl transition-colors flex justify-between items-center group"
            >
              <div>
                <p className="font-bold group-hover:text-indigo-400 transition-colors">{ex.name}</p>
                <p className="text-xs text-gray-500">{ex.category}</p>
              </div>
              <ChevronRight size={18} className="text-gray-700 group-hover:text-indigo-500" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const ActiveWorkout = ({ prs, onSaveSession }: { prs: PersonalRecord[], onSaveSession: (session: WorkoutSession) => void }) => {
  const { id: templateId } = useParams();
  const navigate = useNavigate();
  const template = WORKOUT_TEMPLATES.find(t => t.id === templateId);
  
  const [activeExercises, setActiveExercises] = useState<ActiveExercise[]>(
    template?.exercises.map(exId => ({
      exerciseId: exId,
      name: EXERCISES.find(e => e.id === exId)?.name || 'Exercício',
      sets: Array(4).fill(null).map(() => ({ reps: 10, weight: 0, completed: false }))
    })) || []
  );

  const [showPicker, setShowPicker] = useState(false);
  const [editingExIdx, setEditingExIdx] = useState<number | null>(null);
  const [editingExName, setEditingExName] = useState("");
  const [aiTips, setAiTips] = useState<Record<string, string>>({});
  const [loadingTips, setLoadingTips] = useState<Record<string, boolean>>({});

  const handleAddSet = (exerciseIndex: number) => {
    const updated = [...activeExercises];
    const lastSet = updated[exerciseIndex].sets[updated[exerciseIndex].sets.length - 1];
    updated[exerciseIndex].sets.push({ ...lastSet, completed: false });
    setActiveExercises(updated);
  };

  const handleAddExercise = (name: string, id?: string) => {
    const newEx: ActiveExercise = {
      exerciseId: id || `custom-${Date.now()}`,
      name: name,
      sets: Array(4).fill(null).map(() => ({ reps: 10, weight: 0, completed: false }))
    };
    setActiveExercises(prev => [...prev, newEx]);
    setShowPicker(false);
  };

  const handleDeleteExercise = (idx: number) => {
    if (confirm("Remover este exercício do treino?")) {
      setActiveExercises(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof WorkoutSet, value: any) => {
    const updated = [...activeExercises];
    updated[exerciseIndex].sets[setIndex] = { ...updated[exerciseIndex].sets[setIndex], [field]: value };
    setActiveExercises(updated);
  };

  const startEditingName = (idx: number, currentName: string) => {
    setEditingExIdx(idx);
    setEditingExName(currentName);
  };

  const saveEditingName = () => {
    if (editingExIdx !== null) {
      const updated = [...activeExercises];
      updated[editingExIdx].name = editingExName;
      setActiveExercises(updated);
      setEditingExIdx(null);
    }
  };

  const handleFetchTips = async (name: string, id: string) => {
    setLoadingTips(prev => ({ ...prev, [id]: true }));
    const tip = await getExerciseTip(name);
    setAiTips(prev => ({ ...prev, [id]: tip }));
    setLoadingTips(prev => ({ ...prev, [id]: false }));
  };

  const handleFinish = () => {
    const sessionPrs: string[] = [];
    activeExercises.forEach(ex => {
      const currentPr = prs.find(p => p.exerciseId === ex.exerciseId);
      const sessionMax = Math.max(...ex.sets.filter(s => s.completed).map(s => s.weight), 0);
      if (sessionMax > (currentPr?.weight || 0)) {
        sessionPrs.push(ex.exerciseId);
      }
    });

    const session: WorkoutSession = {
      id: Date.now().toString(),
      templateId: templateId || 'custom',
      templateName: template?.name || 'Treino Personalizado',
      date: new Date().toISOString(),
      exercises: activeExercises,
      isNewPrs: sessionPrs
    };
    onSaveSession(session);
    navigate(`/result/${session.id}`);
  };

  if (!template) return <div className="p-10 text-center">Treino não encontrado</div>;

  return (
    <div className="p-6 pb-24 md:pl-28 md:pt-10 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <button onClick={() => navigate('/')} className="text-gray-500 hover:text-white flex items-center gap-1 text-sm mb-2">
            <ArrowLeft size={16} /> Voltar para Início
          </button>
          <h1 className="text-3xl font-black">{template.name}</h1>
        </div>
        <button 
          onClick={handleFinish}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 w-full sm:w-auto justify-center"
        >
          Finalizar Treino
        </button>
      </div>

      <div className="space-y-8 mb-10">
        {activeExercises.map((ex, exIdx) => {
          const currentPr = prs.find(p => p.exerciseId === ex.exerciseId);
          return (
            <div key={`${ex.exerciseId}-${exIdx}`} className="bg-gray-900 rounded-3xl p-6 border border-gray-800 group/ex relative">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  {editingExIdx === exIdx ? (
                    <div className="flex items-center gap-2">
                      <input 
                        className="bg-gray-800 border border-indigo-500 rounded-xl px-3 py-1 text-white font-bold outline-none flex-1"
                        value={editingExName}
                        onChange={e => setEditingExName(e.target.value)}
                        autoFocus
                      />
                      <button onClick={saveEditingName} className="text-emerald-500 bg-emerald-500/10 p-2 rounded-xl"><Check size={18}/></button>
                      <button onClick={() => setEditingExIdx(null)} className="text-red-500 bg-red-500/10 p-2 rounded-xl"><X size={18}/></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-white">{ex.name}</h2>
                      <button onClick={() => startEditingName(exIdx, ex.name)} className="text-gray-600 hover:text-indigo-400 p-1">
                        <Edit2 size={14} />
                      </button>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 mt-1">
                    <button 
                      onClick={() => handleFetchTips(ex.name, ex.exerciseId)}
                      className="text-xs text-indigo-500 hover:underline font-semibold flex items-center gap-1"
                      disabled={loadingTips[ex.exerciseId]}
                    >
                      {loadingTips[ex.exerciseId] ? "Pensando..." : "Dicas Técnicas IA ✨"}
                    </button>
                    {currentPr && (
                      <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                        <Trophy size={12} /> PR Atual: {currentPr.weight}kg
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteExercise(exIdx)}
                  className="text-gray-700 hover:text-red-500 p-2 opacity-0 group-hover/ex:opacity-100 transition-opacity"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {aiTips[ex.exerciseId] && (
                <div className="mb-6 text-sm bg-indigo-950/20 border border-indigo-900/30 p-4 rounded-2xl text-indigo-200">
                  {aiTips[ex.exerciseId].split('\n').map((line, i) => <p key={i} className="mb-1 last:mb-0">• {line.replace(/^\d+\.\s*/, '')}</p>)}
                </div>
              )}

              <div className="space-y-3 mb-6">
                <div className="grid grid-cols-4 gap-4 text-[10px] font-black text-gray-600 px-2 uppercase tracking-widest text-center">
                  <span>Série</span>
                  <span>Peso kg</span>
                  <span>Reps</span>
                  <span>Ok</span>
                </div>
                {ex.sets.map((set, setIdx) => {
                  const isNewPr = set.weight > (currentPr?.weight || 0) && set.completed;
                  return (
                    <div key={setIdx} className="grid grid-cols-4 gap-2 sm:gap-4 items-center relative">
                      <div className="bg-gray-800/50 h-12 flex items-center justify-center rounded-xl text-sm font-bold border border-gray-800">
                        {setIdx + 1}
                      </div>
                      <input 
                        type="number"
                        value={set.weight || ''}
                        placeholder="0"
                        onChange={(e) => updateSet(exIdx, setIdx, 'weight', Number(e.target.value))}
                        className={`bg-gray-800 h-12 rounded-xl text-center font-bold focus:ring-2 outline-none border transition-colors ${isNewPr ? 'border-emerald-500 ring-emerald-500 text-emerald-400' : 'border-gray-800 focus:ring-indigo-500'}`}
                      />
                      <input 
                        type="number"
                        value={set.reps || ''}
                        placeholder="0"
                        onChange={(e) => updateSet(exIdx, setIdx, 'reps', Number(e.target.value))}
                        className="bg-gray-800 h-12 rounded-xl text-center font-bold focus:ring-2 focus:ring-indigo-500 outline-none border border-gray-800"
                      />
                      <button 
                        onClick={() => updateSet(exIdx, setIdx, 'completed', !set.completed)}
                        className={`h-12 rounded-xl flex items-center justify-center transition-all ${set.completed ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-gray-800 text-gray-700 border-gray-800 hover:border-gray-700'}`}
                      >
                        <CheckCircle2 size={24} />
                      </button>
                      {isNewPr && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-[8px] font-black text-white px-2 py-0.5 rounded-full uppercase tracking-tighter animate-bounce whitespace-nowrap z-10">
                          NOVO PR!
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={() => handleAddSet(exIdx)}
                className="w-full border border-dashed border-gray-700 hover:border-indigo-500/50 hover:bg-indigo-500/5 text-gray-500 hover:text-indigo-400 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Plus size={18} /> Próxima Série
              </button>
            </div>
          );
        })}
      </div>

      <button 
        onClick={() => setShowPicker(true)}
        className="w-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 py-6 rounded-3xl font-black flex items-center justify-center gap-3 hover:bg-indigo-600/20 transition-all border-dashed"
      >
        <PlusCircle size={24} /> ADICIONAR EXERCÍCIO
      </button>

      {showPicker && <ExercisePicker onSelect={handleAddExercise} onClose={() => setShowPicker(false)} />}
    </div>
  );
};

const WorkoutResult = ({ sessions }: { sessions: WorkoutSession[] }) => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const session = sessions.find(s => s.id === sessionId);

  if (!session) return <div className="p-10 text-center">Sessão não encontrada</div>;

  return (
    <div className="p-6 pb-24 md:pl-28 md:pt-10 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex bg-indigo-600 p-4 rounded-3xl mb-4 shadow-xl shadow-indigo-600/20">
          <CheckCircle2 size={40} className="text-white" />
        </div>
        <h1 className="text-3xl font-black mb-2">Treino Finalizado!</h1>
        <p className="text-gray-400">Excelente trabalho. Aqui está seu resumo.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Média de Carga</p>
          <p className="text-3xl font-black">
            {(session.exercises.reduce((acc, ex) => acc + (ex.sets.reduce((sAcc, s) => sAcc + s.weight, 0) / (ex.sets.length || 1)), 0) / (session.exercises.length || 1)).toFixed(1)} <span className="text-sm text-gray-600">kg</span>
          </p>
        </div>
        <div className="bg-emerald-950/20 border border-emerald-900/30 p-6 rounded-3xl">
          <p className="text-emerald-500 text-xs font-bold uppercase tracking-wider mb-1">Recordes Batidos</p>
          <p className="text-3xl font-black text-emerald-400 flex items-center gap-2">
            <Trophy size={28} /> {session.isNewPrs?.length || 0}
          </p>
        </div>
      </div>

      <div className="space-y-4 mb-10">
        <h3 className="text-xl font-bold mb-4">Destaques por Exercício</h3>
        {session.exercises.map(ex => {
          const avgWeight = ex.sets.reduce((acc, s) => acc + s.weight, 0) / (ex.sets.length || 1);
          const maxWeight = Math.max(...ex.sets.map(s => s.weight), 0);
          const isPr = session.isNewPrs?.includes(ex.exerciseId);

          return (
            <div key={ex.exerciseId} className="bg-gray-900 border border-gray-800 p-6 rounded-3xl flex justify-between items-center group">
              <div>
                <h4 className="font-bold text-lg flex items-center gap-2">
                  {ex.name}
                  {isPr && <span className="bg-emerald-500 text-[10px] text-white px-2 py-0.5 rounded-full animate-pulse">NOVO PR!</span>}
                </h4>
                <p className="text-xs text-gray-500">Média: {avgWeight.toFixed(1)}kg • Pico: {maxWeight}kg</p>
              </div>
              <ChevronRight className="text-gray-700 group-hover:text-indigo-500 transition-colors" />
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button 
          onClick={() => navigate('/')}
          className="bg-gray-800 hover:bg-gray-700 text-white py-4 rounded-2xl font-bold transition-all"
        >
          Voltar ao Início
        </button>
        <button 
          onClick={() => navigate('/history')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-500/20 transition-all"
        >
          Ver Histórico Completo
        </button>
      </div>
    </div>
  );
};

const History = ({ sessions, onDeleteSession }: { sessions: WorkoutSession[], onDeleteSession: (id: string) => void }) => {
  return (
    <div className="p-6 pb-24 md:pl-28 md:pt-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black mb-8">Histórico de Treinos</h1>
      <div className="space-y-4">
        {sessions.map(s => (
          <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-3xl p-6 group hover:border-gray-700 transition-colors">
            <div className="flex justify-between items-start mb-6">
              <Link to={`/result/${s.id}`} className="flex-1">
                <h3 className="text-xl font-bold text-indigo-400 flex items-center gap-2 group-hover:text-indigo-300">
                  {s.templateName}
                  {s.isNewPrs && s.isNewPrs.length > 0 && <Trophy size={16} className="text-emerald-500" />}
                </h3>
                <p className="text-sm text-gray-500">{new Date(s.date).toLocaleDateString()} • {new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </Link>
              <button onClick={() => onDeleteSession(s.id)} className="text-gray-600 hover:text-red-500 p-2 transition-colors">
                <Trash2 size={20} />
              </button>
            </div>
            <div className="space-y-4">
              {s.exercises.map(ex => (
                <div key={ex.exerciseId} className="border-t border-gray-800/50 pt-4">
                  <span className="text-gray-200 font-bold block mb-2 text-sm">{ex.name}</span>
                  <div className="flex flex-wrap gap-2">
                    {ex.sets.filter(set => set.completed).map((set, i) => (
                      <span key={i} className="bg-gray-800/50 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-400 border border-gray-700">
                        {set.weight}kg × {set.reps}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {sessions.length === 0 && (
          <div className="text-center py-20 bg-gray-900/50 rounded-3xl border border-dashed border-gray-800">
            <HistoryIcon className="mx-auto text-gray-800 mb-4" size={64} />
            <p className="text-gray-500 font-medium">Nenhum treino no histórico.</p>
            <Link to="/workouts" className="text-indigo-500 text-sm mt-2 inline-block hover:underline">Começar meu primeiro treino</Link>
          </div>
        )}
      </div>
    </div>
  );
};

const Progress = ({ prs, sessions }: { prs: PersonalRecord[], sessions: WorkoutSession[] }) => {
  const getProgressData = (exerciseId: string) => {
    const data = sessions
      .filter(s => s.exercises.some(ex => ex.exerciseId === exerciseId))
      .map(s => {
        const exercise = s.exercises.find(ex => ex.exerciseId === exerciseId);
        const bestSet = exercise?.sets.reduce((prev, current) => (prev.weight > current.weight) ? prev : current, { weight: 0, reps: 0 });
        return {
          date: new Date(s.date).toLocaleDateString(),
          weight: bestSet?.weight || 0
        };
      })
      .reverse();
    return data;
  };

  return (
    <div className="p-6 pb-24 md:pl-28 md:pt-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black mb-8">Recordes Pessoais</h1>
      
      <div className="grid gap-6">
        {prs.map(pr => (
          <div key={pr.exerciseId} className="bg-gray-900 border border-gray-800 rounded-3xl p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">{pr.exerciseName}</h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Recorde em {new Date(pr.date).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black text-emerald-400 tabular-nums">{pr.weight}<span className="text-sm ml-1 text-emerald-600">kg</span></p>
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{pr.reps} repetições</p>
              </div>
            </div>

            <div className="h-56 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getProgressData(pr.exerciseId)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} opacity={0.5} />
                  <XAxis dataKey="date" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '16px', padding: '12px' }}
                    itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="weight" stroke="#6366f1" strokeWidth={4} dot={{ fill: '#6366f1', strokeWidth: 0, r: 4 }} activeDot={{ r: 6, stroke: '#818cf8', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
        {prs.length === 0 && (
          <div className="text-center py-20 bg-gray-900/50 rounded-3xl border border-dashed border-gray-800">
            <TrendingUp className="mx-auto text-gray-800 mb-4" size={64} />
            <p className="text-gray-500 font-medium">Bata seus primeiros recordes para ver o progresso.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [prs, setPrs] = useState<PersonalRecord[]>([]);

  useEffect(() => {
    const savedSessions = localStorage.getItem('titanlift_sessions');
    const savedPrs = localStorage.getItem('titanlift_prs');
    if (savedSessions) setSessions(JSON.parse(savedSessions));
    if (savedPrs) setPrs(JSON.parse(savedPrs));
  }, []);

  useEffect(() => {
    localStorage.setItem('titanlift_sessions', JSON.stringify(sessions));
    localStorage.setItem('titanlift_prs', JSON.stringify(prs));
  }, [sessions, prs]);

  const saveSession = (newSession: WorkoutSession) => {
    setSessions(prev => [newSession, ...prev]);

    const updatedPrs = [...prs];
    newSession.exercises.forEach(ex => {
      const completedSets = ex.sets.filter(s => s.completed);
      if (completedSets.length === 0) return;

      const bestSet = completedSets.reduce((max, current) => (current.weight > max.weight) ? current : max, { weight: 0, reps: 0 });

      if (bestSet.weight > 0) {
        const existingPrIndex = updatedPrs.findIndex(p => p.exerciseId === ex.exerciseId);
        if (existingPrIndex > -1) {
          if (bestSet.weight > updatedPrs[existingPrIndex].weight) {
            updatedPrs[existingPrIndex] = {
              ...updatedPrs[existingPrIndex],
              weight: bestSet.weight,
              reps: bestSet.reps,
              date: newSession.date,
              exerciseName: ex.name
            };
          }
        } else {
          updatedPrs.push({
            exerciseId: ex.exerciseId,
            exerciseName: ex.name,
            weight: bestSet.weight,
            reps: bestSet.reps,
            date: newSession.date
          });
        }
      }
    });
    setPrs(updatedPrs);
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-950 text-gray-100 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home prs={prs} sessions={sessions} />} />
            <Route path="/workouts" element={<WorkoutList />} />
            <Route path="/active/:id" element={<ActiveWorkout prs={prs} onSaveSession={saveSession} />} />
            <Route path="/result/:sessionId" element={<WorkoutResult sessions={sessions} />} />
            <Route path="/history" element={<History sessions={sessions} onDeleteSession={deleteSession} />} />
            <Route path="/progress" element={<Progress prs={prs} sessions={sessions} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
