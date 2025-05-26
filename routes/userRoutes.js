const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get('/all', async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users);
});

// 회원 삭제
router.post('/delete', async (req, res) => {
  const { userId } = req.body;
  await User.deleteOne({ userId });

  console.log('[삭제 요청]', userId, result); // 로그 찍기

  res.json({ message: '회원 삭제 완료' });
});

// 계정 잠금 처리
router.post('/deactivate', async (req, res) => {
  const { userId } = req.body;
  await User.updateOne({ userId }, { $set: { isActive: false } });
  res.json({ message: '계정 잠금 완료' });
});

// 계정 잠금 해제
router.post('/activate', async (req, res) => {
  const { userId } = req.body;
  await User.updateOne({ userId }, { $set: { isActive: true } });
  res.json({ message: '계정 잠금 해제 완료' });
});

// 회원정보 조회
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId }).select('-password');
    if (!user) return res.status(404).json({ message: '사용자 없음' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: '조회 실패', error: err.message });
  }
});

// 회원정보 수정
router.put('/:userId', async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findOneAndUpdate(
      { userId: req.params.userId },
      { name, email },
      { new: true }
    ).select('-password');
    res.json({ message: '회원정보 수정 완료', user });
  } catch (err) {
    res.status(500).json({ message: '수정 실패', error: err.message });
  }
});

module.exports = router;