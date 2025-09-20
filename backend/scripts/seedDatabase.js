const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Farm = require('../models/Farm');

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Farm.deleteMany({});

    // Create sample users
    const users = [
      {
        name: 'Ravi Kumar',
        email: 'ravi@farmer.com',
        phone: '9876543210',
        password: await bcrypt.hash('password123', 12),
        role: 'farmer',
        location: { state: 'Punjab', district: 'Ludhiana' },
        language: 'hindi',
        farmingExperience: 15,
        farmSize: 10
      },
      {
        name: 'Dr. Priya Sharma',
        email: 'priya@expert.com',
        phone: '9876543211',
        password: await bcrypt.hash('password123', 12),
        role: 'expert',
        location: { state: 'Maharashtra', district: 'Pune' },
        language: 'english',
        expertise: ['soil', 'crops', 'disease'],
        certification: 'PhD Agriculture',
        consultationRate: 500
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('Sample users created');

    // Create sample farm
    const sampleFarm = {
      farmerId: createdUsers[0]._id,
      name: 'Green Valley Farm',
      totalArea: 10,
      location: {
        address: 'Village Khanna, Ludhiana, Punjab',
        coordinates: { lat: 30.7046, lng: 76.7179 },
        state: 'Punjab',
        district: 'Ludhiana',
        pincode: '141401'
      },
      soilType: 'alluvial',
      irrigationType: 'canal',
      waterSource: ['canal', 'borewell'],
      season: 'kharif'
    };

    await Farm.create(sampleFarm);
    console.log('Sample farm created');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();