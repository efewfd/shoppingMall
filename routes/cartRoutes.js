const express = require('express');
const router = express.Router(); // 이거 반드시 필요!
const User = require('../models/user'); // 사용자 모델


// 수량 수정
router.post('/update', async (req, res) => {
  const userId = req.session?.user?.userId; //const { userId } = req.session.user;
  const { productId, quantity } = req.body;

  if (quantity < 1) return res.status(400).json({ message: '최소 수량은 1개입니다.' });
  if (!userId) return res.status(401).json({ message: '로그인이 필요합니다.' });
  console.log('[ 수량 수정 요청 도착]');

  const result = await User.updateOne(
    { userId, 'cart.productId': productId },
    { $set: { 'cart.$.quantity': quantity } }
  );

  res.json({ message: '수량 수정 완료', result });
});

// 장바구니 비우기
router.post('/clear', async (req, res) => {
  const userId = req.session?.user?.userId;
  if (!userId) return res.status(401).json({ message: '로그인이 필요합니다.' });

  console.log('[ 장바구니 비우기 요청]', { userId });

  await User.updateOne(
    { userId },
    { $set: { cart: [] } } // 장바구니 비우기
  );

  res.json({ message: '장바구니가 모두 삭제되었습니다.' });
});

// 개별 상품 삭제
router.post('/delete', async (req, res) => {
  const userId = req.session?.user?.userId;
  const { productId } = req.body;

  if (!userId) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  const result = await User.updateOne(
    { userId },
    { $pull: { cart: { productId } } } //  productId가 일치하는 항목 제거
  );

  res.json({ message: '상품 삭제 완료', result });
});


module.exports = router;