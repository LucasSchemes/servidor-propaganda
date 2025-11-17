const express = require('express');
const router = express.Router();
const {
    createSlide,
    getAllSlides,
    updateSlide,
    deleteSlide,
    connectTotem
} = require('../controllers/slideController'); 

router.route('/slides')
    .post(createSlide)
    .get(getAllSlides); 


router.route('/slides/:id')
    .put(updateSlide)    
    .delete(deleteSlide); 

router.get('/events', connectTotem);

module.exports = router;