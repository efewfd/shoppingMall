const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // ObjectId → String으로 바꾸기
  name: String,
  price: Number,
  stock: Number,
  image_url: String,
  category1: String,  // 상의, 하의, 아우터, 원피스, 스커트
  category2: [String],  // 2차 카테고리 -> 배열
  created_at: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Product', productSchema);
