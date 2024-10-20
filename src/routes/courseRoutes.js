const express = require('express');
const { getCourses, createCourse, deleteCourse, updateCourse, patchCourse } = require('../controllers/courseController');
const router = express.Router();

router.get('/courses', getCourses);
router.post('/courses', createCourse);
router.delete('/courses/:id', deleteCourse);
router.put('/courses/:id', updateCourse);
router.patch('/courses/:id', patchCourse);

module.exports = router;
