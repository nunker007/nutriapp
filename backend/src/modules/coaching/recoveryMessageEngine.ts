/**
 * recoveryMessageEngine.ts
 * CBT(인지행동치료) 기반 정서적 복구 메시지 생성 엔진
 *
 * ▸ 설계 원칙:
 *   1. 수치심 격차(Shame Gap) 최소화 - 비난 없는 공감 우선
 *   2. CBT 재귀인(Re-attribution) - 상황을 다른 시각으로 재해석
 *   3. 마이크로 행동(Micro-Action) - 즉시 실천 가능한 작은 회복 행동 제안
 *   4. 맥락 인지 - 시간대/주말/이전 복구 횟수를 고려한 메시지 개인화
 *   5. LLM 폴백 - 정적 메시지 부족 시 GPT/Claude로 동적 생성
 */

import { v4 as uuidv4 } from 'uuid';
import {
  FailureType,
  RecoveryMessage,
  MicroAction,
  UserBehaviorContext,
} from '../../types/coaching';
import { llmCoachingService } from '../ai/llmCoachingService';

// ── CBT 기반 정적 메시지 풀 ───────────────────────────────────────────────────
// 각 실패 유형별로 3~5개의 변형 메시지를 준비해 단조로움 방지

interface StaticMessageTemplate {
  primaryMessages: string[];
  reattributionTexts: string[];
  followUpQuestions: string[];
  acceptButtonLabels: string[];
}

const MESSAGE_TEMPLATES: Record<FailureType, StaticMessageTemplate> = {
  SKIPPED_MEAL: {
    primaryMessages: [
      "식사를 건너뛰셨군요. 바쁜 하루였나요? 🤍\n그래도 지금 이렇게 앱을 켜준 것만으로도 충분해요.",
      "괜찮아요. 완벽한 하루보다 '계속 돌아오는 것'이 훨씬 더 중요하거든요 🌱",
      "한 끼 빠진 건 실패가 아니에요. 우리 몸은 훨씬 유연하고 강하답니다 💪",
    ],
    reattributionTexts: [
      "한 끼 건너뛰는 건 전체 식단 계획의 일부를 잠깐 미룬 것뿐이에요. 오늘의 나머지 시간이 아직 있어요.",
      "다이어트 성공 여부는 '완벽한 하루'가 아닌 '꾸준한 복귀'로 결정돼요. 지금 돌아온 게 맞아요.",
      "연구에 따르면 식단 관리에서 중간에 빠지는 것은 완전히 정상이에요. 중요한 건 다음 선택이에요.",
    ],
    followUpQuestions: [
      "지금 배고프다면, 가볍게 뭔가 챙겨 드시는 건 어때요?",
      "다음 식사까지 오래 남았다면, 건강한 간식 하나를 기록해볼까요?",
    ],
    acceptButtonLabels: [
      "좋아, 다음 식사 기록할게요 🍽️",
      "괜찮아, 오늘 저녁 잘 먹을게요",
    ],
  },

  OVEREATING: {
    primaryMessages: [
      "과식했다고 자신을 너무 몰아붙이지 마세요 🤍\n오늘 하루 몸이 많은 걸 원했던 거예요.",
      "누구나 과식해요. 그게 나쁜 사람이라는 뜻이 아니에요.\n다음 한 걸음이 중요할 뿐이에요 😊",
      "과식 후 죄책감은 오히려 다음 과식을 부르는 악순환을 만들어요.\n지금 잠깐 숨을 고르는 건 정말 현명한 선택이에요 🌿",
    ],
    reattributionTexts: [
      "과식은 의지력 부족이 아니에요. 스트레스, 수면 부족, 혹은 오전에 너무 적게 드신 결과일 수 있어요.",
      "오늘 섭취한 칼로리는 내일 활동량으로 충분히 조율할 수 있어요. 단 하루의 식사가 전체 목표를 무너뜨리지는 않아요.",
      "몸이 원하는 걸 먹는 것 자체는 자연스러운 본능이에요. 중요한 건 그 다음 선택이죠.",
    ],
    followUpQuestions: [
      "물 한 잔 마시고 5분 산책하면 어떨까요?",
      "오늘 과식하게 된 이유를 짧게 적어볼까요? 패턴을 찾는 데 도움이 돼요.",
    ],
    acceptButtonLabels: [
      "괜찮아요, 내일은 더 나을 거예요 🌅",
      "오늘은 여기서 마무리할게요",
    ],
  },

  MISSED_LOG: {
    primaryMessages: [
      "기록을 빠뜨렸어요? 아무 문제 없어요!\n지금 기억나는 것부터 적어도 충분해요 📝",
      "완벽한 기록이 목표가 아니에요. '꾸준히 돌아오는 것'이 진짜 목표예요 🌱",
      "바빴던 하루였군요. 기록은 놓쳤어도 오늘 하루를 열심히 살았을 거예요 😊",
    ],
    reattributionTexts: [
      "기록 누락이 곧 실패는 아니에요. 기억나는 것 70%만 기록해도 패턴 분석에는 충분해요.",
      "24시간 중 1~2번만 기록해도 식습관 인식을 높이는 효과가 있어요.",
    ],
    followUpQuestions: [
      "지금 오늘 먹은 것 중 기억나는 것 하나만 기록해볼까요?",
      "내일은 아침 식사 사진 한 장으로 시작해보면 어떨까요?",
    ],
    acceptButtonLabels: [
      "지금 바로 기록할게요 ✏️",
      "내일 아침부터 다시 시작할게요",
    ],
  },

  UNHEALTHY_CHOICE: {
    primaryMessages: [
      "오늘 계획에 없던 음식을 드셨군요.\n그럴 때도 있어요, 진짜로요 🍕",
      "치킨이든, 케이크든, 오늘의 선택은 오늘로 끝이에요.\n내일의 선택은 완전히 새로운 기회예요 🌅",
      "음식을 즐기는 것은 삶의 기쁨이에요. 가끔의 일탈은 오히려 지속성에 도움이 될 수 있어요 😊",
    ],
    reattributionTexts: [
      "80/20 법칙: 식단의 80%만 건강하게 유지해도 장기 목표를 충분히 달성할 수 있어요.",
      "한 번의 선택이 모든 걸 결정하지는 않아요. 몸은 평균으로 반응하니까요.",
    ],
    followUpQuestions: [
      "다음 끼니에 채소나 단백질을 조금 더 추가해볼까요?",
      "오늘의 선택을 기록해두면 나중에 패턴을 이해하는 데 도움이 될 거예요.",
    ],
    acceptButtonLabels: [
      "다음 끼니에 신경 쓸게요 🥗",
      "기록하고 넘어갈게요",
    ],
  },

  STREAK_BROKEN: {
    primaryMessages: [
      "연속 기록이 끊겼어요 😢\n하지만 지금까지 해온 노력은 절대 사라지지 않아요.",
      "스트릭이 끊겼을 때 제일 힘들죠. 그 감정은 정말 자연스러운 거예요 🤍\n지금 다시 켜준 것만으로도 정말 잘하고 있어요.",
      "완벽한 스트릭보다 '다시 시작하는 힘'이 더 값진 능력이에요.\n오늘 다시 '1일차'를 시작해봐요 🔥",
    ],
    reattributionTexts: [
      "스트릭이 끊기는 것은 포기가 아니에요. 새 스트릭을 시작할 기회예요.",
      "장기 연구에 따르면 완벽한 기록보다 중단 후 재개하는 사람이 오히려 더 장기적으로 목표를 달성해요.",
    ],
    followUpQuestions: [
      "새로운 스트릭, 오늘부터 다시 시작할까요?",
      "이번엔 좀 더 현실적인 목표로 시작해봐요. 하루 1번만 기록하는 것도 훌륭해요.",
    ],
    acceptButtonLabels: [
      "새 스트릭 시작! 🔥",
      "오늘부터 다시 1일차",
    ],
  },

  GOAL_MISSED: {
    primaryMessages: [
      "이번 주 목표에 미치지 못했군요.\n하지만 목표가 있었다는 것 자체가 이미 대단한 거예요 🌱",
      "목표를 100% 달성하지 못한 주라도, 했던 노력은 몸에 쌓여있어요.\n보이지 않는 진전이 분명히 있어요 💪",
      "목표 미달은 목표가 너무 높았거나, 그 주 상황이 어려웠던 거예요.\n나쁜 사람이어서가 아니에요 🤍",
    ],
    reattributionTexts: [
      "목표 달성률 70%도 아무것도 안 한 것보다 압도적으로 나아요. 수치가 아닌 방향을 보세요.",
      "목표는 나침반이지 감옥이 아니에요. 방향만 맞다면 속도는 달라도 괜찮아요.",
    ],
    followUpQuestions: [
      "다음 주 목표를 조금 조정해볼까요? 작게 시작해서 성공 경험을 쌓는 게 중요해요.",
      "이번 주 잘 된 것 한 가지만 떠올려볼까요?",
    ],
    acceptButtonLabels: [
      "다음 주 목표 설정하기 🎯",
      "잘된 것 먼저 기록할게요",
    ],
  },

  BINGE_EATING: {
    primaryMessages: [
      "힘든 시간이었을 것 같아요 🤍\n지금 이 순간, 판단 없이 그냥 여기 있을게요.",
      "폭식은 의지력의 문제가 아니에요. 몸과 마음이 무언가를 원하고 있다는 신호예요.\n지금 어떤 감정이 드나요?",
    ],
    reattributionTexts: [
      "폭식은 감정적 고통에 대한 몸의 반응이에요. 자신을 비난하기보다 어떤 감정이 이를 유발했는지 살펴보는 것이 더 도움이 돼요.",
      "전문가의 도움을 받는 것은 매우 용기 있는 선택이에요. 이건 혼자 해결해야 하는 문제가 아니에요.",
    ],
    followUpQuestions: [
      "지금 가장 필요한 것이 무엇인지 잠깐 생각해볼 수 있을까요?",
    ],
    acceptButtonLabels: [
      "괜찮아, 천천히 나아갈게요",
    ],
  },
};

// ── 마이크로 액션 풀 ──────────────────────────────────────────────────────────

const MICRO_ACTIONS: Record<string, MicroAction[]> = {
  PHYSICAL: [
    { icon: '🚶', text: '5분 산책하기', durationMinutes: 5 },
    { icon: '💧', text: '물 한 잔 마시기', durationMinutes: 1 },
    { icon: '🧘', text: '복식호흡 3회 하기', durationMinutes: 2 },
    { icon: '🏃', text: '계단 한 층 올라가기', durationMinutes: 2 },
  ],
  LOGGING: [
    { icon: '📝', text: '기억나는 음식 하나만 기록하기', durationMinutes: 1 },
    { icon: '📷', text: '다음 식사 사진 찍기', durationMinutes: 1 },
    { icon: '💬', text: '오늘 기분 한 줄 적기', durationMinutes: 2 },
  ],
  PLANNING: [
    { icon: '🥗', text: '내일 아침 메뉴 미리 생각해두기', durationMinutes: 2 },
    { icon: '🛒', text: '건강 간식 한 가지 주문하기', durationMinutes: 3 },
    { icon: '⏰', text: '내일 식사 알림 설정하기', durationMinutes: 1 },
  ],
};

// ── 유틸 함수 ─────────────────────────────────────────────────────────────────

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function selectMicroActions(
  failureType: FailureType,
  context: UserBehaviorContext,
  count = 3
): MicroAction[] {
  const pools: MicroAction[] = [];

  // 과식/폭식 시 신체 회복 행동 우선
  if (['OVEREATING', 'BINGE_EATING'].includes(failureType)) {
    pools.push(...MICRO_ACTIONS.PHYSICAL);
  }

  // 기록 누락 시 기록 행동 우선
  if (['MISSED_LOG', 'SKIPPED_MEAL'].includes(failureType)) {
    pools.push(...MICRO_ACTIONS.LOGGING);
  }

  // 목표 미달/스트릭 종료 시 계획 행동 우선
  if (['GOAL_MISSED', 'STREAK_BROKEN'].includes(failureType)) {
    pools.push(...MICRO_ACTIONS.PLANNING);
  }

  // 나머지 채우기
  pools.push(...MICRO_ACTIONS.PHYSICAL, ...MICRO_ACTIONS.LOGGING);

  // 중복 제거 후 랜덤 선택
  const unique = pools.filter(
    (item, idx, self) => self.findIndex(i => i.text === item.text) === idx
  );

  return unique
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
}

/**
 * 맥락에 따라 메시지 어조를 조정하는 함수
 * - 이전 복구 횟수가 많으면 좀 더 실용적인 메시지로
 * - 밤이면 격려 강도를 높임
 * - 주말이면 더 가벼운 어조로
 */
function applyContextModifier(
  message: string,
  context: UserBehaviorContext
): string {
  let modified = message;

  // 야간: 더 따뜻한 마무리
  if (context.timeOfDay === 'night') {
    modified += '\n오늘 하루도 정말 수고했어요 🌙';
  }

  // 주말: 가벼운 격려
  if (context.isWeekend) {
    modified = modified.replace(
      /다음 끼니|내일/g,
      match => `${match} (주말이니까 너무 엄격하지 않아도 돼요!)`
    );
  }

  return modified;
}

// ── 심각도 계산 ───────────────────────────────────────────────────────────────

function calculateSeverity(
  context: UserBehaviorContext
): 'low' | 'medium' | 'high' {
  if (context.failureType === 'BINGE_EATING') return 'high';

  const weeklyRate = context.weeklyGoalCompletionRate;
  const streakBroken = context.failureType === 'STREAK_BROKEN' && context.longestStreakDays >= 7;

  if (weeklyRate < 0.3 || streakBroken) return 'high';
  if (weeklyRate < 0.6 || context.previousRecoveryCount >= 3) return 'medium';
  return 'low';
}

// ── 메인 엔진 클래스 ──────────────────────────────────────────────────────────

export class RecoveryMessageEngine {

  /**
   * 사용자 맥락을 기반으로 정서적 복구 메시지를 생성
   *
   * 생성 우선순위:
   *   1. 폭식(BINGE_EATING) → LLM 동적 생성 (더 민감한 대응 필요)
   *   2. 심각도 'high' + 3회 이상 반복 복구 → LLM 동적 생성
   *   3. 일반 케이스 → 정적 템플릿 + 맥락 수정자 적용
   */
  async generateRecoveryMessage(
    context: UserBehaviorContext
  ): Promise<RecoveryMessage> {

    const severity = calculateSeverity(context);
    const template = MESSAGE_TEMPLATES[context.failureType];

    // ── LLM 동적 생성 조건 ─────────────────────────────────────────────────
    const needsDynamicGeneration =
      context.failureType === 'BINGE_EATING' ||
      (severity === 'high' && context.previousRecoveryCount >= 3);

    if (needsDynamicGeneration) {
      try {
        return await this.generateWithLLM(context, severity);
      } catch (err) {
        console.warn('[RecoveryMessageEngine] LLM 생성 실패, 정적 메시지로 폴백:', err);
        // 폴백: 정적 메시지 사용
      }
    }

    // ── 정적 템플릿 기반 생성 ─────────────────────────────────────────────
    const rawPrimaryMessage = pickRandom(template.primaryMessages);
    const primaryMessage = applyContextModifier(rawPrimaryMessage, context);

    return {
      id: uuidv4(),
      failureType: context.failureType,
      severity,
      primaryMessage,
      reattributionText: pickRandom(template.reattributionTexts),
      microActions: selectMicroActions(context.failureType, context),
      followUpQuestion: pickRandom(template.followUpQuestions),
      acceptButtonLabel: pickRandom(template.acceptButtonLabels),
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * LLM 기반 동적 메시지 생성 (민감한 케이스 전용)
   */
  private async generateWithLLM(
    context: UserBehaviorContext,
    severity: 'low' | 'medium' | 'high'
  ): Promise<RecoveryMessage> {

    const prompt = this.buildLLMPrompt(context, severity);

    const llmResponse = await llmCoachingService.generate({
      prompt,
      maxTokens: 300,
      temperature: 0.7, // 너무 결정론적이지 않게, 매번 조금씩 다른 어조
      systemInstruction: `
        당신은 인지행동치료(CBT) 전문 코치입니다.
        사용자의 식단 실패에 대해 공감하고 격려하는 메시지를 생성하세요.
        절대 비난하지 말고, 수치심을 유발하는 표현을 사용하지 마세요.
        응답은 반드시 JSON 형식으로 반환하세요.
      `,
    });

    let parsed: Record<string, string>;
    try {
      parsed = JSON.parse(llmResponse.text);
    } catch {
      throw new Error('[RecoveryMessageEngine] LLM 응답이 유효한 JSON이 아닙니다.');
    }

    return {
      id: uuidv4(),
      failureType: context.failureType,
      severity,
      primaryMessage: parsed.primaryMessage,
      reattributionText: parsed.reattributionText,
      microActions: selectMicroActions(context.failureType, context),
      followUpQuestion: parsed.followUpQuestion,
      acceptButtonLabel: parsed.acceptButtonLabel ?? '괜찮아요, 계속할게요 💪',
      generatedAt: new Date().toISOString(),
      llmModel: llmResponse.model,
    };
  }

  private buildLLMPrompt(
    context: UserBehaviorContext,
    severity: 'low' | 'medium' | 'high'
  ): string {
    const overeatingInfo = context.overeatingAmount
      ? `과식량: 약 ${context.overeatingAmount}kcal, `
      : '';

    return `
사용자 상황:
- 실패 유형: ${context.failureType}
- 심각도: ${severity}
- ${overeatingInfo}현재 시간대: ${context.timeOfDay}
- 최근 7일 기록 횟수: ${context.recentLogCount7Days}회
- 현재 스트릭: ${context.currentStreakDays}일
- 이번 주 복구 시도: ${context.previousRecoveryCount}회
- 주말 여부: ${context.isWeekend ? '예' : '아니오'}

위 상황에 맞는 CBT 기반 정서적 복구 메시지를 JSON으로 생성하세요:
{
  "primaryMessage": "...(공감 위주, 2~3줄)",
  "reattributionText": "...(다른 시각으로 재해석, 1~2줄)",
  "followUpQuestion": "...(다음 행동을 유도하는 질문)",
  "acceptButtonLabel": "...(버튼 텍스트, 10자 이내)"
}
    `.trim();
  }

  /**
   * 빠른 응원 메시지 생성 (실시간 피드백용 경량 버전)
   */
  generateQuickEncouragement(successType: string): string {
    const messages: Record<string, string[]> = {
      MEAL_LOGGED: [
        "기록 완료! 이 작은 습관이 쌓여서 큰 변화를 만들어요 ✨",
        "훌륭해요! 오늘도 한 걸음 나아갔어요 🌱",
        "기록했군요! 이게 진짜 다이어트의 핵심이에요 💪",
      ],
      STREAK_MAINTAINED: [
        "연속 기록 중! 이 흐름을 타고 계속 가봐요 🔥",
        "와, 매일 기록하고 계시네요! 정말 대단해요 ⭐",
      ],
      HEALTHY_CHOICE: [
        "건강한 선택을 하셨네요! 몸이 고마워할 거예요 🥗",
        "좋은 음식으로 하루를 채우셨군요 💚",
      ],
    };

    const pool = messages[successType] ?? ["잘하고 있어요! 계속 응원해요 🌟"];
    return pickRandom(pool);
  }
}

// ── 싱글톤 인스턴스 익스포트 ──────────────────────────────────────────────────
export const recoveryMessageEngine = new RecoveryMessageEngine();
