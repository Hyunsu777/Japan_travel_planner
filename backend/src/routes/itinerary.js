const express = require('express');
const router = express.Router();
const itineraryService = require('../services/itineraryService');

// POST /api/itinerary/generate
router.post('/generate', async (req, res) => {
  try {
    const {
      travelers,        // { adults: number, children: number }
      arrivalDate,      // ISO string
      departureDate,    // ISO string
      region,           // string (e.g. "도쿄", "오사카")
      hotels,           // [{ day: number, name: string }] optional
      activities,       // string[] optional
      maxMealBudget,    // number optional (JPY per person per meal)
    } = req.body;

    // Validation
    if (!travelers || !arrivalDate || !departureDate || !region) {
      return res.status(400).json({
        error: '필수 값이 누락되었습니다: 인원수, 입국일시, 출국일시, 지역',
      });
    }

    if (travelers.adults < 1) {
      return res.status(400).json({ error: '성인 인원수는 1명 이상이어야 합니다.' });
    }

    const arrivalDt = new Date(arrivalDate);
    const departureDt = new Date(departureDate);
    if (departureDt <= arrivalDt) {
      return res.status(400).json({ error: '출국일은 입국일보다 이후여야 합니다.' });
    }

    // Stream response using SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    await itineraryService.generateItinerary(
      { travelers, arrivalDate, departureDate, region, hotels, activities, maxMealBudget },
      (chunk) => {
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
      },
      (result) => {
        res.write(`data: ${JSON.stringify({ type: 'done', data: result })}\n\n`);
        res.end();
      },
      (error) => {
        res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
        res.end();
      }
    );
  } catch (error) {
    console.error('Route error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: '일정 생성 중 오류가 발생했습니다.' });
    }
  }
});

module.exports = router;
