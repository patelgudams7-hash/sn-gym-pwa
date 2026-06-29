/**
 * Calculate BMI based on weight (kg) and height (cm)
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @returns {object} { bmi: number, category: string, color: string, gaugePercent: number }
 */
export const calculateBMI = (weight, height) => {
  if (!weight || !height) return { bmi: 0, category: "N/A", color: "#C9A84C", gaugePercent: 0 };

  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  const roundedBmi = Math.round(bmi * 10) / 10;

  let category = "Normal";
  let color = "#C9A84C"; // Gold (normal)
  let gaugePercent = 50; // 0 to 100 for gauge

  if (roundedBmi < 18.5) {
    category = "Underweight";
    color = "#8A9A86"; // Soft sage green
    // Scale 10-18.5 to 0-30%
    gaugePercent = Math.max(0, Math.min(30, ((roundedBmi - 10) / 8.5) * 30));
  } else if (roundedBmi >= 18.5 && roundedBmi < 25) {
    category = "Normal Weight";
    color = "#C9A84C"; // Premium gold
    // Scale 18.5-25 to 30-65%
    gaugePercent = 30 + ((roundedBmi - 18.5) / 6.5) * 35;
  } else if (roundedBmi >= 25 && roundedBmi < 30) {
    category = "Overweight";
    color = "#D9824B"; // Gold-orange
    // Scale 25-30 to 65-85%
    gaugePercent = 65 + ((roundedBmi - 25) / 5) * 20;
  } else {
    category = "Obese";
    color = "#B83A3A"; // Muted deep red
    // Scale 30-40 to 85-100%
    gaugePercent = 85 + Math.min(15, ((roundedBmi - 30) / 10) * 15);
  }

  return {
    bmi: roundedBmi,
    category,
    color,
    gaugePercent: Math.round(gaugePercent)
  };
};
