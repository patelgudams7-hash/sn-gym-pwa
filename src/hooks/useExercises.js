import { useState, useEffect } from "react";

const FITNESS_DATA_URL = "https://raw.githubusercontent.com/azilRababe/Exercises_Dataset/main/fitness_data.json";
const GIFS_DATA_URL = "https://raw.githubusercontent.com/azilRababe/Exercises_Dataset/main/gifs_data.json";
const STORAGE_KEY = "sngym_exercises_cache_v2";

/**
 * Custom hook to fetch and search the exercise database (merged)
 * @returns {object} { exercises, loading, error, getExerciseById, filterExercises }
 */
export function useExercises() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadExercises = async () => {
      try {
        // Try local storage cache first
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.length > 0) {
            setExercises(parsed);
            setLoading(false);
            return;
          }
        }

        // Fetch from network if not cached
        const [fitnessRes, gifsRes] = await Promise.all([
          fetch(FITNESS_DATA_URL),
          fetch(GIFS_DATA_URL)
        ]);

        if (!fitnessRes.ok || !gifsRes.ok) {
          throw new Error("Failed to load exercise dataset from raw repositories.");
        }

        const fitnessData = await fitnessRes.json();
        const gifsData = await gifsRes.json();

        // Merge strategy: Loop gifsData (master database for GIFs) and enrich with fitnessData
        const fitnessMap = {};
        const norm = (str) => (str || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "");

        fitnessData.forEach(fit => {
          const key = norm(fit.title);
          if (key) {
            fitnessMap[key] = fit;
          }
        });

        // Mapping categories from gifs_data.json keys to friendly capitalized names
        const categoryMap = {
          "abs": "Abs",
          "back": "Back",
          "biceps": "Biceps",
          "calf": "Calves",
          "cardio": "Cardio",
          "chest": "Chest",
          "erector-spinae": "Lower Back",
          "forearm": "Forearms",
          "full-body": "Full Body",
          "leg": "Legs",
          "neck": "Neck",
          "shoulders": "Shoulders",
          "trapezius": "Traps",
          "triceps": "Triceps"
        };

        const mergedList = [];

        gifsData.forEach(gif => {
          const key = norm(gif.title);
          const matchedFit = fitnessMap[key];
          
          const nameCap = gif.title.charAt(0).toUpperCase() + gif.title.slice(1);
          
          // Get friendly body part name
          const rawBodyPart = gif.body_part || "full-body";
          const bodyPartCap = categoryMap[rawBodyPart.toLowerCase()] || 
            (rawBodyPart.charAt(0).toUpperCase() + rawBodyPart.slice(1));

          let description = "";
          let category = "Strength";
          let equipment = "Body Weight";
          let difficulty = "Intermediate";

          if (matchedFit) {
            description = matchedFit.description || "";
            category = matchedFit.category || "Strength";
            equipment = matchedFit.equipment ? (matchedFit.equipment.charAt(0).toUpperCase() + matchedFit.equipment.slice(1)) : "Body Weight";
            difficulty = matchedFit.difficulty_level || "Intermediate";
          } else {
            // Synthesize detailed description
            description = `A specialized training exercise targeting your ${bodyPartCap.toLowerCase()} muscles. Prioritize strict form, full range of motion, and controlled repetitions to maximize mechanical tension.`;
            
            // Detect equipment from title
            const lowerTitle = gif.title.toLowerCase();
            if (lowerTitle.includes("dumbbell")) {
              equipment = "Dumbbells";
            } else if (lowerTitle.includes("barbell")) {
              equipment = "Barbell";
            } else if (lowerTitle.includes("cable")) {
              equipment = "Cable";
            } else if (lowerTitle.includes("kettlebell")) {
              equipment = "Kettlebell";
            } else if (lowerTitle.includes("band")) {
              equipment = "Bands";
            } else if (lowerTitle.includes("machine") || lowerTitle.includes("press machine") || lowerTitle.includes("smith")) {
              equipment = "Machine";
            } else if (lowerTitle.includes("medicine ball") || lowerTitle.includes("medball")) {
              equipment = "Medicine Ball";
            } else if (lowerTitle.includes("plate")) {
              equipment = "Plate";
            } else if (lowerTitle.includes("stretch") || lowerTitle.includes("yoga") || lowerTitle.includes("foam roller")) {
              equipment = "None";
            } else {
              equipment = "Body Weight";
            }

            // Detect category
            if (rawBodyPart.toLowerCase() === "cardio" || lowerTitle.includes("run") || lowerTitle.includes("jump") || lowerTitle.includes("cardio")) {
              category = "Cardio";
            } else {
              category = "Strength";
            }

            // Detect difficulty
            if (lowerTitle.includes("jump") || lowerTitle.includes("single leg") || lowerTitle.includes("one arm") || lowerTitle.includes("handstand") || lowerTitle.includes("pistol") || lowerTitle.includes("muscle up")) {
              difficulty = "Advanced";
            } else if (lowerTitle.includes("assist") || lowerTitle.includes("kneeling") || lowerTitle.includes("incline") || lowerTitle.includes("easy")) {
              difficulty = "Beginner";
            } else {
              difficulty = "Intermediate";
            }
          }

          mergedList.push({
            id: gif.id || `gif-${Math.random().toString(36).substr(2, 9)}`,
            name: nameCap,
            description,
            category,
            bodyPart: bodyPartCap,
            target: bodyPartCap,
            equipment,
            difficulty,
            gifUrl: gif.gif_url
          });
        });

        // Save merged list
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedList));
        setExercises(mergedList);
      } catch (err) {
        console.error("Error loading exercises:", err);
        setError(err.message || "Failed to load exercise dataset.");
      } finally {
        setLoading(false);
      }
    };

    loadExercises();
  }, []);

  const getExerciseById = (id) => {
    return exercises.find((ex) => ex.id === id);
  };

  const filterExercises = (searchQuery, category, equipment, difficulty) => {
    return exercises.filter((ex) => {
      // 1. Text Search (name, target, or bodyPart)
      const matchesSearch = searchQuery
        ? ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ex.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ex.bodyPart.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      // 2. Category Filter (bodyPart)
      const matchesCategory = category && category !== "All"
        ? ex.bodyPart.toLowerCase() === category.toLowerCase()
        : true;

      // 3. Equipment Filter
      const matchesEquipment = equipment && equipment !== "All"
        ? ex.equipment.toLowerCase() === equipment.toLowerCase()
        : true;

      // 4. Difficulty Filter
      const matchesDifficulty = difficulty && difficulty !== "All"
        ? ex.difficulty.toLowerCase() === difficulty.toLowerCase()
        : true;

      return matchesSearch && matchesCategory && matchesEquipment && matchesDifficulty;
    });
  };

  return {
    exercises,
    loading,
    error,
    getExerciseById,
    filterExercises
  };
}
