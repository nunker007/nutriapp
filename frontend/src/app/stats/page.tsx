'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loadUser, loadWeekLogs, loadStreak, DayLog } from '../../lib/userStore';

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

function getWeekDayLabels(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return DAY_LABELS[d.getDay() === 0 ? 6 : d.getDay() - 1];
  });
}

interface BarChartProps {
  logs: DayLog[];
  target: number;
  dayLabels: string[];
}

function BarChart({ logs, target, dayLabels }: BarChartProps) {
  const maxVal = Math.max(target * 1.2, ...logs.map(l => l.calories), 1);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.4rem', height: 140, padding: '0 0.25rem' }}>
      {logs.map((log, i) => {
        const pct = (log.calories / maxVal) * 100;
        const targetPct = (target / maxVal) * 100;
        const isToday = i === 6;
        const color = log.calories === 0 ? 'var(--border)'
          : log.calories > target * 1.1 ? 'var(--orange)'
          : 'var(--green)';

        return (
          <div key={log.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ fontSize: '0.65rem', height: 16,
                           fontWeight: log.calories > 0 ? 700 : 400,
                           color: log.calories > 0 ? 'var(--text)' : 'var(--text-sub)' }}>
              {log.calories > 0 ? log.calories : ''}
            </span>
            <div style={{ width: '100%', position: 'relative', height: 100 }}>
              {/* 목표선 */}
              <div style={{
                position: 'absolute', bottom: `${targetPct}%`, left: 0, right: 0,
                borderTop: '1.5px dashed var(--orange)', opacity: 0.6, zIndex: 1,
              }} />
              {/* 막대 */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: `${Math.max(pct, log.calories > 0 ? 4 : 0)}%`,
                background: color, borderRadius: '4px 4px 0 0',
                transition: 'height 0.4s ease',
                opacity: isToday ? 1 : 0.75,
                outline: isToday ? `2px solid var(--green)` : 'none',
                outlineOffset: 2,
              }} />
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: isToday ? 700 : 400,
                           color: isToday ? 'var(--green)' : 'var(--text-sub)' }}>
              {dayLabels[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function StatsPage() {
  const router = useRouter();
  const [target, setTarget]   = useState(2000);
  const [logs, setLogs]       = useState<DayLog[]>([]);
  const [streak, setStreak]   = useState({ current: 0, longest: 0 });
  const dayLabels = getWeekDayLabels();

  useEffect(() => {
    const user = loadUser();
    if (!user) { router.replace('/onboarding'); return; }
    setTarget(user.target);
    setLogs(loadWeekLogs());
    setStreak(loadStreak());
  }, [router]);

  const loggedDays   = logs.filter(l => l.calories > 0).length;
  const avgCalories  = loggedDays > 0
    ? Math.round(logs.filter(l => l.calories > 0).reduce((s, l) => s + l.calories, 0) / loggedDays)
    : 0;
  const weekTotal    = logs.reduce((s, l) => s + l.calories, 0);
  const goalDays     = logs.filter(l => l.calories > 0 && l.calories <= target * 1.1).length;
  const goalRate     = loggedDays > 0 ? Math.round((goalDays / loggedDays) * 100) : 0;

  const avgProtein = loggedDays > 0
    ? Math.round(logs.filter(l => l.calories > 0).reduce((s, l) => s + l.protein, 0) / loggedDays)
    : 0;
  const avgCarbs = loggedDays > 0
    ? Math.round(logs.filter(l => l.calories > 0).reduce((s, l) => s + l.carbs, 0) / loggedDays)
    : 0;
  const avgFat = loggedDays > 0
    ? Math.round(logs.filter(l => l.calories > 0).reduce((s, l) => s + l.fat, 0) / loggedDays)
    : 0;

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 1rem 6rem', minHeight: '100vh', background: 'var(--bg)' }}>

      <header className="dashboard-header">
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700 }}>주간 통계 📊</h1>
        <div style={{ width: 32 }} />
      </header>

      {/* 스트릭 카드 */}
      <div className="streak-tracker" style={{ marginTop: '1rem' }}>
        <div className="streak-tracker__current">
          <span className="streak-tracker__flame">🔥</span>
          <span className="streak-tracker__days">{streak.current}</span>
          <span className="streak-tracker__label">일 연속 기록</span>
        </div>
        <span className="streak-tracker__best">최장 {streak.longest}일</span>
      </div>

      {/* 주간 요약 카드 */}
      <div style={{ marginTop: '1rem' }}>
        <p className="section-title">이번 주 요약</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {[
            { label: '기록한 날', value: `${loggedDays}일`, sub: '/ 7일', color: 'var(--green)' },
            { label: '목표 달성율', value: `${goalRate}%`, sub: `${goalDays}일 달성`, color: goalRate >= 70 ? 'var(--green)' : 'var(--orange)' },
            { label: '일평균 칼로리', value: avgCalories > 0 ? `${avgCalories}` : '-', sub: 'kcal', color: 'var(--text)' },
            { label: '주간 총 칼로리', value: weekTotal > 0 ? `${weekTotal.toLocaleString()}` : '-', sub: 'kcal', color: 'var(--text)' },
          ].map(stat => (
            <div key={stat.label} className="card" style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginBottom: '0.4rem' }}>{stat.label}</p>
              <p style={{ fontSize: '1.6rem', fontWeight: 800, color: stat.color }}>{stat.value}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 주간 칼로리 차트 */}
      <div style={{ marginTop: '1rem' }}>
        <p className="section-title">
          7일 칼로리
          <span style={{ float: 'right', fontSize: '0.7rem', color: 'var(--orange)' }}>── 목표 {target} kcal</span>
        </p>
        <div className="card">
          {loggedDays === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-sub)' }}>
              <p style={{ fontSize: '2rem' }}>📭</p>
              <p style={{ marginTop: '0.5rem' }}>아직 기록이 없어요</p>
              <Link href="/log" style={{ color: 'var(--green)', fontWeight: 700, textDecoration: 'none' }}>
                첫 식사를 기록해보세요 →
              </Link>
            </div>
          ) : (
            <BarChart logs={logs} target={target} dayLabels={dayLabels} />
          )}
        </div>
      </div>

      {/* 평균 영양소 */}
      {loggedDays > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <p className="section-title">일평균 영양소</p>
          <div className="card">
            {[
              { label: '단백질', value: avgProtein, unit: 'g', color: 'var(--blue)',   pct: Math.round((avgProtein * 4 / (avgCalories || 1)) * 100) },
              { label: '탄수화물', value: avgCarbs, unit: 'g', color: 'var(--orange)', pct: Math.round((avgCarbs * 4 / (avgCalories || 1)) * 100) },
              { label: '지방', value: avgFat, unit: 'g', color: 'var(--purple)',        pct: Math.round((avgFat * 9 / (avgCalories || 1)) * 100) },
            ].map(n => (
              <div key={n.label} style={{ marginBottom: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{n.label}</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-sub)' }}>
                    {n.value}{n.unit} <span style={{ color: n.color }}>({n.pct}%)</span>
                  </span>
                </div>
                <div style={{ background: 'var(--border)', borderRadius: 99, height: 8 }}>
                  <div style={{ width: `${Math.min(100, n.pct)}%`, height: '100%',
                                background: n.color, borderRadius: 99, transition: 'width 0.4s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 일별 상세 */}
      {loggedDays > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <p className="section-title">일별 상세</p>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {[...logs].reverse().filter(l => l.calories > 0).map((log, idx) => {
              const dayLabel = dayLabels[logs.indexOf(log)];
              const diff = log.calories - target;
              return (
                <div key={log.date} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.75rem 1rem', borderTop: idx > 0 ? '1px solid var(--border)' : 'none',
                }}>
                  <div>
                    <span style={{ fontWeight: 700, marginRight: '0.5rem' }}>{dayLabel}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>{log.date.slice(5)}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 700 }}>{log.calories.toLocaleString()} kcal</span>
                    <span style={{ display: 'block', fontSize: '0.75rem',
                                   color: diff > 0 ? 'var(--orange)' : 'var(--green)' }}>
                      {diff > 0 ? `+${diff}` : diff} kcal
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 바텀 네비게이션 */}
      <nav className="bottom-nav">
        <Link href="/dashboard"><span className="nav-icon">🏠</span>홈</Link>
        <Link href="/meal-planner"><span className="nav-icon">📅</span>식단</Link>
        <Link href="/log"><span className="nav-icon">➕</span>기록</Link>
        <Link href="/stats" className="active"><span className="nav-icon">📊</span>통계</Link>
        <Link href="/profile"><span className="nav-icon">👤</span>프로필</Link>
      </nav>
    </div>
  );
}
