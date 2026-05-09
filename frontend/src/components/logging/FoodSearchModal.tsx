import React from 'react';
import FoodSafetyAPISearchBar from './FoodSafetyAPISearchBar';
import { FoodSafetyItem } from '../../types/foodSafety';

interface FoodSearchModalProps {
  onSelect: (item: FoodSafetyItem) => void;
  onClose: () => void;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

const FoodSearchModal: React.FC<FoodSearchModalProps> = ({ onSelect, onClose, mealType }) => (
  <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="음식 검색">
    <div className="food-search-modal">
      <div className="modal-header">
        <h2>음식 검색</h2>
        <button onClick={onClose} aria-label="닫기">✕</button>
      </div>
      <FoodSafetyAPISearchBar onSelect={onSelect} />
    </div>
  </div>
);

export default FoodSearchModal;
