const express = require('express');
const router = express.Router();
const {
    createSlide,
    getAllSlides,
    updateSlide,
    deleteSlide,
    connectTotem
} = require('../controllers/slideController'); 

// Rota principal da API Administrativa (/api/slides)
router.route('/slides')
    .post(createSlide) // POST /api/slides
    .get(getAllSlides); // GET /api/slides

// Rota para um slide específico (/api/slides/:id)
router.route('/slides/:id')
    .put(updateSlide)    // PUT /api/slides/:id
    .delete(deleteSlide); // DELETE /api/slides/:id

// Rota de conexão do Totem (/api/events)
router.get('/events', connectTotem);

module.exports = router;