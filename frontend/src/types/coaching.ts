/**
 * coaching.ts
 * AI 코칭 및 정서적 복구 메시지 관련 타입 정의
 */

// ── 실패 유형 열거 ────────────────────────────────────────────────────────────

export type FailureType =
  | 'SKIPPED_MEAL'       // 식사 건너뜀
  | 'OVEREATING'         // 과식
  | 'MISSED_LOG'         // 기록 누락
  | 'UNHEALTHY_CHOICE'   // 건강하지 않은 음식 선택
  | 'STREAK_BROKEN'      // 연속 기록 중단
  | 'GOAL_MISSED'        // 주간 목표 미달
  | 'BINGE_EATING';      // 폭식 감지

// ── CBT 기반 복구 메시지 타입 ────────────────────────────────────────────────

export interface MicroAction {
  icon: string;
  text: string;
  durationMinutes?: number;  // 예상 소요 시간
}

export interface RecoveryMessage {
  id: string;
  failureType: FailureType;
  severity: 'low' | 'medium' | 'high';

  // 메인 공감 메시지 (캐릭터 말풍선용)
  primaryMessage: string;

  // CBT 재귀인(Re-attribution): 상황을 다르게 바라보도록 돕는 텍스트
  reattributionText?: string;

  // 지금 당장 할 수 있는 작은 회복 행동
  microActions?: MicroAction[];

  // 복구 제안 질문
  followUpQuestion: string;

  // 버튼 레이블 커스터마이징
  acceptButtonLabel?: string;

  // 관련 인사이트 카드 ID (선택적으로 연결)
  linkedInsightId?: string;

  // 메시지 생성 메타데이터
  generatedAt: string;   // ISO 8601
  llmModel?: string;     // 어떤 LLM이 생성했는지 (로깅용)
}

// ── 코칭 인사이트 카드 타입 ──────────────────────────────────────────────────

export interface InsightCard {
  id: string;
  type: 'encouragement' | 'warning' | 'tip' | 'achievement';
  title: string;
  body: string;
  icon: string;
  ctaLabel?: string;
  ctaAction?: string;
  expiresAt?: string;
}

// ── 유저 행동 컨텍스트 (메시지 생성 입력) ─────────────────────────────────────

export interface UserBehaviorContext {
  userId: string;
  failureType: FailureType;
  failureTimestamp: string;

  // 최근 행동 패턴
  recentLogCount7Days: number;       // 최근 7일 기록 횟수
  currentStreakDays: number;         // 현재 연속 기록 일수
  longestStreakDays: number;         // 최장 연속 기록
  weeklyGoalCompletionRate: number;  // 0 ~ 1 (주간 목표 달성률)

  // 추가 컨텍스트
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  isWeekend: boolean;
  previousRecoveryCount: number;     // 이번 주 복구 횟수 (과도한 격려 방지)

  // 식단 데이터
  todayCalorieIntake?: number;
  todayCalorieTarget?: number;
  overeatingAmount?: number;         // 과식량 (kcal)
}
