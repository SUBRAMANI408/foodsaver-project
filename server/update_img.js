import mongoose from 'mongoose';
mongoose.connect('mongodb://127.0.0.1:27017/savebite').then(async () => {
  const FoodItem = (await import('./models/FoodItem.js')).default;
  await FoodItem.updateMany({}, { $set: { images: ['https://placehold.co/800x600/e2e8f0/64748b?text=Food+Image'] } });
  console.log('Images updated');
  process.exit(0);
});
