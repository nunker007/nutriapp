import React from 'react';
import { RecoveryMessage } from '../../types/coaching';

interface RecoveryMessageBannerProps {
  message: RecoveryMessage;
  onAccept: () => void;
  onDismiss: () => void;
}

const RecoveryMessageBanner: React.FC<RecoveryMessageBannerProps> = ({
  message,
  onAccept,
  onDismiss,
}) => (
  <div className={`recovery-banner recovery-banner--${message.severity}`} role="alert">
    <p className="recovery-banner__message">{message.primaryMessage}</p>
    <div className="recovery-banner__actions">
      <button onClick={onAccept}>{message.acceptButtonLabel ?? '괜찮아요 💪'}</button>
      <button onClick={onDismiss} className="recovery-banner__dismiss">나중에</button>
    </div>
  </div>
);

export default RecoveryMessageBanner;
