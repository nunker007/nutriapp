import React from 'react';
import { RecipeSummary } from '../../types/mealPlanner';

interface RecipeDetailProps {
  recipe: RecipeSummary;
  onClose: () => void;
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, onClose }) => (
  <div className="recipe-detail" role="dialog" aria-modal="true" aria-label="레시피 상세">
    <button onClick={onClose} aria-label="닫기">✕</button>
    <img src={recipe.imageUrl} alt={recipe.title} />
    <h2>{recipe.title}</h2>
    <ul className="recipe-detail__nutrients">
      <li>칼로리: {recipe.calories} kcal</li>
      <li>단백질: {recipe.protein}g</li>
      <li>탄수화물: {recipe.carbohydrates}g</li>
      <li>지방: {recipe.fat}g</li>
    </ul>
    <p>⏱ {recipe.readyInMinutes}분 · {recipe.servings}인분</p>
    {recipe.sourceUrl && (
      <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer">
        레시피 보기 →
      </a>
    )}
  </div>
);

export default RecipeDetail;
