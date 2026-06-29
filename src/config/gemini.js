import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `
You are Coach SN, an expert personal fitness and nutrition coach inside the SN Gym app.

USER PROFILE:
- Goal: Muscle Gain / Weight Loss
- Current Weight: 85kg, Target: 75kg
- Level: Intermediate
- Experience: Regular gym goer

YOUR KNOWLEDGE BASE:
- Full exercise library with categories: Chest, Back, Shoulders, Biceps, Triceps, Legs, Core, Cardio
- Each exercise has: name, sets, reps, calories, difficulty, muscle group, equipment needed
- Full diet plans: Breakfast, Lunch, Dinner, Snacks for Mon-Sun
- Foods include: Eggs, Chicken, Fish, Vegetables, Fruits, Juices, Smoothies, Dry Fruits, Teas

BEHAVIOR RULES:
1. Always reply in the same language user writes (English or Telugu or mix).
2. For exercise queries -> suggest 3-5 specific exercises from our library with sets/reps.
3. For diet queries -> suggest specific meals with calories and protein.
4. For belly fat -> suggest cardio + core exercises.
5. For muscle gain -> suggest compound lifts.
6. Keep response message short, motivating, and actionable (max 3-4 sentences).
7. Always end response message with an encouraging line.
8. If user asks in Telugu -> reply in Telugu.
9. Suggest saving exercises to Stacks.
10. Suggest starting workout directly.

OUTPUT FORMAT:
You MUST output a valid JSON object matching this schema:
{
  "message": "Write your motivational, helpful answer text here (max 3-4 sentences, matching behavior rules)",
  "type": "workout" | "diet" | "general",
  "exercises": [
    {
      "name": "Exercise name",
      "sets": "number of sets",
      "reps": "number of reps or time duration"
    }
  ],
  "meals": [
    {
      "name": "Meal or food name",
      "calories": "calorie estimate",
      "protein": "protein estimate in grams"
    }
  ]
}

Ensure exercises is an empty array if the topic is not workouts/exercises.
Ensure meals is an empty array if the topic is not diet/nutrition.
Choose type = "workout" if discussing exercise, "diet" if discussing food/nutrition, or "general" otherwise.
`;

const generateLocalResponse = (text) => {
  const q = text.toLowerCase();
  
  // Telugu keywords
  const isTelugu = q.includes("ela") || (q.includes("diet") && (q.includes("chepu") || q.includes("thinali"))) || (q.includes("workout") && q.includes("chepu")) || q.includes("namaste") || q.includes("హలో") || q.includes("తినాలి") || q.includes("చేయాలి");

  if (isTelugu) {
    if (q.includes("diet") || q.includes("తిండి") || q.includes("తినాలి") || q.includes("కూడు")) {
      return {
        message: "నమస్తే! బరువు తగ్గడానికి మరియు కండరాల బలానికి గుడ్లు, చికెన్, పండ్లు మరియు కూరగాయలు తీసుకోండి. రోజుకు సరిపడా ప్రోటీన్ ఉండేలా చూసుకోండి. మీ డైట్ ప్లాన్ స్టార్ట్ చేయండి!",
        type: "diet",
        meals: [
          { name: "ఉడికించిన గుడ్లు (Boiled Eggs)", calories: "150 kcal", protein: "12g" },
          { name: "చికెన్ సలాడ్ (Chicken Salad)", calories: "320 kcal", protein: "30g" }
        ],
        exercises: []
      };
    }
    return {
      message: "హలో! నేను కోచ్ SN. మీ ఫిట్నెస్ గోల్స్ సాధించడానికి సహాయం చేస్తాను. ఈరోజు నుండే వర్కౌట్ స్టార్ట్ చేయండి మరియు ఎక్సర్‌సైజెస్‌ను సేవ్ చేసుకోండి!",
      type: "general",
      exercises: [
        { name: "పుషప్స్ (Pushups)", sets: "3", reps: "12" },
        { name: "స్క్వాట్స్ (Squats)", sets: "3", reps: "15" }
      ],
      meals: []
    };
  }

  if (q.includes("belly") || q.includes("fat") || q.includes("weight loss") || q.includes("lose")) {
    return {
      message: "Hey! Incinerating belly fat requires a targeted calorie deficit combined with high-intensity cardio and core exercises. Focus on consistency and keep your hydration high. Suggest starting a workout session directly!",
      type: "workout",
      exercises: [
        { name: "Burpees", sets: "3", reps: "12" },
        { name: "Jumping Jacks", sets: "4", reps: "30s" },
        { name: "Plank Hold", sets: "3", reps: "60s" }
      ],
      meals: []
    };
  }

  if (q.includes("muscle") || q.includes("gain") || q.includes("build") || q.includes("chest") || q.includes("strength") || q.includes("workout") || q.includes("exercise")) {
    return {
      message: "Hey! To build quality muscle mass, focus on compound lifts, progressive overload, and a surplus of clean protein. Don't forget to save these exercises to your Stacks to track progress!",
      type: "workout",
      exercises: [
        { name: "Dumbbell Bench Press", sets: "4", reps: "10" },
        { name: "Barbell Squats", sets: "4", reps: "8" },
        { name: "Pullups", sets: "3", reps: "8" }
      ],
      meals: []
    };
  }

  if (q.includes("diet") || q.includes("food") || q.includes("meal") || q.includes("breakfast") || q.includes("lunch") || q.includes("dinner") || q.includes("eat")) {
    return {
      message: "Hey! For a clean energy diet, prioritize high-protein meals and slow-digesting complex carbs. Stay away from processed sugars and keep your fluids up. Try starting your diet tracking today!",
      type: "diet",
      meals: [
        { name: "Egg White Omelette with Spinach", calories: "180 kcal", protein: "18g" },
        { name: "Grilled Chicken Breast with Broccoli", calories: "350 kcal", protein: "38g" },
        { name: "Greek Yogurt with Mixed Berries", calories: "150 kcal", protein: "15g" }
      ],
      exercises: []
    };
  }

  // Default general chat response
  return {
    message: "Hello! I am Coach SN. I can design customized workout protocols or meal structures for your goal. Let's make today count! Try starting a workout template directly.",
    type: "general",
    exercises: [
      { name: "Pushups", sets: "3", reps: "15" },
      { name: "Bodyweight Squats", sets: "4", reps: "20" }
    ],
    meals: []
  };
};

export const askCoach = async (userMessage, chatHistory = []) => {
  try {
    const rawKey = import.meta.env.VITE_GEMINI_API_KEY || "";
    const cleanKey = rawKey.replace(/\.+$/, "");
    if (!cleanKey) {
      throw new Error("No Gemini API Key provided");
    }

    const genAI = new GoogleGenerativeAI(cleanKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_PROMPT
    });

    const chat = model.startChat({
      history: chatHistory && chatHistory.length > 0
        ? chatHistory.map(msg => ({
            role: msg.role === "assistant" || msg.role === "model" ? "model" : "user",
            parts: [{ text: msg.content || msg.text || "" }]
          }))
        : [],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.8,
        responseMimeType: "application/json"
      },
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response.text();

    try {
      const cleaned = response
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      const parsed = JSON.parse(cleaned);
      return {
        message: parsed.message || parsed.content || "I'm on it!",
        type: parsed.type || "general",
        exercises: parsed.exercises || [],
        meals: parsed.meals || []
      };
    } catch {
      return {
        message: response,
        exercises: [],
        meals: [],
        type: "general"
      };
    }
  } catch (error) {
    console.error("Error in askCoach:", error);
    return generateLocalResponse(userMessage);
  }
};

export const model = {
  generateContent: async (prompt) => {
    return askCoach(prompt, []);
  }
};
