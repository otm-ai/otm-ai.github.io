<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>캐드 명령어 검색기</title>
  <script src="common.js"></script>
  
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', sans-serif;
      background-color: #f9f9f9;
      height: 100vh;
      overflow: hidden;
      display: flex;
    }
    .main-content {
      flex: 0 0 80%;
      padding: 40px;
      overflow-y: auto;
      transition: all 0.3s;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .sidebar {
      flex: 0 0 20%;
      background: #fff;
      border-left: 1px solid #ccc;
      padding: 20px;
      overflow-y: auto;
      height: 100vh;
      position: sticky;
      top: 0;
      transition: all 0.3s;
    }
    .sidebar.collapsed {
      width: 60px;
      padding: 10px;
    }
    .toggle-btn {
      background-color: #333;
      color: white;
      border: none;
      padding: 8px 12px;
      cursor: pointer;
      margin-bottom: 20px;
      width: 100%;
      font-size: 14px;
      border-radius: 5px;
    }
    h1 {
      text-align: center;
      margin-bottom: 30px;
    }
    .search-box {
      position: relative;
      width: 30%;
      margin-bottom: 40px;
    }
    input[type="text"], input[type="password"] {
      width: 100%;
      padding: 12px;
      font-size: 16px;
      margin-bottom: 10px;
    }
    .language-indicator {
      margin-top: 5px;
      font-size: 14px;
      color: #555;
      text-align: right;
    }
    .suggestions {
      border: 1px solid #ccc;
      border-top: none;
      max-height: 150px;
      overflow-y: auto;
      background: #fff;
      position: absolute;
      width: 100%;
      z-index: 10;
    }
    .suggestions div {
      padding: 10px;
      cursor: pointer;
    }
    .suggestions div:hover {
      background-color: #efefef;
    }
    .definition {
      margin-top: 20px;
      font-size: 18px;
      text-align: center;
    }
    .admin-panel {
      background: #eee;
      padding: 20px;
      border-radius: 8px;
      max-width: 500px;
      width: 100%;
      margin-top: 50px;
      display: none; /* 기본 숨김 처리 */
    }
    .admin-panel input {
      margin-bottom: 10px;
      padding: 10px;
      width: 100%;
      font-size: 14px;
    }
    .admin-panel button {
      width: 48%;
      padding: 10px;
      background-color: #333;
      color: white;
      border: none;
      cursor: pointer;
      margin-right: 4%;
    }
    .admin-panel button:last-child {
      margin-right: 0;
      background-color: crimson;
    }
    .admin-panel button:hover {
      opacity: 0.9;
    }
    .accordion {
      background-color: #f1f1f1;
      color: #333;
      cursor: pointer;
      padding: 10px;
      width: 100%;
      text-align: left;
      border: none;
      outline: none;
      transition: background-color 0.3s;
      margin-top: 5px;
      border-radius: 5px;
      font-size: 15px;
    }
    .accordion:hover {
      background-color: #ddd;
    }
    .panel {
      padding-left: 15px;
      display: none;
      overflow: hidden;
      background-color: #fafafa;
      border-left: 2px solid #ccc;
      margin-bottom: 5px;
    }
    .panel div {
      padding: 5px 0;
      cursor: pointer;
    }
    .panel div:hover {
      background-color: #efefef;
    }
    .login-form {
      margin-bottom: 20px;
    }
    .login-form button, .logout-btn {
      width: 100%;
      padding: 8px;
      background-color: #0066cc;
      color: white;
      border: none;
      cursor: pointer;
      border-radius: 5px;
      font-size: 14px;
      margin-top: 5px;
    }
    .logout-btn {
      background-color: #cc0000;
    }
    body { margin: 0; }
  </style>
</head>
<body onload="checkLogin()">
  
  <div class="main-content" id="mainContent">
    <h1>캐드 명령어 검색기 </h1>


    <div class="search-box">
      <input type="text" id="searchInput" placeholder="명령어를 입력하세요..." oninput="showSuggestions()" onkeyup="detectLanguage()">
      <div class="language-indicator" id="langIndicator">입력 언어: 감지 중...</div>
      <div class="suggestions" id="suggestions"></div>
      <div class="definition" id="definition"></div>
    </div>

    <div class="admin-panel" id="adminPanel">
      <h3>🔧 관리자 기능: 명령어 추가 / 수정 / 삭제</h3>
      <input type="text" id="adminWord" placeholder="명령어 입력">
      <input type="text" id="adminMeaning" placeholder="설명 입력">
      <div style="display: flex; justify-content: space-between;">
        <button onclick="addOrUpdateWord()">추가 / 수정</button>
        <button onclick="deleteWord()">삭제</button>
      </div>
    </div>
  </div>

  <div class="sidebar" id="sidebar">
    <button class="toggle-btn" onclick="toggleSidebar()">≡ 메뉴</button>

<div class="login-form" id="loginForm">
  <button onclick="location.href='login.html'">로그인</button>
</div>


    <div id="welcomeMessage" style="display: none;">
      <p>환영합니다, 관리자님!</p>
      <button class="logout-btn" onclick="logout()">로그아웃</button>
    </div>

    <h3 style="margin-top: 30px;">📚 전체 명령어 목록</h3>
    <button class="accordion">한글 명령어</button>
    <div class="panel" id="koreanWords"></div>

    <button class="accordion">영문 명령어</button>
    <div class="panel" id="englishWords"></div>
  </div>

  <script>
    let dictionary = JSON.parse(localStorage.getItem('dictionary')) || {
      "라인": "선(Line)을 그리는 명령어.",
      "사각형": "네 꼭짓점으로 이루어진 사각형을 그리는 명령어.",
      "circle": "원을 그리는 명령어.",
      "offset": "선이나 객체를 평행 복제하는 명령어.",
      "move": "객체를 이동시키는 명령어."
    };

    function saveToLocalStorage() {
      localStorage.setItem('dictionary', JSON.stringify(dictionary));
    }

    function showSuggestions() {
      const input = document.getElementById("searchInput").value.toLowerCase();
      const suggestionsDiv = document.getElementById("suggestions");
      suggestionsDiv.innerHTML = "";

      if (input.length === 0) return;

      const suggestions = Object.keys(dictionary).filter(word =>
        word.toLowerCase().startsWith(input)
      );

      suggestions.forEach(word => {
        const div = document.createElement("div");
        div.textContent = word;
        div.onclick = () => showDefinition(word);
        suggestionsDiv.appendChild(div);
      });
    }

    function showDefinition(word) {
      document.getElementById("definition").textContent = `${word} : ${dictionary[word]}`;
      document.getElementById("suggestions").innerHTML = "";
      document.getElementById("searchInput").value = word;
    }

    function addOrUpdateWord() {
      const word = document.getElementById("adminWord").value.trim();
      const meaning = document.getElementById("adminMeaning").value.trim();

      if (word && meaning) {
        dictionary[word] = meaning;
        saveToLocalStorage();
        updateWordList();
        alert(`'${word}' 명령어가 저장되었습니다.`);
        document.getElementById("adminWord").value = "";
        document.getElementById("adminMeaning").value = "";
      } else {
        alert("명령어와 설명을 모두 입력해주세요.");
      }
    }

    function deleteWord() {
      const word = document.getElementById("adminWord").value.trim();

      if (word in dictionary) {
        if (confirm(`'${word}' 명령어를 정말 삭제하시겠습니까?`)) {
          delete dictionary[word];
          saveToLocalStorage();
          updateWordList();
          alert(`'${word}' 명령어가 삭제되었습니다.`);
          document.getElementById("adminWord").value = "";
          document.getElementById("adminMeaning").value = "";
        }
      } else {
        alert("삭제할 명령어가 사전에 존재하지 않습니다.");
      }
    }

    function detectLanguage() {
      const input = document.getElementById("searchInput").value;
      const lastChar = input.charAt(input.length - 1);
      const langIndicator = document.getElementById("langIndicator");

      if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(lastChar)) {
        langIndicator.textContent = "입력 언어: 한글";
      } else if (/[a-zA-Z]/.test(lastChar)) {
        langIndicator.textContent = "입력 언어: 영어";
      } else {
        langIndicator.textContent = "입력 언어: 감지 중...";
      }
    }

    function updateWordList() {
      const koreanWordsDiv = document.getElementById("koreanWords");
      const englishWordsDiv = document.getElementById("englishWords");

      koreanWordsDiv.innerHTML = "";
      englishWordsDiv.innerHTML = "";

      const keys = Object.keys(dictionary);

      const koreanWords = keys.filter(word => /[가-힣]/.test(word));
      const englishWords = keys.filter(word => /^[a-zA-Z]/.test(word));

      koreanWords.sort((a, b) => a.localeCompare(b, 'ko'));
      englishWords.sort((a, b) => a.localeCompare(b, 'en'));

      koreanWords.forEach(word => {
        const div = document.createElement("div");
        div.textContent = word;
        div.onclick = () => showDefinition(word);
        koreanWordsDiv.appendChild(div);
      });

      englishWords.forEach(word => {
        const div = document.createElement("div");
        div.textContent = word;
        div.onclick = () => showDefinition(word);
        englishWordsDiv.appendChild(div);
      });
    }

    function toggleSidebar() {
      const sidebar = document.getElementById("sidebar");
      sidebar.classList.toggle("collapsed");
    }

    function login() {
      const id = document.getElementById("loginId").value;
      const pw = document.getElementById("loginPw").value;

      if (id === "admin" && pw === "1234") {
        alert("로그인 성공!");
        localStorage.setItem('isLoggedIn', 'true');
        showAdminPanel();
      } else {
        alert("아이디 또는 비밀번호가 틀렸습니다.");
      }
    }

    function logout() {
      localStorage.removeItem('isLoggedIn');
      showLoginForm();
    }

    function showAdminPanel() {
      document.getElementById("adminPanel").style.display = "block";
      document.getElementById("loginForm").style.display = "none";
      document.getElementById("welcomeMessage").style.display = "block";
    }

    function showLoginForm() {
      document.getElementById("adminPanel").style.display = "none";
      document.getElementById("loginForm").style.display = "block";
      document.getElementById("welcomeMessage").style.display = "none";
    }

    function checkLogin() {
      if (localStorage.getItem('isLoggedIn') === 'true') {
        showAdminPanel();
      } else {
        showLoginForm();
      }
    }

    document.querySelectorAll('.accordion').forEach(btn => {
      btn.addEventListener('click', function() {
        this.classList.toggle("active");
        const panel = this.nextElementSibling;
        if (panel.style.display === "block") {
          panel.style.display = "none";
        } else {
          panel.style.display = "block";
        }
      });
    });

    updateWordList();
    checkLogin();
  </script>

</body>
</html>

