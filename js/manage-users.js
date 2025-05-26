// 페이지 로딩 시 전체 회원 목록 불러오기
window.addEventListener('DOMContentLoaded', async () => {
  const res = await fetch('/api/users/all');
  const users = await res.json();
  const tbody = document.querySelector('#user-table tbody');

  users.forEach(user => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${user.userId}</td>
      <td>${user.name || '-'}</td>
      <td>${user.email || '-'}</td>
      <td>${new Date(user.createdAt).toLocaleDateString()}</td>
      <td>
        <button onclick="${user.isActive ? `deactivateUser('${user.userId}')` : `activateUser('${user.userId}')`}">
          ${user.isActive ? '잠금' : '해제'}
        </button>
        <button onclick="deleteUser('${user.userId}')">삭제</button>
      </td>
    `;
    tbody.appendChild(row);
  });
});

// 계정 삭제 함수
async function deleteUser(userId) {
  const confirmed = confirm(`${userId} 계정을 삭제하시겠습니까?`);
  if (!confirmed) return;

  await fetch('/api/users/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });

  alert('삭제 완료');
  window.location.reload();
}

// 계정 잠금 함수
async function deactivateUser(userId) {
  const confirmed = confirm(`${userId} 계정을 잠금 처리하시겠습니까?`);
  if (!confirmed) return;

  await fetch('/api/users/deactivate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });

  alert('잠금 완료');
  window.location.reload();
}

// 계정 잠금 해제 함수
async function activateUser(userId) {
  const confirmed = confirm(`${userId} 계정을 잠금 해제하시겠습니까?`);
  if (!confirmed) return;

  await fetch('/api/users/activate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });

  alert('잠금 해제 완료');
  window.location.reload();
}