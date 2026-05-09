/**
 * FoodSafetyAPISearchBar.tsx
 * 식약처 API(식품안전나라 I2790) 연동 검색 컴포넌트
 * - 실시간 디바운스 검색 (300ms)
 * - 국내 가공식품 영양 정보 자동 완성
 * - 선택 시 NutrientPreviewCard로 영양 정보 미리보기
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FoodSafetyItem } from '../../types/foodSafety';
import NutrientPreviewCard from './NutrientPreviewCard';

interface FoodSafetyAPISearchBarProps {
  onSelect: (item: FoodSafetyItem) => void;
  placeholder?: string;
}

// ── 디바운스 훅 ──────────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// ── Component ─────────────────────────────────────────────────────────────────

const FoodSafetyAPISearchBar: React.FC<FoodSafetyAPISearchBarProps> = ({
  onSelect,
  placeholder = '식품명 또는 제품명 검색...',
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodSafetyItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<FoodSafetyItem | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // ── API 호출 ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    let cancelled = false;
    const fetchFoods = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/food-safety/search?query=${encodeURIComponent(debouncedQuery)}&limit=10`
        );
        if (!response.ok) throw new Error('검색 중 오류가 발생했어요');
        const data: FoodSafetyItem[] = await response.json();
        if (!cancelled) setResults(data);
      } catch (err) {
        if (!cancelled) setError('잠시 후 다시 시도해주세요 🙏');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchFoods();
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  // ── 키보드 네비게이션 ─────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!results.length) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          if (highlightedIndex >= 0) {
            handleSelect(results[highlightedIndex]);
          }
          break;
        case 'Escape':
          setResults([]);
          setHighlightedIndex(-1);
          break;
      }
    },
    [results, highlightedIndex]
  );

  const handleSelect = (item: FoodSafetyItem) => {
    setSelectedItem(item);
    setQuery(item.foodName);
    setResults([]);
    setHighlightedIndex(-1);
    onSelect(item);
  };

  return (
    <div className="food-safety-search" role="search" aria-label="식품 검색">
      {/* 검색 입력 */}
      <div className="search-input-wrapper">
        <span className="search-icon" aria-hidden="true">🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="식품명 입력"
          aria-autocomplete="list"
          aria-controls="food-search-results"
          aria-expanded={results.length > 0}
          autoComplete="off"
          className="search-input large-touch"
        />
        {isLoading && (
          <span className="loading-indicator" aria-label="검색 중">⏳</span>
        )}
      </div>

      {/* 오류 메시지 */}
      {error && (
        <p className="search-error" role="alert">{error}</p>
      )}

      {/* 자동완성 결과 */}
      {results.length > 0 && (
        <ul
          id="food-search-results"
          ref={listRef}
          className="search-results-list"
          role="listbox"
          aria-label="검색 결과"
        >
          {results.map((item, idx) => (
            <li
              key={item.foodCode}
              role="option"
              aria-selected={idx === highlightedIndex}
              className={`result-item ${idx === highlightedIndex ? 'highlighted' : ''}`}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setHighlightedIndex(idx)}
            >
              <div className="result-main">
                <span className="food-name">{item.foodName}</span>
                <span className="manufacturer">{item.manufacturer}</span>
              </div>
              <div className="result-nutrient-summary">
                <span className="calorie-badge">
                  {item.caloriesPer100g} kcal/100g
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 선택된 식품 영양 미리보기 */}
      {selectedItem && (
        <NutrientPreviewCard
          item={selectedItem}
          onConfirm={() => onSelect(selectedItem)}
          onCancel={() => {
            setSelectedItem(null);
            setQuery('');
            inputRef.current?.focus();
          }}
        />
      )}
    </div>
  );
};

export default FoodSafetyAPISearchBar;
