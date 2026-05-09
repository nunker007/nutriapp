import React from 'react';
import { FoodSafetyItem } from '../../types/foodSafety';
import { RecognizedFoodItem } from '../../types/vision';

interface NutrientPreviewCardBaseProps {
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface FoodSafetyPreviewProps extends NutrientPreviewCardBaseProps {
  item: FoodSafetyItem;
}

interface RecognizedPreviewProps extends NutrientPreviewCardBaseProps {
  item: RecognizedFoodItem;
}

type NutrientPreviewCardProps = FoodSafetyPreviewProps | RecognizedPreviewProps;

function isFoodSafetyItem(item: FoodSafetyItem | RecognizedFoodItem): item is FoodSafetyItem {
  return 'nutrientPer100g' in item;
}

const NutrientPreviewCard: React.FC<NutrientPreviewCardProps> = ({
  item,
  onConfirm,
  onCancel,
}) => {
  const name    = isFoodSafetyItem(item) ? item.foodName : item.foodName;
  const cal100  = isFoodSafetyItem(item) ? item.nutrientPer100g.calories  : item.caloriesPer100g;
  const prot100 = isFoodSafetyItem(item) ? item.nutrientPer100g.protein   : item.proteinPer100g;
  const carb100 = isFoodSafetyItem(item) ? item.nutrientPer100g.carbohydrates : item.carbsPer100g;
  const fat100  = isFoodSafetyItem(item) ? item.nutrientPer100g.fat       : item.fatPer100g;
  const amount  = isFoodSafetyItem(item) ? item.servingSize : item.consumedAmount;
  const multiplier = amount / 100;

  return (
    <div className="nutrient-preview-card">
      <h4 className="preview-card__name">{name}</h4>
      <p className="preview-card__amount">{amount}g 기준</p>
      <ul className="preview-card__nutrients">
        <li>칼로리: {Math.round(cal100  * multiplier)} kcal</li>
        <li>단백질: {Math.round(prot100 * multiplier)}g</li>
        <li>탄수화물: {Math.round(carb100 * multiplier)}g</li>
        <li>지방: {Math.round(fat100  * multiplier)}g</li>
      </ul>
      {(onConfirm || onCancel) && (
        <div className="preview-card__actions">
          {onConfirm && <button onClick={onConfirm}>기록에 추가 ✅</button>}
          {onCancel  && <button onClick={onCancel}>취소</button>}
        </div>
      )}
    </div>
  );
};

export default NutrientPreviewCard;
