import React, { useState, useEffect } from 'react';
import { RecipeSummary, MealPlanGenerateRequest } from '../../types/mealPlanner';

interface MealSwapModalProps {
  currentRecipeId: string;
  mealPlanRequest: Omit<MealPlanGenerateRequest, 'userId'> & { userId: string };
  onConfirm: (recipe: RecipeSummary) => void;
  onClose: () => void;
}

const MealSwapModal: React.FC<MealSwapModalProps> = ({
  currentRecipeId,
  mealPlanRequest,
  onConfirm,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [candidate, setCandidate] = useState<RecipeSummary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSwap = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/meal-planner/swap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentRecipeId, ...mealPlanRequest }),
        });
        if (!res.ok) throw new Error('교체 실패');
        const data: RecipeSummary = await res.json();
        setCandidate(data);
      } catch {
        setError('대체 메뉴를 불러오지 못했어요 😢');
      } finally {
        setLoading(false);
      }
    };
    fetchSwap();
  }, [currentRecipeId]);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="메뉴 교체"
         onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="meal-swap-modal" style={{ position: 'relative' }}>
        <button className="modal-close" onClick={onClose} aria-label="닫기">✕</button>
        <h2>다른 메뉴로 교체할게요</h2>
        {loading && <p>메뉴 찾는 중... 🤖</p>}
        {error && <p role="alert">{error}</p>}
        {candidate && !loading && (
          <div className="swap-candidate">
            <img src={candidate.imageUrl} alt={candidate.title} />
            <h3>{candidate.title}</h3>
            <p>{candidate.calories} kcal · {candidate.readyInMinutes}분</p>
            <button onClick={() => onConfirm(candidate)}>이 메뉴로 교체 ✅</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealSwapModal;
