export const defaultPlans = [
  {
    id: "plan-push",
    name: "Apex Push Day",
    difficulty: "Intermediate",
    duration: 45, // in minutes
    category: "Chest/Shoulders/Triceps",
    description: "Focus on upper body pushing movements to build strength, shoulder stability, and chest volume.",
    exercises: [
      {
        id: "1",
        name: "Barbell Bench Press",
        gifUrl: "https://raw.githubusercontent.com/azilRababe/Exercises_Dataset/main/gif/0025.gif",
        target: "chest",
        equipment: "barbell",
        instructions: [
          "Lie flat on a bench with your feet flat on the floor.",
          "Grip the barbell with hands slightly wider than shoulder-width.",
          "Unrack the bar and lower it slowly to your mid-chest.",
          "Push the bar back up explosively to the starting position."
        ],
        defaultSets: [
          { reps: 10, weight: 60, completed: false },
          { reps: 10, weight: 60, completed: false },
          { reps: 8, weight: 70, completed: false },
          { reps: 6, weight: 75, completed: false }
        ]
      },
      {
        id: "2",
        name: "Dumbbell Shoulder Press",
        gifUrl: "https://raw.githubusercontent.com/azilRababe/Exercises_Dataset/main/gif/0347.gif",
        target: "shoulders",
        equipment: "dumbbell",
        instructions: [
          "Sit on a bench with back support, holding dumbbells at shoulder level.",
          "Press the weights upward until your arms are fully extended.",
          "Lower the dumbbells slowly back to the starting position."
        ],
        defaultSets: [
          { reps: 12, weight: 15, completed: false },
          { reps: 10, weight: 18, completed: false },
          { reps: 10, weight: 18, completed: false }
        ]
      },
      {
        id: "3",
        name: "Dumbbell Flyes",
        gifUrl: "https://raw.githubusercontent.com/azilRababe/Exercises_Dataset/main/gif/0308.gif",
        target: "chest",
        equipment: "dumbbell",
        instructions: [
          "Lie on a flat bench holding dumbbells above your chest with palms facing.",
          "With a slight bend in your elbows, lower your arms to the sides in a wide arc.",
          "Squeeze your chest muscles to return the dumbbells to the top."
        ],
        defaultSets: [
          { reps: 12, weight: 10, completed: false },
          { reps: 12, weight: 10, completed: false },
          { reps: 10, weight: 12, completed: false }
        ]
      },
      {
        id: "4",
        name: "Triceps Pushdown (Cable)",
        gifUrl: "https://raw.githubusercontent.com/azilRababe/Exercises_Dataset/main/gif/0200.gif",
        target: "triceps",
        equipment: "cable",
        instructions: [
          "Stand facing the cable machine with a rope or bar attachment at chest height.",
          "Keep elbows close to your torso and push the bar down until elbows are locked.",
          "Slowly return to starting position, maintaining tension."
        ],
        defaultSets: [
          { reps: 15, weight: 20, completed: false },
          { reps: 12, weight: 25, completed: false },
          { reps: 12, weight: 25, completed: false }
        ]
      }
    ]
  },
  {
    id: "plan-pull",
    name: "Titan Pull Day",
    difficulty: "Advanced",
    duration: 50,
    category: "Back/Biceps",
    description: "Heavy back compound pulls paired with isolation exercises for biceps mass.",
    exercises: [
      {
        id: "5",
        name: "Pullups",
        gifUrl: "https://raw.githubusercontent.com/azilRababe/Exercises_Dataset/main/gif/0652.gif",
        target: "back",
        equipment: "body weight",
        instructions: [
          "Grasp pull-up bar with hands wider than shoulder-width, palms facing away.",
          "Pull your chest up to the bar, keeping core engaged.",
          "Lower yourself slowly back down to a full dead hang."
        ],
        defaultSets: [
          { reps: 8, weight: 0, completed: false },
          { reps: 8, weight: 0, completed: false },
          { reps: 6, weight: 0, completed: false }
        ]
      },
      {
        id: "6",
        name: "Barbell Bent Over Row",
        gifUrl: "https://raw.githubusercontent.com/azilRababe/Exercises_Dataset/main/gif/0027.gif",
        target: "back",
        equipment: "barbell",
        instructions: [
          "Hinge at the hips, keeping your back straight and knees slightly bent.",
          "Hold the barbell with an overhand grip and pull it toward your belly button.",
          "Lower the bar under control back to arm's length."
        ],
        defaultSets: [
          { reps: 10, weight: 50, completed: false },
          { reps: 10, weight: 55, completed: false },
          { reps: 8, weight: 60, completed: false }
        ]
      },
      {
        id: "7",
        name: "Hammer Curls",
        gifUrl: "https://raw.githubusercontent.com/azilRababe/Exercises_Dataset/main/gif/0313.gif",
        target: "biceps",
        equipment: "dumbbell",
        instructions: [
          "Stand holding dumbbells by your sides, palms facing inward (neutral grip).",
          "Curl the weights up while keeping your palms facing each other.",
          "Lower back down with control."
        ],
        defaultSets: [
          { reps: 12, weight: 12, completed: false },
          { reps: 12, weight: 12, completed: false },
          { reps: 10, weight: 14, completed: false }
        ]
      }
    ]
  },
  {
    id: "plan-legs",
    name: "Sculpted Legs & Core",
    difficulty: "Beginner",
    duration: 35,
    category: "Legs/Core",
    description: "A foundational lower body routine focusing on squat technique and core stability.",
    exercises: [
      {
        id: "8",
        name: "Barbell Full Squat",
        gifUrl: "https://raw.githubusercontent.com/azilRababe/Exercises_Dataset/main/gif/0043.gif",
        target: "quads",
        equipment: "barbell",
        instructions: [
          "Rest the barbell on your upper back, chest proud and feet shoulder-width.",
          "Squat down by pushing your hips back and bending your knees.",
          "Descend until your thighs are parallel to the floor.",
          "Drive back up through your heels to the starting position."
        ],
        defaultSets: [
          { reps: 10, weight: 40, completed: false },
          { reps: 10, weight: 40, completed: false },
          { reps: 10, weight: 50, completed: false }
        ]
      },
      {
        id: "9",
        name: "Dumbbell Goblet Squat",
        gifUrl: "https://raw.githubusercontent.com/azilRababe/Exercises_Dataset/main/gif/0343.gif",
        target: "quads",
        equipment: "dumbbell",
        instructions: [
          "Hold a single dumbbell vertically against your chest.",
          "Keep your torso upright and perform a squat down to parallel.",
          "Push back up to stand."
        ],
        defaultSets: [
          { reps: 12, weight: 14, completed: false },
          { reps: 12, weight: 14, completed: false },
          { reps: 12, weight: 16, completed: false }
        ]
      },
      {
        id: "10",
        name: "Crunch (Abdominal)",
        gifUrl: "https://raw.githubusercontent.com/azilRababe/Exercises_Dataset/main/gif/0274.gif",
        target: "abs",
        equipment: "body weight",
        instructions: [
          "Lie on your back with knees bent and feet flat on the floor.",
          "Place hands behind your ears or crossed on your chest.",
          "Contract your abs to lift your head and shoulders off the floor.",
          "Lower back down slowly."
        ],
        defaultSets: [
          { reps: 15, weight: 0, completed: false },
          { reps: 15, weight: 0, completed: false },
          { reps: 15, weight: 0, completed: false }
        ]
      }
    ]
  }
];
