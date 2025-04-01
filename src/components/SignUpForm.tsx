'use client';

import { useState } from 'react';

interface FormData {
  name: string;
  phone: string;
  goals: string[];
  dob: string;
  gender: string;
  experience: string;
  equipment: string[];
}

const goals = [
  'Build Muscle',
  'Lose Weight',
  'Improve Strength',
  'Increase Endurance',
  'Better Flexibility',
  'General Fitness'
];

const equipment = [
  'Dumbbells',
  'Barbell',
  'Resistance Bands',
  'Pull-up Bar',
  'Bench',
  'Kettlebells',
  'None (Bodyweight only)'
];

const experienceLevels = [
  'Beginner',
  'Intermediate',
  'Advanced'
];

export default function SignUpForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    goals: [],
    dob: '',
    gender: '',
    experience: '',
    equipment: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Here you would typically send the data to your backend
  };

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handleEquipmentToggle = (item: string) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(item)
        ? prev.equipment.filter(e => e !== item)
        : [...prev.equipment, item]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-gray-800 p-8 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
        Join GymText
      </h2>

      {/* Name */}
      <div className="mb-6">
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Name
        </label>
        <input
          type="text"
          id="name"
          required
          className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        />
      </div>

      {/* Phone */}
      <div className="mb-6">
        <label htmlFor="phone" className="block text-sm font-medium mb-2">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          required
          className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
        />
      </div>

      {/* Goals */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Fitness Goals (Select all that apply)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {goals.map((goal) => (
            <label
              key={goal}
              className={`flex items-center p-3 rounded cursor-pointer transition
                ${formData.goals.includes(goal)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={formData.goals.includes(goal)}
                onChange={() => handleGoalToggle(goal)}
              />
              <span>{goal}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Date of Birth */}
      <div className="mb-6">
        <label htmlFor="dob" className="block text-sm font-medium mb-2">
          Date of Birth
        </label>
        <input
          type="date"
          id="dob"
          required
          className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
          value={formData.dob}
          onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
        />
      </div>

      {/* Gender */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Gender
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['Male', 'Female', 'Other'].map((gender) => (
            <label
              key={gender}
              className={`flex items-center justify-center p-3 rounded cursor-pointer transition
                ${formData.gender === gender
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              <input
                type="radio"
                name="gender"
                className="hidden"
                checked={formData.gender === gender}
                onChange={() => setFormData(prev => ({ ...prev, gender }))}
              />
              <span>{gender}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Experience Level
        </label>
        <div className="grid grid-cols-3 gap-2">
          {experienceLevels.map((level) => (
            <label
              key={level}
              className={`flex items-center justify-center p-3 rounded cursor-pointer transition
                ${formData.experience === level
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              <input
                type="radio"
                name="experience"
                className="hidden"
                checked={formData.experience === level}
                onChange={() => setFormData(prev => ({ ...prev, experience: level }))}
              />
              <span>{level}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Equipment (Optional) */}
      <div className="mb-8">
        <label className="block text-sm font-medium mb-2">
          Available Equipment (Optional)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {equipment.map((item) => (
            <label
              key={item}
              className={`flex items-center p-3 rounded cursor-pointer transition
                ${formData.equipment.includes(item)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={formData.equipment.includes(item)}
                onChange={() => handleEquipmentToggle(item)}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition duration-300 transform hover:scale-[1.02]"
      >
        Start Your Fitness Journey
      </button>
    </form>
  );
} 