const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const REGION_INFO = {
  도쿄: { transport: 'IC카드(Suica/Pasmo)', avgTransportDay: 1200 },
  오사카: { transport: 'IC카드(ICOCA)/오사카 주유패스', avgTransportDay: 900 },
  교토: { transport: '버스 1일권/IC카드', avgTransportDay: 700 },
  나고야: { transport: 'IC카드(manaca)', avgTransportDay: 800 },
  삿포로: { transport: '지하철 1일권', avgTransportDay: 800 },
  후쿠오카: { transport: 'IC카드(SUGOCA)/후쿠오카 투어리스트 패스', avgTransportDay: 700 },
  나라: { transport: '버스/도보', avgTransportDay: 500 },
  하코네: { transport: '하코네 프리패스', avgTransportDay: 4000 },
  히로시마: { transport: '1일 전차패스', avgTransportDay: 700 },
  오키나와: { transport: '렌터카/모노레일', avgTransportDay: 3000 },
};

function buildPrompt(params) {
  const { travelers, arrivalDate, departureDate, region, hotels, activities, maxMealBudget } = params;
  const totalPeople = (travelers.adults || 0) + (travelers.children || 0);
  const arrival = new Date(arrivalDate);
  const departure = new Date(departureDate);
  const nights = Math.ceil((departure - arrival) / (1000 * 60 * 60 * 24));
  const days = nights + 1;

  const hotelInfo = hotels && hotels.length > 0
    ? hotels.map(h => `- ${h.day}일차: ${h.name}`).join('\n')
    : '호텔 정보 없음 (지역 내 이동 최적화)';

  const activityInfo = activities && activities.length > 0
    ? activities.join(', ')
    : '없음';

  const mealBudgetInfo = maxMealBudget
    ? `1인당 한 끼 최대 ${maxMealBudget.toLocaleString()}엔 이하, Google 평점 4.2 이상 식당만 추천`
    : '식사 예산 제한 없음';

  return `당신은 일본 여행 전문 플래너입니다. 아래 조건에 맞는 상세 여행 일정과 예산을 JSON 형식으로 작성해주세요.

## 여행 정보
- 지역: ${region}
- 인원: 성인 ${travelers.adults}명, 어린이 ${travelers.children || 0}명 (총 ${totalPeople}명)
- 입국: ${arrival.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
- 출국: ${departure.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
- 총 일정: ${nights}박 ${days}일
- 숙박 정보:\n${hotelInfo}
- 필수 액티비티: ${activityInfo}
- 식사 조건: ${mealBudgetInfo}

## 응답 형식 (반드시 유효한 JSON만 출력)
{
  "summary": {
    "region": "${region}",
    "nights": ${nights},
    "days": ${days},
    "totalPeople": ${totalPeople},
    "adults": ${travelers.adults},
    "children": ${travelers.children || 0}
  },
  "dailyPlans": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "dayOfWeek": "월요일",
      "hotel": "숙박 호텔명 또는 null",
      "theme": "이날의 여행 테마",
      "schedule": [
        {
          "time": "09:00",
          "type": "관광|식사|교통|액티비티|숙박",
          "title": "장소/활동명",
          "description": "상세 설명 (2-3문장)",
          "location": "구체적 위소명",
          "duration": "소요시간 (예: 1시간 30분)",
          "cost": {
            "perPerson": 0,
            "total": 0,
            "note": "비용 메모"
          },
          "rating": 4.5,
          "tips": "현지 팁"
        }
      ],
      "daySummary": {
        "transportCost": 0,
        "mealCost": 0,
        "activityCost": 0,
        "totalCost": 0
      }
    }
  ],
  "budget": {
    "transport": {
      "total": 0,
      "perPerson": 0,
      "breakdown": "교통비 내역 설명"
    },
    "meals": {
      "total": 0,
      "perPerson": 0,
      "perMeal": 0,
      "breakdown": "식비 내역 설명"
    },
    "activities": {
      "total": 0,
      "perPerson": 0,
      "items": [
        { "name": "액티비티명", "costPerPerson": 0, "totalCost": 0 }
      ]
    },
    "accommodation": {
      "total": 0,
      "perNight": 0,
      "breakdown": "숙박비 내역 설명"
    },
    "grandTotal": {
      "total": 0,
      "perPerson": 0,
      "note": "총 예산 메모"
    }
  },
  "travelTips": [
    "여행 팁 1",
    "여행 팁 2",
    "여행 팁 3"
  ],
  "transportInfo": {
    "recommended": "추천 교통 수단",
    "passes": ["패스 1", "패스 2"],
    "tips": "교통 팁"
  }
}

모든 비용은 일본 엔(JPY) 기준입니다. 어린이 요금은 성인의 50~70% 수준으로 계산하세요.
식당 추천 시 ${maxMealBudget ? `1인 ${maxMealBudget}엔 이하, Google 평점 4.2 이상` : '현지 인기 맛집'}을 기준으로 해주세요.
반드시 유효한 JSON만 출력하고 다른 텍스트는 포함하지 마세요.`;
}

async function generateItinerary(params, onChunk, onDone, onError) {
  try {
    let fullContent = '';

    const stream = await client.messages.stream({
      model: 'claude-opus-4-5',
      max_tokens: 8000,
      messages: [{ role: 'user', content: buildPrompt(params) }],
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        fullContent += event.delta.text;
        onChunk(event.delta.text);
      }
    }

    // Parse final JSON
    try {
      const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('JSON을 파싱할 수 없습니다.');
      const parsed = JSON.parse(jsonMatch[0]);
      onDone(parsed);
    } catch (parseError) {
      onError(new Error('일정 데이터 파싱 오류: ' + parseError.message));
    }
  } catch (error) {
    onError(error);
  }
}

module.exports = { generateItinerary };
