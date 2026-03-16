import React, { useState } from 'react';
import { Plus, X, Hotel, Zap, Utensils, Users, Calendar, MapPin } from 'lucide-react';

const REGIONS = [
  { name: '도쿄', kanji: '東京' },
  { name: '오사카', kanji: '大阪' },
  { name: '교토', kanji: '京都' },
  { name: '나고야', kanji: '名古屋' },
  { name: '삿포로', kanji: '札幌' },
  { name: '후쿠오카', kanji: '福岡' },
  { name: '나라', kanji: '奈良' },
  { name: '하코네', kanji: '箱根' },
  { name: '히로시마', kanji: '広島' },
  { name: '오키나와', kanji: '沖縄' },
];

function TravelForm({ onSubmit }) {
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [region, setRegion] = useState('');
  const [hotels, setHotels] = useState([]);
  const [activities, setActivities] = useState(['']);
  const [maxMealBudget, setMaxMealBudget] = useState('');
  const [loading, setLoading] = useState(false);

  // Calculate nights when dates change
  const getNights = () => {
    if (!arrivalDate || !departureDate) return 0;
    const diff = new Date(departureDate) - new Date(arrivalDate);
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };
  const nights = getNights();

  const addHotel = () => {
    const nextDay = hotels.length + 1;
    if (nextDay <= nights) {
      setHotels([...hotels, { day: nextDay, name: '' }]);
    }
  };

  const removeHotel = (index) => {
    setHotels(hotels.filter((_, i) => i !== index));
  };

  const updateHotel = (index, field, value) => {
    const updated = [...hotels];
    updated[index] = { ...updated[index], [field]: value };
    setHotels(updated);
  };

  const addActivity = () => setActivities([...activities, '']);
  const removeActivity = (i) => setActivities(activities.filter((_, idx) => idx !== i));
  const updateActivity = (i, val) => {
    const updated = [...activities];
    updated[i] = val;
    setActivities(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!region) return alert('지역을 선택해주세요.');
    if (!arrivalDate || !departureDate) return alert('입국일시와 출국일시를 입력해주세요.');
    if (nights <= 0) return alert('출국일은 입국일보다 이후여야 합니다.');

    setLoading(true);
    const filteredActivities = activities.filter(a => a.trim());
    const filledHotels = hotels.filter(h => h.name.trim());

    onSubmit({
      travelers: { adults: Number(adults), children: Number(children) },
      arrivalDate,
      departureDate,
      region,
      hotels: filledHotels.length > 0 ? filledHotels : undefined,
      activities: filteredActivities.length > 0 ? filteredActivities : undefined,
      maxMealBudget: maxMealBudget ? Number(maxMealBudget) : undefined,
    });
  };

  const today = new Date().toISOString().slice(0, 16);

  return (
    <div className="travel-form-page">
      <div className="form-hero">
        <span className="form-hero-badge">✦ AI 여행 플래너 ✦</span>
        <h1>맞춤형 <span>일본 여행</span> 일정을<br />AI가 만들어드립니다</h1>
        <p>Claude AI가 여행 조건에 맞는 최적의 일정과 예산을 생성합니다</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* 필수 정보 */}
        <div className="form-card">
          <div className="form-section-title">
            <span className="section-icon"><Users size={16} /></span>
            기본 여행 정보
            <span className="required-badge">필수</span>
          </div>

          <div className="form-grid cols-3" style={{ marginBottom: 24 }}>
            <div className="form-group">
              <label>성인 인원수 <span className="req">*</span></label>
              <input type="number" min="1" max="20" value={adults} onChange={e => setAdults(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>어린이 인원수</label>
              <input type="number" min="0" max="20" value={children} onChange={e => setChildren(e.target.value)} />
            </div>
            <div className="form-group">
              <label>총 인원</label>
              <input type="text" value={`${Number(adults) + Number(children)}명 (성인 ${adults}, 어린이 ${children})`} readOnly style={{ background: 'var(--paper-dark)', cursor: 'default' }} />
            </div>
          </div>

          <div className="form-grid" style={{ marginBottom: 24 }}>
            <div className="form-group">
              <label>입국 일시 <span className="req">*</span></label>
              <input type="datetime-local" value={arrivalDate} min={today} onChange={e => setArrivalDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>출국 일시 <span className="req">*</span></label>
              <input type="datetime-local" value={departureDate} min={arrivalDate || today} onChange={e => setDepartureDate(e.target.value)} required />
            </div>
          </div>

          {nights > 0 && (
            <div style={{ background: 'var(--paper-dark)', borderRadius: 'var(--radius)', padding: '12px 16px', fontSize: '13px', color: 'var(--gray-700)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={14} />
              <strong>{nights}박 {nights + 1}일</strong> 여행 일정이 생성됩니다
            </div>
          )}

          <div className="form-section-title" style={{ marginTop: 8 }}>
            <span className="section-icon"><MapPin size={16} /></span>
            여행 지역 선택
            <span className="required-badge">필수</span>
          </div>

          <div className="region-grid">
            {REGIONS.map(r => (
              <button
                key={r.name}
                type="button"
                className={`region-btn ${region === r.name ? 'active' : ''}`}
                onClick={() => setRegion(r.name)}
              >
                <span className="region-kanji">{r.kanji}</span>
                <span className="region-name">{r.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 선택 정보 */}
        <div className="form-card">
          <div className="form-section-title">
            <span className="section-icon"><Hotel size={16} /></span>
            체류일별 호텔
            <span className="optional-badge">선택</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 16 }}>
            호텔 위치에 따라 일정 동선을 최적화합니다. 입력하지 않으면 지역 전체를 기준으로 생성됩니다.
          </p>
          <div className="hotel-days-list">
            {hotels.map((hotel, i) => (
              <div key={i} className="hotel-day-row">
                <span className="hotel-day-label">{hotel.day}일차 숙박</span>
                <input
                  type="text"
                  placeholder="호텔명 입력 (예: 도쿄 신주쿠 힐튼)"
                  value={hotel.name}
                  onChange={e => updateHotel(i, 'name', e.target.value)}
                />
                <button type="button" className="btn-remove-hotel" onClick={() => removeHotel(i)}>
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          {nights > hotels.length && (
            <button type="button" className="btn-add-hotel" onClick={addHotel}>
              <Plus size={14} /> {hotels.length + 1}일차 호텔 추가
            </button>
          )}
        </div>

        <div className="form-card">
          <div className="form-section-title">
            <span className="section-icon"><Zap size={16} /></span>
            필수 액티비티
            <span className="optional-badge">선택</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 16 }}>
            반드시 포함되어야 할 액티비티를 입력해주세요. 일정에 우선 배치됩니다.
          </p>
          <div className="activities-list">
            {activities.map((act, i) => (
              <div key={i} className="activity-item">
                <input
                  type="text"
                  placeholder={`액티비티 ${i + 1} (예: 후지산 등반, 유니버설 스튜디오)`}
                  value={act}
                  onChange={e => updateActivity(i, e.target.value)}
                />
                {activities.length > 1 && (
                  <button type="button" className="btn-remove" onClick={() => removeActivity(i)}>
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" className="btn-add" onClick={addActivity}>
            <Plus size={14} /> 액티비티 추가
          </button>
        </div>

        <div className="form-card">
          <div className="form-section-title">
            <span className="section-icon"><Utensils size={16} /></span>
            식사 예산 설정
            <span className="optional-badge">선택</span>
          </div>
          <div className="form-group">
            <label>1인당 한 끼 최대 예산 (엔/JPY)</label>
            <input
              type="number"
              min="500"
              max="50000"
              step="500"
              value={maxMealBudget}
              onChange={e => setMaxMealBudget(e.target.value)}
              placeholder="예: 3000 (입력 시 Google 평점 4.2 이상 식당만 추천)"
            />
          </div>
          {maxMealBudget && (
            <div style={{ background: 'var(--paper-dark)', borderRadius: 'var(--radius)', padding: '10px 14px', fontSize: '12px', color: 'var(--gray-700)', marginTop: 10 }}>
              ✓ {Number(maxMealBudget).toLocaleString()}엔 이하 + Google 평점 4.2 이상 식당만 추천됩니다
            </div>
          )}
        </div>

        <div className="form-submit">
          <button type="submit" className="btn-generate" disabled={loading}>
            {loading ? '일정 생성 중...' : '✦ AI 일정 생성하기 ✦'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TravelForm;
