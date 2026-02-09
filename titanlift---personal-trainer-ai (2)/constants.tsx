
import { Exercise, WorkoutTemplate } from './types';

export const EXERCISES: Exercise[] = [
  { id: '1', name: 'Supino Reto', category: 'Peito' },
  { id: '2', name: 'Agachamento Livre', category: 'Pernas' },
  { id: '3', name: 'Levantamento Terra', category: 'Costas/Pernas' },
  { id: '4', name: 'Desenvolvimento Militar', category: 'Ombros' },
  { id: '5', name: 'Remada Curvada', category: 'Costas' },
  { id: '6', name: 'Rosca Direta', category: 'Bíceps' },
  { id: '7', name: 'Tríceps Testa', category: 'Tríceps' },
  { id: '8', name: 'Leg Press 45', category: 'Pernas' },
  { id: '9', name: 'Puxada Aberta', category: 'Costas' },
  { id: '10', name: 'Elevação Lateral', category: 'Ombros' },
];

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'chest_back',
    name: 'Peito & Costas',
    description: 'Foco em grandes grupos musculares superiores.',
    exercises: ['1', '9', '5', '3']
  },
  {
    id: 'arms_shoulders',
    name: 'Braços & Ombros',
    description: 'Definição e força para membros superiores.',
    exercises: ['4', '10', '6', '7']
  },
  {
    id: 'legs_day',
    name: 'Pernas Completo',
    description: 'Treino focado nos membros inferiores.',
    exercises: ['2', '8', '3']
  }
];
