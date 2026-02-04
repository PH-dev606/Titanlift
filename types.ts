
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
  name: string; // The display name
  sets: WorkoutSet[];
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  exercises: string[]; // IDs of exercises
}

export interface WorkoutSession {
  id: string;
  templateId: string;
  templateName: string;
  date: string;
  exercises: ActiveExercise[];
  isNewPrs?: string[]; // IDs of exercises that broke a PR in this session
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
}
