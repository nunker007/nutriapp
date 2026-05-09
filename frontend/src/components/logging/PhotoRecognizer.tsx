/**
 * PhotoRecognizer.tsx
 * 음식 사진 촬영 / 업로드 → AI 인식 → 영양소 자동 계산 컴포넌트
 *
 * ▸ 흐름:
 *   1. 카메라 촬영 or 갤러리 선택
 *   2. 미리보기 표시 + 업로드 확인
 *   3. 백엔드 /api/vision/recognize 호출
 *   4. 인식 결과(음식 목록 + 영양소) → NutrientPreviewCard 표시
 *   5. 사용자 수정 후 식단 기록에 저장
 */

import React, { useState, useRef, useCallback } from 'react';
import NutrientPreviewCard from './NutrientPreviewCard';
import BigTouchButton from '../common/BigTouchButton';
import LoadingSpinner from '../common/LoadingSpinner';
import { VisionRecognitionResult, RecognizedFoodItem } from '../../types/vision';

// ── 상태 타입 ─────────────────────────────────────────────────────────────────

type RecognizerState =
  | 'idle'           // 초기 상태
  | 'previewing'     // 이미지 선택/촬영 후 미리보기
  | 'recognizing'    // AI 인식 중
  | 'result'         // 인식 완료, 결과 표시
  | 'error';         // 오류

interface PhotoRecognizerProps {
  onConfirm: (items: RecognizedFoodItem[]) => void;
  onCancel: () => void;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

// ── Component ─────────────────────────────────────────────────────────────────

const PhotoRecognizer: React.FC<PhotoRecognizerProps> = ({
  onConfirm,
  onCancel,
  mealType,
}) => {
  const [state, setState] = useState<RecognizerState>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [recognitionResult, setRecognitionResult] =
    useState<VisionRecognitionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // ── 이미지 선택 처리 ──────────────────────────────────────────────────────
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // 파일 크기 제한: 10MB
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('이미지 파일은 10MB 이하만 가능해요 📏');
        setState('error');
        return;
      }

      // 지원 형식 체크
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/heic'].includes(file.type)) {
        setErrorMessage('JPG, PNG, WebP 형식의 이미지만 사용 가능해요');
        setState('error');
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setSelectedFile(file);
      setState('previewing');
    },
    []
  );

  // ── AI 음식 인식 API 호출 ─────────────────────────────────────────────────
  const handleRecognize = useCallback(async () => {
    if (!selectedFile) return;

    setState('recognizing');

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('mealType', mealType);

    try {
      const response = await fetch('/api/vision/recognize', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }

      const result: VisionRecognitionResult = await response.json();

      if (result.recognizedItems.length === 0) {
        setErrorMessage(
          '음식을 인식하지 못했어요 😅\n더 가까이서 찍거나 직접 검색해보세요!'
        );
        setState('error');
        return;
      }

      setRecognitionResult(result);
      setState('result');

    } catch (err) {
      setErrorMessage('인식 중 오류가 발생했어요. 잠시 후 다시 시도해주세요 🙏');
      setState('error');
    }
  }, [selectedFile, mealType]);

  // ── 수량 수정 ─────────────────────────────────────────────────────────────
  const handleAmountChange = useCallback(
    (foodId: string, newAmount: number) => {
      if (!recognitionResult) return;
      setRecognitionResult(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          recognizedItems: prev.recognizedItems.map(item =>
            item.id === foodId
              ? {
                  ...item,
                  consumedAmount: newAmount,
                  computedCalories: Math.round(
                    (item.caloriesPer100g * newAmount) / 100
                  ),
                }
              : item
          ),
        };
      });
    },
    [recognitionResult]
  );

  // ── 음식 항목 제거 ────────────────────────────────────────────────────────
  const handleRemoveItem = useCallback((foodId: string) => {
    setRecognitionResult(prev => {
      if (!prev) return prev;
      const updated = prev.recognizedItems.filter(i => i.id !== foodId);
      return updated.length > 0
        ? { ...prev, recognizedItems: updated }
        : null;
    });
    if (recognitionResult?.recognizedItems.length === 1) {
      setState('error');
      setErrorMessage('모든 항목이 제거되었어요. 다시 사진을 찍어볼까요?');
    }
  }, [recognitionResult]);

  // ── 초기화 ────────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedFile(null);
    setRecognitionResult(null);
    setErrorMessage('');
    setState('idle');
    // input 값 초기화
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  }, [previewUrl]);

  // ── 최종 확인 ─────────────────────────────────────────────────────────────
  const handleConfirm = useCallback(() => {
    if (!recognitionResult) return;
    onConfirm(recognitionResult.recognizedItems);
  }, [recognitionResult, onConfirm]);

  // ── 총 영양소 계산 ────────────────────────────────────────────────────────
  const totalNutrients = recognitionResult?.recognizedItems.reduce(
    (acc, item) => {
      const multiplier = item.consumedAmount / 100;
      return {
        calories:      acc.calories      + item.caloriesPer100g * multiplier,
        protein:       acc.protein       + item.proteinPer100g * multiplier,
        carbohydrates: acc.carbohydrates + item.carbsPer100g * multiplier,
        fat:           acc.fat           + item.fatPer100g * multiplier,
      };
    },
    { calories: 0, protein: 0, carbohydrates: 0, fat: 0 }
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="photo-recognizer" role="region" aria-label="음식 사진 인식">

      {/* 숨겨진 파일 입력들 */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"   // 후면 카메라 직접 실행
        onChange={handleFileSelect}
        className="visually-hidden"
        aria-label="카메라로 촬영"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="visually-hidden"
        aria-label="갤러리에서 선택"
      />

      {/* ── 초기 상태: 입력 방법 선택 ── */}
      {state === 'idle' && (
        <div className="capture-options">
          <div className="capture-prompt">
            <span className="prompt-icon" aria-hidden="true">📸</span>
            <p>식사 사진으로 칼로리를 자동 계산해요!</p>
          </div>
          <div className="capture-buttons">
            <BigTouchButton
              variant="primary"
              onClick={() => cameraInputRef.current?.click()}
              icon="📷"
              aria-label="카메라로 촬영하기"
            >
              카메라로 촬영
            </BigTouchButton>
            <BigTouchButton
              variant="secondary"
              onClick={() => galleryInputRef.current?.click()}
              icon="🖼️"
              aria-label="갤러리에서 사진 선택"
            >
              갤러리에서 선택
            </BigTouchButton>
          </div>
          <button className="cancel-link" onClick={onCancel}>
            직접 검색할게요 →
          </button>
        </div>
      )}

      {/* ── 미리보기: 촬영/선택된 이미지 확인 ── */}
      {state === 'previewing' && previewUrl && (
        <div className="preview-section">
          <img
            src={previewUrl}
            alt="선택한 식사 사진 미리보기"
            className="preview-image"
          />
          <p className="preview-hint">이 사진으로 음식을 인식할게요!</p>
          <div className="preview-actions">
            <BigTouchButton variant="primary" onClick={handleRecognize}>
              음식 인식 시작 🔍
            </BigTouchButton>
            <BigTouchButton variant="secondary" onClick={handleReset}>
              다시 찍기
            </BigTouchButton>
          </div>
        </div>
      )}

      {/* ── 인식 중: 로딩 ── */}
      {state === 'recognizing' && (
        <div className="recognizing-section" aria-live="polite">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="인식 중인 사진"
              className="preview-image preview-image--analyzing"
            />
          )}
          <LoadingSpinner />
          <p className="recognizing-text">
            음식을 분석하고 있어요... 잠깐만요! 🤖
          </p>
        </div>
      )}

      {/* ── 결과: 인식된 음식 목록 ── */}
      {state === 'result' && recognitionResult && (
        <div className="result-section">

          {/* 분석 사진 썸네일 */}
          {previewUrl && (
            <img
              src={previewUrl}
              alt="분석된 사진"
              className="preview-image preview-image--small"
            />
          )}

          {/* 신뢰도 배너 */}
          <div
            className={`confidence-banner confidence-banner--${
              recognitionResult.overallConfidence > 0.8 ? 'high' :
              recognitionResult.overallConfidence > 0.5 ? 'medium' : 'low'
            }`}
            role="status"
          >
            <span>
              인식 정확도:{' '}
              {Math.round(recognitionResult.overallConfidence * 100)}%
            </span>
            {recognitionResult.overallConfidence < 0.6 && (
              <span className="confidence-hint">
                확인 후 수정해주세요 ✏️
              </span>
            )}
          </div>

          {/* 인식된 음식 목록 */}
          <ul className="recognized-items-list" aria-label="인식된 음식 목록">
            {recognitionResult.recognizedItems.map(item => (
              <li key={item.id} className="recognized-item">
                <div className="item-header">
                  <span className="item-name">{item.foodName}</span>
                  <span className="item-confidence">
                    {Math.round(item.confidence * 100)}% 확신
                  </span>
                  <button
                    className="item-remove"
                    onClick={() => handleRemoveItem(item.id)}
                    aria-label={`${item.foodName} 제거`}
                  >
                    ✕
                  </button>
                </div>

                {/* 수량 조절 */}
                <div className="item-amount">
                  <label htmlFor={`amount-${item.id}`}>섭취량</label>
                  <div className="amount-controls">
                    <button
                      onClick={() =>
                        handleAmountChange(item.id, Math.max(10, item.consumedAmount - 10))
                      }
                      aria-label="10g 감소"
                    >
                      −
                    </button>
                    <input
                      id={`amount-${item.id}`}
                      type="number"
                      value={item.consumedAmount}
                      min={10}
                      max={2000}
                      step={10}
                      onChange={e =>
                        handleAmountChange(item.id, parseInt(e.target.value) || 100)
                      }
                      aria-label="섭취량 직접 입력 (g)"
                    />
                    <span className="amount-unit">g</span>
                    <button
                      onClick={() =>
                        handleAmountChange(item.id, item.consumedAmount + 10)
                      }
                      aria-label="10g 증가"
                    >
                      +
                    </button>
                  </div>
                  <span className="item-calories">
                    ≈ {item.computedCalories} kcal
                  </span>
                </div>
              </li>
            ))}
          </ul>

          {/* 총 영양소 요약 */}
          {totalNutrients && (
            <div className="total-nutrients-summary" aria-label="총 영양소 요약">
              <h3>이번 식사 총합</h3>
              <div className="nutrient-grid">
                <div className="nutrient-item">
                  <span className="nutrient-label">칼로리</span>
                  <span className="nutrient-value">
                    {Math.round(totalNutrients.calories)} kcal
                  </span>
                </div>
                <div className="nutrient-item">
                  <span className="nutrient-label">탄수화물</span>
                  <span className="nutrient-value">
                    {Math.round(totalNutrients.carbohydrates)}g
                  </span>
                </div>
                <div className="nutrient-item">
                  <span className="nutrient-label">단백질</span>
                  <span className="nutrient-value">
                    {Math.round(totalNutrients.protein)}g
                  </span>
                </div>
                <div className="nutrient-item">
                  <span className="nutrient-label">지방</span>
                  <span className="nutrient-value">
                    {Math.round(totalNutrients.fat)}g
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 확인 / 재시도 */}
          <div className="result-actions">
            <BigTouchButton variant="primary" onClick={handleConfirm}>
              기록에 저장 ✅
            </BigTouchButton>
            <BigTouchButton variant="secondary" onClick={handleReset}>
              다시 찍기
            </BigTouchButton>
          </div>
        </div>
      )}

      {/* ── 오류 상태 ── */}
      {state === 'error' && (
        <div className="error-section" role="alert">
          <span className="error-icon" aria-hidden="true">😅</span>
          <p className="error-message">{errorMessage}</p>
          <div className="error-actions">
            <BigTouchButton variant="primary" onClick={handleReset}>
              다시 시도
            </BigTouchButton>
            <BigTouchButton variant="secondary" onClick={onCancel}>
              직접 검색하기
            </BigTouchButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoRecognizer;
