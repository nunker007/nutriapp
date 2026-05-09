import React from 'react';

interface ProgressBarProps {
  steps: readonly string[];
  currentStep: number;
  'aria-label'?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ steps, currentStep, 'aria-label': ariaLabel }) => {
  const pct = Math.round(((currentStep + 1) / steps.length) * 100);

  return (
    <div
      className="onboarding-progress"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
    >
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <ol className="progress-steps">
        {steps.map((step, i) => (
          <li
            key={step}
            className={[
              'progress-step',
              i < currentStep  ? 'progress-step--done'   : '',
              i === currentStep ? 'progress-step--active' : '',
            ].join(' ')}
          >
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
};

export default ProgressBar;
