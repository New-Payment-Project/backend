const express = require('express');
const { getCourses, createCourse, deleteCourse, updateCourse, patchCourse } = require('../controllers/courseController');
const router = express.Router();

router.get('/', getCourses);
router.post('/', createCourse);
router.delete('/:id', deleteCourse);
router.put('/:id', updateCourse);
router.patch('/:id', patchCourse);

module.exports = router;
