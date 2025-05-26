// 인증 라우트
const express = require('express');
const multer = require('multer');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const upload = multer();

// 회원가입
router.post('/register', upload.none(), async (req, res) => {
  const { userId, password, name, email } = req.body;

  console.log('[회원가입 요청]', { userId, name, email }); // 요청 데이터 확인용

  // 이미 존재하는 아이디인지 확인
  const existingUser = await User.findOne({ userId });
  if (existingUser) return res.status(400).json({ message: '이미 존재하는 ID입니다.' });

  // 비밀번호 암호화
  const hashedPw = await bcrypt.hash(password, 10);

  // 사용자 생성 및 저장
  const newUser = new User({ userId, password: hashedPw, name, email, isActive: true });
  await newUser.save();

  console.log('[회원가입 성공]', newUser); // 저장된 사용자 정보 확인
  res.json({ message: '회원가입 성공' });
});

// 로그인
router.post('/login', upload.none(), async (req, res) => {
  console.log('[로그인 req.body]', req.body);  // 터미널 확인용
  const { userId, password } = req.body;

  // 사용자 존재 여부 확인
  const user = await User.findOne({ userId });
  if (!user) return res.status(400).json({ message: '존재하지 않는 ID입니다.' });

  // 비밀번호 일치 여부 확인
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: '비밀번호가 틀렸습니다.' });

  // ✅ 계정이 비활성화된 경우 로그인 거부
  if (user.isActive === false) {
    return res.status(403).json({ message: '해당 계정은 잠금 상태입니다. 관리자에게 문의하세요.' });
  }

  // 세션에 사용자 정보 저장
  req.session.user = { userId: user.userId, name: user.name };
  console.log('[로그인 성공]', req.session.user); // 세션 정보 확인

  res.json({ message: '로그인 성공', user: req.session.user });
});

// 현재 로그인된 사용자 정보 확인
router.get('/user', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

// 로그아웃
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: '로그아웃 완료' });
  });
});

// 아이디 찾기
router.post('/find-id', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: '해당 이메일로 등록된 아이디가 없습니다.' });
  }

  res.json({ userId: user.userId });
});

// 비밀번호 찾기
router.post('/find-password', async (req, res) => {
  const { userId, email } = req.body;
  const user = await User.findOne({ userId, email });

  if (!user) {
    return res.status(404).json({ message: '아이디 또는 이메일이 일치하지 않습니다.' });
  }

  // WARNING: 실사용 서비스에서는 절대 비밀번호를 그대로 반환 X
  res.json({ password: user.password });
});

// 비밀번호 재설정
router.post('/reset-password', async (req, res) => {
  const { userId, newPassword } = req.body;
  const hashedPw = await bcrypt.hash(newPassword, 10);

  await User.updateOne({ userId }, { $set: { password: hashedPw } });

  res.json({ message: '비밀번호가 변경되었습니다.' });
});

module.exports = router;
