import React from 'react';
import { MealSlot } from '../../types/mealPlanner';

const MEAL_TYPE_KO: Record<string, string> = {
  breakfast: '아침',
  lunch:     '점심',
  dinner:    '저녁',
  snack:     '간식',
};

interface MealCardProps {
  slot: MealSlot;
  onComplete: () => void;
  onSwap: () => void;
}

const MealCard: React.FC<MealCardProps> = ({ slot, onComplete, onSwap }) => (
  <div
    className={`meal-card ${slot.isCompleted ? 'meal-card--completed' : ''}`}
    aria-label={`${MEAL_TYPE_KO[slot.mealType]} - ${slot.recipe.title}`}
  >
    <div className="meal-card__header">
      <span className="meal-card__type">{MEAL_TYPE_KO[slot.mealType]}</span>
      {slot.isSwapped && <span className="meal-card__swapped-badge">교체됨</span>}
    </div>

    {slot.recipe.imageUrl && (
      <img
        src={slot.recipe.imageUrl}
        alt={slot.recipe.title}
        className="meal-card__image"
      />
    )}

    <div className="meal-card__body">
      <h4 className="meal-card__title">{slot.recipe.title}</h4>
      <p className="meal-card__meta">
        ⏱ {slot.recipe.readyInMinutes}분 · {slot.recipe.calories} kcal
      </p>
    </div>

    <div className="meal-card__actions">
      <button
        className={`meal-card__complete-btn ${slot.isCompleted ? 'active' : ''}`}
        onClick={onComplete}
        aria-label={slot.isCompleted ? '완료 취소' : '끼니 완료'}
      >
        {slot.isCompleted ? '✅ 완료' : '완료하기'}
      </button>
      <button
        className="meal-card__swap-btn"
        onClick={onSwap}
        aria-label="다른 메뉴로 교체"
      >
        🔄 교체
      </button>
    </div>
  </div>
);

export default MealCard;
