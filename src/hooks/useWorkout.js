import { useState, useEffect, useRef } from "react";

/**
 * Custom hook to manage the active workout session
 * @param {object} plan - The workout plan being executed
 * @param {Function} onSetCompleted - Callback when a set is marked complete (to trigger rest timer)
 * @returns {object} UseWorkout hook handlers
 */
export function useWorkout(plan, onSetCompleted) {
  const [workoutState, setWorkoutState] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef(null);

  // Initialize workout state when a plan is loaded
  useEffect(() => {
    if (plan) {
      const state = {
        planId: plan.id,
        planName: plan.name,
        exercises: plan.exercises.map((ex) => ({
          id: ex.id,
          name: ex.name,
          gifUrl: ex.gifUrl,
          target: ex.target,
          equipment: ex.equipment,
          instructions: ex.instructions || [],
          sets: ex.defaultSets.map((s) => ({
            reps: s.reps,
            weight: s.weight,
            completed: false
          }))
        }))
      };
      setWorkoutState(state);
      setCurrentExerciseIndex(0);
      setElapsedSeconds(0);

      // Start elapsed timer
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [plan]);

  const updateSet = (exerciseIndex, setIndex, updatedFields) => {
    if (!workoutState) return;

    setWorkoutState((prev) => {
      const newExercises = [...prev.exercises];
      const exercise = { ...newExercises[exerciseIndex] };
      const sets = [...exercise.sets];
      
      const wasCompleted = sets[setIndex].completed;
      sets[setIndex] = { ...sets[setIndex], ...updatedFields };

      // Callback if a set was newly checked as complete
      if (!wasCompleted && updatedFields.completed && onSetCompleted) {
        onSetCompleted();
      }

      exercise.sets = sets;
      newExercises[exerciseIndex] = exercise;

      return {
        ...prev,
        exercises: newExercises
      };
    });
  };

  const addSet = (exerciseIndex) => {
    if (!workoutState) return;

    setWorkoutState((prev) => {
      const newExercises = [...prev.exercises];
      const exercise = { ...newExercises[exerciseIndex] };
      const sets = [...exercise.sets];
      
      // Copy last set's reps and weight as default, or use standard defaults
      const lastSet = sets[sets.length - 1];
      const newSet = lastSet 
        ? { reps: lastSet.reps, weight: lastSet.weight, completed: false }
        : { reps: 10, weight: 20, completed: false };

      sets.push(newSet);
      exercise.sets = sets;
      newExercises[exerciseIndex] = exercise;

      return {
        ...prev,
        exercises: newExercises
      };
    });
  };

  const removeSet = (exerciseIndex, setIndex) => {
    if (!workoutState) return;

    setWorkoutState((prev) => {
      const newExercises = [...prev.exercises];
      const exercise = { ...newExercises[exerciseIndex] };
      const sets = [...exercise.sets];
      
      if (sets.length > 1) {
        sets.splice(setIndex, 1);
        exercise.sets = sets;
        newExercises[exerciseIndex] = exercise;
      }

      return {
        ...prev,
        exercises: newExercises
      };
    });
  };

  const nextExercise = () => {
    if (!workoutState) return;
    if (currentExerciseIndex < workoutState.exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
    }
  };

  const prevExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex((prev) => prev - 1);
    }
  };

  const currentExercise = workoutState?.exercises[currentExerciseIndex] || null;
  const nextExercisePreview = workoutState?.exercises[currentExerciseIndex + 1] || null;

  return {
    workoutState,
    currentExercise,
    currentExerciseIndex,
    nextExercisePreview,
    elapsedSeconds,
    updateSet,
    addSet,
    removeSet,
    nextExercise,
    prevExercise,
    totalExercisesCount: workoutState?.exercises.length || 0
  };
}
