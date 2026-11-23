/* =========================================================
   Библиотека со понудени тренинг вежби
   ========================================================= */
const bibliotekaVezbi = [
    // Гради
    { ime: "Push-ups", kategorija: "Chest" },
    { ime: "Bench Press", kategorija: "Chest" },
    { ime: "Incline Dumbbell Press", kategorija: "Chest" },
    { ime: "Dumbbell Flyes", kategorija: "Chest" },
    { ime: "Chest Press Machine", kategorija: "Chest" },

    // Грб
    { ime: "Deadlift", kategorija: "Back" },
    { ime: "Barbell rows", kategorija: "Back" },
    { ime: "One-arm dumbbell rows", kategorija: "Back" },
    { ime: "Lat pulldown", kategorija: "Back" },
    { ime: "Pull-ups", kategorija: "Back" },

    // Раменици
    { ime: "Overhead press", kategorija: "Shoulders" },
    { ime: "Dumbbell lateral raises", kategorija: "Shoulders" },
    { ime: "Dumbbell front raises", kategorija: "Shoulders" },
    { ime: "Reverse flyes", kategorija: "Shoulders" },

    // Бицепс
    { ime: "Dumbbell bicep curls", kategorija: "Biceps" },
    { ime: "Barbell bicep curls", kategorija: "Biceps" },
    { ime: "Hammer curls", kategorija: "Biceps" },

    // Трицепс
    { ime: "Cable tricep pushdowns", kategorija: "Triceps" },
    { ime: "Dumbbell tricep extensions", kategorija: "Triceps" },
    { ime: "Diamond push-ups", kategorija: "Triceps" },

    // Квадрицепс
    { ime: "Squats", kategorija: "Quadriceps" },
    { ime: "Barbell squats", kategorija: "Quadriceps" },
    { ime: "Leg press", kategorija: "Quadriceps" },
    { ime: "Lunges", kategorija: "Quadriceps" },
    { ime: "Leg extensions", kategorija: "Quadriceps" },

    // Hamstrings
    { ime: "Romanian deadlift", kategorija: "Hamstrings" },
    { ime: "Leg curls", kategorija: "Hamstrings" },

    // Задна ложа
    { ime: "Glute bridge", kategorija: "Glutes" },
    { ime: "Hip thrust", kategorija: "Glutes" },
    { ime: "Reverse lunges", kategorija: "Glutes" },

    // Глутеус
    { ime: "Standing calf raises", kategorija: "Calves" },
    { ime: "Seated calf raises", kategorija: "Calves" },

    // Стомачни
    { ime: "Plank", kategorija: "Abs and core" },
    { ime: "Crunches", kategorija: "Abs and core" },
    { ime: "Reverse crunches", kategorija: "Abs and core" },
    { ime: "Leg raises", kategorija: "Abs and core" },
    { ime: "Bicycle crunches", kategorija: "Abs and core" },

    // Кардио
    { ime: "Running", kategorija: "Cardio" },
    { ime: "Brisk walking", kategorija: "Cardio" },
    { ime: "Cycling", kategorija: "Cardio" },
    { ime: "Jump rope", kategorija: "Cardio" },
    { ime: "Swimming", kategorija: "Cardio" },

    // Истегнување
    { ime: "Leg stretching", kategorija: "Mobility and stretching" },
    { ime: "Arm stretching", kategorija: "Mobility and stretching" },
    { ime: "Back stretching", kategorija: "Mobility and stretching" },
    { ime: "Chest stretching", kategorija: "Mobility and stretching" },
    { ime: "Hip stretching", kategorija: "Mobility and stretching" }
];

/* Денови во неделата за примена на вежбите */
const listaDenovi = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];