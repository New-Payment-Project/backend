const Course = require('../models/courseModel');

const getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createCourse = async (req, res) => {
  const { title, description, price, route, prefix } = req.body;

  const course = new Course({
    title,
    description,
    price,
    route,
    prefix
  });

  try {
    const newCourse = await course.save();
    res.status(201).json(newCourse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);

    if (!deletedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ message: 'Course deleted successfully', deletedCourse });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateCourse = async (req, res) => {
  const { title, description, price, route, prefix } = req.body;

  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { title, description, price, route, prefix },
      { new: true, runValidators: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(updatedCourse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const patchCourse = async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(updatedCourse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { getCourses, createCourse, deleteCourse, updateCourse, patchCourse };
