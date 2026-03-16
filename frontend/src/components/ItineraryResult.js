import React, { useState } from 'react';
import { MapPin, Hotel, Clock, DollarSign, Train, Star, Lightbulb } from 'lucide-react';

function formatJPY(amount) {
  if (!amount && amount !== 0) return '-';
  return `¥${Number(amount).toLocaleString()}`;
}

function BudgetOverview({ budget, summary }) {
  const totalPeople = summary.totalPeople || 1;
  return (
    <div className="budget-overview">
      <div className="budget-overview-title">
        <DollarSign size={18} /> 전체 예산 요약
      </div>
      <div className="budget-grid">
        <div className="budget-item">
          <div className="budget-item-icon">🚃</div>
          <div className="budget-item-label">교통비</div>
          <div className="budget-item-amount">{formatJPY(budget.transport?.total)}</div>
          <div className="budget-item-sub">1인 {formatJPY(budget.transport?.perPerson)}</div>
        </div>
        <div className="budget-item">
          <div className="budget-item-icon">🍜</div>
          <div className="budget-item-label">식비</div>
          <div className="budget-item-amount">{formatJPY(budget.meals?.total)}</div>
          <div className="budget-item-sub">1인 {formatJPY(budget.meals?.perPerson)}</div>
        </div>
        <div className="budget-item">
          <div className="budget-item-icon">🎡</div>
          <div className="budget-item-label">액티비티</div>
          <div className="budget-item-amount">{formatJPY(budget.activities?.total)}</div>
          <div className="budget-item-sub">1인 {formatJPY(budget.activities?.perPerson)}</div>
        </div>
        <div className="budget-item">
          <div className="budget-item-icon">🏨</div>
          <div className="budget-item-label">숙박비</div>
          <div className="budget-item-amount">{formatJPY(budget.accommodation?.total)}</div>
          <div className="budget-item-sub">1박 {formatJPY(budget.accommodation?.perNight)}</div>
        </div>
      </div>
      <div className="budget-total">
        <div>
          <div className="budget-total-label">총 예상 비용 ({totalPeople}명)</div>
          <div className="budget-total-per">1인 {formatJPY(budget.grandTotal?.perPerson)}</div>
        </div>
        <div className="budget-total-amount">{formatJPY(budget.grandTotal?.total)}</div>
      </div>
    </div>
  );
}

function ScheduleItem({ item }) {
  const tagClass = `schedule-type-tag tag-${item.type}`;
  return (
    <div className="schedule-item">
      <div className="schedule-time">
        <span className="time-val">{item.time}</span>
      </div>
      <div className="schedule-content">
        <span className={tagClass}>{item.type}</span>
        <div className="schedule-title">{item.title}</div>
        {item.description && <div className="schedule-desc">{item.description}</div>}
        <div className="schedule-meta">
          {item.location && <span><MapPin size={11} /> {item.location}</span>}
          {item.duration && <span><Clock size={11} /> {item.duration}</span>}
          {item.rating && <span><Star size={11} /> {item.rating}</span>}
          {item.cost?.total > 0 && (
            <span className="schedule-cost"><DollarSign size={11} /> {formatJPY(item.cost.total)} {item.cost.note ? `(${item.cost.note})` : ''}</span>
          )}
        </div>
        {item.tips && <div className="schedule-tip">💡 {item.tips}</div>}
      </div>
    </div>
  );
}

function DayPlan({ plan }) {
  return (
    <div className="day-plan-card">
      <div className="day-plan-header">
        <div className="day-plan-title">
          <div className="day-number">{plan.day}</div>
          <div>
            <h2>{plan.theme || `${plan.day}일차`}</h2>
            <div className="day-date">
              {plan.date} ({plan.dayOfWeek})
            </div>
          </div>
        </div>
        {plan.hotel && (
          <div className="day-hotel-badge">
            <Hotel size={12} /> {plan.hotel}
          </div>
        )}
      </div>

      <div className="schedule-timeline">
        {(plan.schedule || []).map((item, i) => (
          <ScheduleItem key={i} item={item} />
        ))}
      </div>

      {plan.daySummary && (
        <div className="day-summary">
          <div className="day-sum-item">
            <Train size={13} />
            <span className="day-sum-label">교통</span>
            <span className="day-sum-value">{formatJPY(plan.daySummary.transportCost)}</span>
          </div>
          <div className="day-sum-item">
            <span>🍽️</span>
            <span className="day-sum-label">식비</span>
            <span className="day-sum-value">{formatJPY(plan.daySummary.mealCost)}</span>
          </div>
          <div className="day-sum-item">
            <span>🎡</span>
            <span className="day-sum-label">액티비티</span>
            <span className="day-sum-value">{formatJPY(plan.daySummary.activityCost)}</span>
          </div>
          <div className="day-sum-item" style={{ marginLeft: 'auto', fontWeight: 700 }}>
            <span>합계</span>
            <span className="day-sum-value" style={{ color: 'var(--red)' }}>{formatJPY(plan.daySummary.totalCost)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ItineraryResult({ data, formData, onReset }) {
  const [activeDay, setActiveDay] = useState(0);
  const { summary, dailyPlans, budget, travelTips, transportInfo } = data;

  return (
    <div className="result-page">
      <div className="result-header">
        <div className="result-badge">✦ AI 생성 완료 ✦</div>
        <h1>🗾 {summary.region} {summary.nights}박 {summary.days}일 여행 일정</h1>
        <p className="result-meta">
          <strong>성인 {summary.adults}명</strong>
          {summary.children > 0 && <> + 어린이 {summary.children}명</>}
          &nbsp;· 총 {summary.totalPeople}명 기준 예산
        </p>
      </div>

      <BudgetOverview budget={budget} summary={summary} />

      {transportInfo && (
        <div className="transport-card">
          <div className="transport-title"><Train size={16} /> 추천 교통 수단</div>
          <div className="transport-passes">
            {(transportInfo.passes || []).map((p, i) => (
              <span key={i} className="pass-badge">🎫 {p}</span>
            ))}
          </div>
          {transportInfo.tips && <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>{transportInfo.tips}</p>}
        </div>
      )}

      {travelTips && travelTips.length > 0 && (
        <div className="tips-card">
          <div className="tips-title"><Lightbulb size={16} /> 여행 꿀팁</div>
          <ul className="tips-list">
            {travelTips.map((tip, i) => <li key={i}>{tip}</li>)}
          </ul>
        </div>
      )}

      <div className="daily-tabs-wrapper">
        <div className="daily-tabs">
          {dailyPlans.map((plan, i) => (
            <button
              key={i}
              className={`day-tab ${activeDay === i ? 'active' : ''}`}
              onClick={() => setActiveDay(i)}
            >
              {plan.day}일차 {plan.dayOfWeek}
            </button>
          ))}
        </div>
      </div>

      {dailyPlans[activeDay] && <DayPlan plan={dailyPlans[activeDay]} />}

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <button className="btn-generate" onClick={onReset}>
          ← 새 일정 만들기
        </button>
      </div>
    </div>
  );
}

export default ItineraryResult;
