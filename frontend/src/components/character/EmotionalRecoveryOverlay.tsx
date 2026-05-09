/**
 * EmotionalRecoveryOverlay.tsx
 * 수치심 격차(Shame Gap) 해소를 위한 정서적 복구 UI 오버레이
 * - 실패 유형에 따른 맞춤 캐릭터 반응
 * - CBT 기반 재귀인(Re-attribution) 메시지 표시
 * - 복구 플랜 제안 및 '괜찮아' 확인 인터랙션
 */

import React, { useEffect, useState } from 'react';
import CompanionCharacter from './CompanionCharacter';
import SpeechBubble from './SpeechBubble';
import BigTouchButton from '../common/BigTouchButton';
import { RecoveryMessage } from '../../types/coaching';

interface EmotionalRecoveryOverlayProps {
  recoveryMessage: RecoveryMessage;
  onAccept: () => void;          // "괜찮아, 계속할게요" 클릭
  onViewRecoveryPlan: () => void; // 복구 플랜 보기
  onDismiss: () => void;          // 나중에
}

type CharacterEmotion = 'empathetic' | 'encouraging' | 'celebrating' | 'concerned';

// 실패 유형별 캐릭터 감정 매핑
const FAILURE_EMOTION_MAP: Record<string, CharacterEmotion> = {
  SKIPPED_MEAL:     'empathetic',
  OVEREATING:       'empathetic',
  MISSED_LOG:       'encouraging',
  UNHEALTHY_CHOICE: 'encouraging',
  STREAK_BROKEN:    'concerned',
  GOAL_MISSED:      'empathetic',
};

const EmotionalRecoveryOverlay: React.FC<EmotionalRecoveryOverlayProps> = ({
  recoveryMessage,
  onAccept,
  onViewRecoveryPlan,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPlan, setShowPlan] = useState(false);

  useEffect(() => {
    // 부드러운 등장 애니메이션을 위한 딜레이
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const emotion: CharacterEmotion =
    FAILURE_EMOTION_MAP[recoveryMessage.failureType] ?? 'empathetic';

  const handleAccept = () => {
    setIsVisible(false);
    setTimeout(onAccept, 300); // 페이드아웃 후 콜백
  };

  return (
    <div
      className={`recovery-overlay ${isVisible ? 'visible' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="정서적 지원 메시지"
    >
      {/* 반투명 배경 */}
      <div className="overlay-backdrop" onClick={onDismiss} />

      <div className="recovery-card">
        {/* 캐릭터 */}
        <div className="character-wrapper">
          <CompanionCharacter
            emotion={emotion}
            isAnimated
            size="large"
          />
        </div>

        {/* 메인 공감 메시지 */}
        <SpeechBubble
          message={recoveryMessage.primaryMessage}
          variant="empathy"
          isAnimated
        />

        {/* CBT 재귀인(Re-attribution) 메시지 */}
        {recoveryMessage.reattributionText && (
          <div
            className="reattribution-message"
            role="note"
            aria-label="관점 전환 메시지"
          >
            <span className="icon">💡</span>
            <p>{recoveryMessage.reattributionText}</p>
          </div>
        )}

        {/* 복구 마이크로 액션 */}
        {showPlan && recoveryMessage.microActions && (
          <ul className="micro-actions-list" aria-label="지금 당장 할 수 있는 것들">
            {recoveryMessage.microActions.map((action, idx) => (
              <li key={idx} className="micro-action-item">
                <span className="action-icon">{action.icon}</span>
                <span>{action.text}</span>
              </li>
            ))}
          </ul>
        )}

        {/* 진행 메시지 (선택지 표시 전) */}
        <p className="follow-up-question">
          {recoveryMessage.followUpQuestion}
        </p>

        {/* 액션 버튼 그룹 */}
        <div className="action-buttons">
          <BigTouchButton
            variant="primary"
            onClick={handleAccept}
            aria-label="계속 진행하기"
          >
            {recoveryMessage.acceptButtonLabel ?? '괜찮아, 계속할게요 💪'}
          </BigTouchButton>

          <BigTouchButton
            variant="secondary"
            onClick={() => {
              setShowPlan(true);
              onViewRecoveryPlan();
            }}
            aria-label="복구 플랜 확인하기"
          >
            복구 플랜 보여줘
          </BigTouchButton>

          <button
            className="dismiss-link"
            onClick={onDismiss}
            aria-label="나중에 확인"
          >
            나중에 볼게요
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmotionalRecoveryOverlay;
