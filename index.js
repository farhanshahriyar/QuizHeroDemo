// SmartQue - Main Application Logic

// Global variable declaration
let count = 0;
let timer;
let quizData;
let answers = [];

// DOM elements
let startQuiz = document.querySelector("#startQuiz");
let topicContainer = document.querySelector("#topicContainer");
let levelContainer = document.querySelector("#levelContainer");
let rulesContainer = document.querySelector("#rulesContainer");
let loadingContainer = document.querySelector("#loadingContainer");
let alertContainer = document.querySelector("#alertContainer");
let submitContainer = document.querySelector("#submitContainer");
let quizContainer = document.querySelector("#quizContainer");
let answersContainer = document.querySelector("#answersContainer");
let displayResult = document.querySelector("#displayResult");

// Shuffle function (Fisher-Yates Algorithm)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Initialize app on page load
document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
});

// Topic selection handler
function selectTopic(topic) {
  setTopic(topic);

  // Update selected topic display
  const topicNames = {
    html: currentLang === 'bn' ? 'এইচটিএমএল' : 'HTML',
    css: currentLang === 'bn' ? 'সিএসএস' : 'CSS',
    javascript: currentLang === 'bn' ? 'জাভাস্ক্রিপ্ট' : 'JavaScript'
  };

  document.getElementById('selectedTopicDisplay').textContent = topicNames[topic];

  // Hide topic, show level
  topicContainer.classList.add('hidden');
  levelContainer.classList.remove('hidden');
  levelContainer.classList.add('fade-in');
}

// Level selection handler
function selectLevel(level) {
  setLevel(level);

  // Update quiz info display
  const topicNames = {
    html: currentLang === 'bn' ? 'এইচটিএমএল' : 'HTML',
    css: currentLang === 'bn' ? 'সিএসএস' : 'CSS',
    javascript: currentLang === 'bn' ? 'জাভাস্ক্রিপ্ট' : 'JavaScript'
  };

  const levelNames = {
    beginner: currentLang === 'bn' ? 'সহজ' : 'Beginner',
    intermediate: currentLang === 'bn' ? 'মাঝারি' : 'Intermediate',
    advanced: currentLang === 'bn' ? 'কঠিন' : 'Advanced'
  };

  const { topic } = getSelections();
  document.getElementById('quizInfoDisplay').textContent =
    `${topicNames[topic]} - ${levelNames[level]}`;

  // Hide level, show rules
  levelContainer.classList.add('hidden');
  rulesContainer.classList.remove('hidden');
  rulesContainer.classList.add('fade-in');
}

// Go back to topics
function goBackToTopics() {
  resetSelections();
  levelContainer.classList.add('hidden');
  topicContainer.classList.remove('hidden');
  topicContainer.classList.add('fade-in');
}

// Go back to levels
function goBackToLevels() {
  levelContainer.classList.remove('hidden');
  levelContainer.classList.add('fade-in');
  rulesContainer.classList.add('hidden');
}

// EventListener for quiz start button
startQuiz.addEventListener("click", async () => {
  let countDown = document.querySelector("#countDownContainer");
  let counter = document.querySelector("#counter");
  let counterNum = 2;
  countDown.classList.remove("hidden");
  countDown.classList.add("flex");

  let x = setInterval(async () => {
    if (counterNum < 0) {
      countDown.classList.remove("flex");
      countDown.classList.add("hidden");
      counterNum = 3;
      count = 0;
      timer = null;
      quizData = null;
      answers = [];

      rulesContainer.classList.add("hidden");

      // Show loading while fetching questions
      loadingContainer.classList.remove("hidden");

      clearInterval(x);

      // Load quiz from API
      await loadQuiz();
    }
    counter.innerText = counterNum;
    counterNum--;
  }, 1000);
});

// Load quiz from OpenAI API
const loadQuiz = async () => {
  try {
    const { topic, level } = getSelections();

    // Generate questions using OpenAI
    const data = await generateQuizQuestions(topic, level, currentLang);

    // Shuffle the questions
    quizData = shuffleArray(data);

    // Also shuffle options for each question
    quizData = quizData.map(q => {
      const shuffledOptions = shuffleArray([...q.options]);
      return { ...q, options: shuffledOptions };
    });

    // Hide loading, show quiz
    loadingContainer.classList.add("hidden");
    alertContainer.classList.remove("hidden");
    submitContainer.classList.remove("hidden");
    submitContainer.classList.add("flex");

    displayQuiz(quizData);
    quizTimer();

  } catch (error) {
    console.error('Error loading quiz:', error);
    loadingContainer.classList.add("hidden");

    // Show error message
    alert(t('apiError'));

    // Go back to topic selection
    rulesContainer.classList.add("hidden");
    topicContainer.classList.remove("hidden");
    resetSelections();
  }
};

// Displaying quiz on quiz page
const displayQuiz = (data) => {
  if (!data) {
    quizContainer.innerHTML = "";
    return;
  }

  quizContainer.innerHTML = "";

  data.forEach((quiz, i) => {
    quizContainer.innerHTML += `<div class="m-3 py-3 px-4 shadow-sm rounded bg-white">
  <div class="flex items-start">
    <div class="h-8 w-8 min-w-[2rem] bg-green-300 rounded-full flex justify-center items-center text-green-800 mr-3 font-bold">
      ${i + 1}
    </div>
    <p class="text-gray-800 text-sm leading-relaxed">${quiz.question}</p>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
    ${displayQuizOptions(quiz.options, i)}
  </div>
</div>`;
  });
};

// EventListener for quiz submit button
document.querySelector("#submit").addEventListener("click", () => {
  if (answers.length < 20) {
    // Show give up confirmation modal
    showGiveUpModal();
    return;
  }

  // All questions answered - submit normally
  submitQuiz();
});

// Show give up modal
function showGiveUpModal() {
  const modal = document.getElementById('giveUpModal');
  const messageEl = document.getElementById('giveUpMessage');

  // Update message with current answer count  
  const msg = t('answeredXofY').replace('{count}', answers.length);
  messageEl.textContent = msg;

  modal.classList.remove('hidden');
  updatePageLanguage(); // Update modal translations
}

// Close give up modal
function closeGiveUpModal() {
  document.getElementById('giveUpModal').classList.add('hidden');
}

// Force submit with partial answers
function forceSubmitQuiz() {
  closeGiveUpModal();
  submitQuiz();
}

// Main submit function - handles both full and partial submissions
function submitQuiz() {
  quizTimer(true);

  answersContainer.innerHTML = `<div class="my-4">
  <i class="fa-solid fa-fan animate-spin text-2xl text-green-600"></i>
  <p class="text-xs animate-pulse">${currentLang === 'bn' ? 'অপেক্ষা করুন, যাচাই হচ্ছে...' : 'Please Wait, We are checking...'}</p>
</div>`;

  let timeTaken = document.querySelector("#count");
  let totalMark = 0;
  let grade = {
    status: "",
    color: "",
  };

  for (let ans of answers) {
    if (ans.answer === ans.givenAns) {
      totalMark += 10;
    }
  }

  // Grading with motivational messages:
  // 200 (20/20) = Excellent
  // 150+ (15+/20) = Very Good
  // 80-149 (8-14/20) = Nice Try
  // <80 (<8/20) = Keep Trying (encourage retry)
  if (totalMark >= 200) {
    grade.status = t('excellent');
    grade.message = t('excellentMsg');
    grade.color = "text-green-600";
    grade.emoji = "🏆";
  } else if (totalMark >= 150) {
    grade.status = t('veryGood');
    grade.message = t('veryGoodMsg');
    grade.color = "text-blue-600";
    grade.emoji = "🌟";
  } else if (totalMark >= 80) {
    grade.status = t('niceTry');
    grade.message = t('niceTryMsg');
    grade.color = "text-orange-600";
    grade.emoji = "💪";
  } else {
    grade.status = t('keepTrying');
    grade.message = t('keepTryingMsg');
    grade.color = "text-red-600";
    grade.emoji = "🔄";
  }

  // Data setting on local storage
  let storage = JSON.parse(localStorage.getItem("results"));
  const { topic, level } = getSelections();
  const resultData = {
    marks: totalMark,
    examTime: timeTaken.innerText,
    status: grade.status,
    topic: topic,
    level: level,
    date: new Date().toLocaleDateString()
  };

  if (storage) {
    localStorage.setItem("results", JSON.stringify([...storage, resultData]));
  } else {
    localStorage.setItem("results", JSON.stringify([resultData]));
  }

  // Right side bar/ answer section
  let x = setTimeout(() => {
    showAnswers(answers);
    displayResult.innerHTML = `<div
    class="h-[250px] w-[250px] mx-auto mt-8 flex flex-col justify-center border-2 rounded-tr-[50%] rounded-bl-[50%]"
  >
    <p class="text-3xl mb-1">${grade.emoji}</p>
    <h3 class="text-xl font-bold ${grade.color}">${grade.status}</h3>
    <p class="text-xs ${grade.color} mb-2">${grade.message}</p>
    <h1 class="text-3xl font-bold my-2">
      ${totalMark}<span class="text-slate-800">/200</span>
    </h1>
    <p class="text-sm flex justify-center items-center gap-2">
      ${t('totalTime')} <span class="text-xl text-orange-500">${timeTaken.innerText.replace("sec", "")}<span class="text-xs">sec</span></span>
    </p>
  </div>
  
  <button onclick="restartQuiz();" class="bg-green-600 text-white w-full py-2 rounded mt-8">${t('restart')}</button>
  
  ${storage ? `<div class="mt-5">
    <h1 class="text-center">${t('previousSubmissions')} <button class="text-blue-800 text-xs" onclick="localStorage.clear();location.reload()">${t('clearHistory')}</button></h1>
    <div class="flex justify-between items-center border rounded p-2 my-2 shadow-sm font-medium text-sm">
      <div>${t('marks')}</div>
      <div>${t('grade')}</div>
      <div>${t('time')}</div>
    </div>
    ${storage?.reverse()?.slice(0, 5)?.map(
      (item) => `<div class="flex justify-between items-center border rounded p-2 my-2 shadow-sm text-sm">
        <div>${item.marks}/200</div>
        <div>${item.status}</div>
        <div>${item.examTime}</div>
      </div>`
    )?.join("")}
  </div>` : ""}
  `;

    clearTimeout(x);
  }, 1500);

  window.scrollTo(0, 0);
}

// Restart quiz - go back to topic selection
function restartQuiz() {
  resetSelections();
  location.reload();
}

// Login button location
document.getElementById('login-button').addEventListener('click', function () {
  window.location.href = 'login.html';
});
