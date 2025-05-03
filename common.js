// 로그인 상태 확인
function checkLogin() {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (!isLoggedIn && window.location.pathname !== '/login.html' && window.location.pathname !== '/signup.html') {
    alert("로그인이 필요합니다.");
    window.location.href = "/login.html";
  }
}

// 로그인
function login(id, pw) {
  const storedUsers = JSON.parse(localStorage.getItem('users')) || {};
  if (storedUsers[id] && storedUsers[id].password === pw) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userId', id);
    localStorage.setItem('role', storedUsers[id].role);
    alert('로그인 성공!');
    window.location.href = "/index.html";
  } else {
    alert('아이디 또는 비밀번호가 잘못되었습니다.');
  }
}

// 회원가입
function signup(id, pw) {
  let storedUsers = JSON.parse(localStorage.getItem('users')) || {};
  if (storedUsers[id]) {
    alert('이미 존재하는 아이디입니다.');
    return;
  }
  
  // admin 아이디일 경우 관리자 권한 부여 (간단 로직)
  const role = (id === "admin") ? "admin" : "user";
  
  storedUsers[id] = { password: pw, role: role };
  localStorage.setItem('users', JSON.stringify(storedUsers));
  alert('회원가입이 완료되었습니다.');
  window.location.href = "/login.html";
}

// 로그아웃
function logout() {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userId');
  localStorage.removeItem('role');
  alert('로그아웃 되었습니다.');
  window.location.href = "/login.html";
}

// 현재 사용자 역할 가져오기
function getUserRole() {
  return localStorage.getItem('role');
}
