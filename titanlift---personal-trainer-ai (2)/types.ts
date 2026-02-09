
export interface Exercise {
  id: string;
  name: string;
  category: string;
  instructions?: string;
}

export interface WorkoutSet {
  reps: number;
  weight: number;
  completed: boolean;
}

export interface ActiveExercise {
  exerciseId: string;
  name: string; 
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  exercises: string[]; 
}

export interface WorkoutSession {
  id: string;
  templateId: string;
  templateName: string;
  date: string;
  exercises: ActiveExercise[];
  durationMs?: number;
  generalNotes?: string;
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
}
