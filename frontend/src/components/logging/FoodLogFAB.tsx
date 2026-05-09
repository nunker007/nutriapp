import React, { useState } from 'react';

interface FoodLogFABProps {
  onPhotoCapture: () => void;
  onBarcodeScanner: () => void;
  onManualSearch: () => void;
}

const FoodLogFAB: React.FC<FoodLogFABProps> = ({
  onPhotoCapture,
  onBarcodeScanner,
  onManualSearch,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="food-log-fab" aria-label="식사 기록 추가">
      {expanded && (
        <div className="fab-options" role="menu">
          <button role="menuitem" onClick={onPhotoCapture}  aria-label="사진으로 기록">📸 사진</button>
          <button role="menuitem" onClick={onBarcodeScanner} aria-label="바코드 스캔">🔍 바코드</button>
          <button role="menuitem" onClick={onManualSearch}   aria-label="직접 검색">✏️ 검색</button>
        </div>
      )}
      <button
        className="fab-main"
        onClick={() => setExpanded(p => !p)}
        aria-expanded={expanded}
        aria-label={expanded ? '닫기' : '식사 기록 추가'}
      >
        {expanded ? '✕' : '+'}
      </button>
    </div>
  );
};

export default FoodLogFAB;
