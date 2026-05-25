export function mapDifficultyLevel(difficulty?: number): "easy" | "medium" | "hard" | "unknown" {
  if (difficulty === undefined) return "unknown";
  if (difficulty <= 30) return "easy";
  if (difficulty <= 60) return "medium";
  return "hard";
}
