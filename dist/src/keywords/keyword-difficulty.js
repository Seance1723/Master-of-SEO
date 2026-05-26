export function mapDifficultyLevel(difficulty) {
    if (difficulty === undefined)
        return "unknown";
    if (difficulty <= 30)
        return "easy";
    if (difficulty <= 60)
        return "medium";
    return "hard";
}
//# sourceMappingURL=keyword-difficulty.js.map