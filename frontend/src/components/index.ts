/**
 * Nutri-Companion Component Index
 * 모든 컴포넌트의 중앙 집중식 내보내기 파일
 */

// ── Onboarding ──────────────────────────────────────────────────────────────
export { default as OnboardingFlow } from './onboarding/OnboardingFlow';
export { default as GoalStep } from './onboarding/steps/GoalStep';
export { default as ProfileStep } from './onboarding/steps/ProfileStep';
export { default as DietaryStep } from './onboarding/steps/DietaryStep';
export { default as AllergyStep } from './onboarding/steps/AllergyStep';
export { default as ProgressBar } from './onboarding/ProgressBar';

// ── Character / Mascot ──────────────────────────────────────────────────────
export { default as CompanionCharacter } from './character/CompanionCharacter';
export { default as SpeechBubble } from './character/SpeechBubble';
export { default as EmotionalRecoveryOverlay } from './character/EmotionalRecoveryOverlay';

// ── Dashboard ───────────────────────────────────────────────────────────────
export { default as Dashboard } from './dashboard/Dashboard';
export { default as NutrientRing } from './dashboard/NutrientRing';
export { default as WeightTrendChart } from './dashboard/WeightTrendChart';
export { default as DailyCalorieSummary } from './dashboard/DailyCalorieSummary';
export { default as WeeklyDietLevelReport } from './dashboard/WeeklyDietLevelReport';

// ── Meal Planner ────────────────────────────────────────────────────────────
export { default as WeeklyMealPlanner } from './mealPlanner/WeeklyMealPlanner';
export { default as MealCard } from './mealPlanner/MealCard';
export { default as MealSwapModal } from './mealPlanner/MealSwapModal';
export { default as RecipeDetail } from './mealPlanner/RecipeDetail';

// ── Smart Logging ───────────────────────────────────────────────────────────
export { default as FoodLogFAB } from './logging/FoodLogFAB';
export { default as PhotoRecognizer } from './logging/PhotoRecognizer';
export { default as BarcodeScanner } from './logging/BarcodeScanner';
export { default as FoodSearchModal } from './logging/FoodSearchModal';
export { default as NutrientPreviewCard } from './logging/NutrientPreviewCard';
export { default as FoodSafetyAPISearchBar } from './logging/FoodSafetyAPISearchBar';

// ── AI Coaching ─────────────────────────────────────────────────────────────
export { default as AICoachPanel } from './coaching/AICoachPanel';
export { default as InsightCard } from './coaching/InsightCard';
export { default as RecoveryMessageBanner } from './coaching/RecoveryMessageBanner';
export { default as StreakTracker } from './coaching/StreakTracker';

// ── Social / Gamification ───────────────────────────────────────────────────
export { default as GroupFeed } from './social/GroupFeed';
export { default as ChallengeCard } from './social/ChallengeCard';
export { default as HighFiveButton } from './social/HighFiveButton';
export { default as BadgeCollection } from './social/BadgeCollection';
export { default as ConfettiEffect } from './social/ConfettiEffect';

// ── Common / Shared ─────────────────────────────────────────────────────────
export { default as BigTouchButton } from './common/BigTouchButton';
export { default as ScalableText } from './common/ScalableText';
export { default as DarkModeToggle } from './common/DarkModeToggle';
export { default as LoadingSpinner } from './common/LoadingSpinner';
export { default as ErrorBoundary } from './common/ErrorBoundary';
