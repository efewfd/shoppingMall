const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: String,
  quantity: Number
});

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },  // 로그인용 ID
  password: { type: String, required: true },              // 해시된 비밀번호
  name: String,
  email: String,
  cart: [cartItemSchema], // 유저별 장바구니 내장 배열
  isActive: { type: Boolean, default: true }, // 잠금 처리용
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
