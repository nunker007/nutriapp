import React from 'react';

interface BarcodeScannerProps {
  onResult: (barcode: string) => void;
  onCancel: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onResult, onCancel }) => (
  <div className="barcode-scanner" role="region" aria-label="바코드 스캔">
    <div className="scanner-viewfinder" aria-hidden="true">
      <div className="scanner-line" />
    </div>
    <p>카메라를 바코드에 맞춰주세요</p>
    <button onClick={onCancel}>취소</button>
  </div>
);

export default BarcodeScanner;
