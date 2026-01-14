// SmartQue - Quiz Utilities

// Handle Timer
const quizTimer = (dismiss) => {
  if (dismiss) {
    clearInterval(timer);
    return;
  }
  timer = setInterval(() => {
    let countHtml = document.querySelector("#count");
    let covtMin = Math.floor(count / 60);
    let mod = count % 60;
    let min = covtMin.toString().length === 1 ? `0${covtMin}` : covtMin;
    let countSec = mod.toString().length === 1 ? `0${mod}` : mod;

    countHtml.innerHTML = `${min + ":" + countSec
      }<sub class="text-xs">sec</sub>`;
    count++;

    // Auto-submit when time reaches 1200 seconds (20 minutes)
    if (count >= 1200) {
      clearInterval(timer);
      const msg = typeof t === 'function' ? t('timesUp') : "Time's up! Your quiz is being submitted automatically.";
      alert(msg);
      document.querySelector("#submit").click();
      return;
    }

    // Visual warning after 60 seconds
    if (count > 60) {
      if (count % 2 === 0) {
        countHtml.classList.remove("text-red-300");
        countHtml.classList.add("text-red-700");
      } else {
        countHtml.classList.remove("text-red-700");
        countHtml.classList.add("text-red-300");
      }
    }
  }, 1000);
};

// Escape HTML to prevent XSS and display issues
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Display quiz options
const displayQuizOptions = (options, questionIndex) => {
  let serial = 1;
  let generatedOptions = "";
  const optionLabel = typeof t === 'function' ? t('option') : 'Option';

  for (let option of options) {
    // Escape HTML entities in options to handle code-related questions
    const escapedOption = escapeHtml(option);
    const dataOption = option.replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    generatedOptions += `<div
      class="border border-gray-200 rounded-lg text-sm p-3 cursor-pointer hover:bg-green-50 hover:border-green-400 transition-all"
      data-option="${dataOption}"
      data-index="${questionIndex}"
      onclick="chooseQuizOption(this)">
      <p class="text-[10px] mb-1 text-gray-500">${optionLabel} ${serial}</p>
      <p class="text-gray-800"><code class="bg-gray-100 px-1 rounded">${escapedOption}</code></p>
    </div>`;
    serial++;
  }
  return generatedOptions;
};

// Handle quiz option click via data attributes
function chooseQuizOption(element) {
  const option = element.getAttribute('data-option')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  const index = element.getAttribute('data-index');
  chooseQuiz(index, option);
}

// Select or choose quiz answer
const chooseQuiz = (index, givenAns) => {
  const isExist = answers.find((ans) => ans.id === quizData[index].id);
  if (isExist) {
    let serial = 0;
    for (let quiz of answers) {
      if (isExist.id === quiz.id) {
        answers.splice(serial, 1, { ...quizData[index], givenAns });
        break;
      }
      serial++;
    }
  } else {
    answers.push({ ...quizData[index], givenAns });
  }
  displayAnswers(answers);

  // Visual feedback - highlight selected option
  highlightSelectedOption(index, givenAns);
};

// Highlight selected option in the quiz
const highlightSelectedOption = (questionIndex, selectedAns) => {
  const questionCards = document.querySelectorAll('#quizContainer > div');
  if (questionCards[questionIndex]) {
    const options = questionCards[questionIndex].querySelectorAll('.grid > div');
    options.forEach(opt => {
      const optionText = opt.querySelector('p:last-child')?.textContent;
      if (optionText === selectedAns) {
        opt.classList.add('bg-green-100', 'border-green-500');
        opt.classList.remove('border-gray-200');
      } else {
        opt.classList.remove('bg-green-100', 'border-green-500');
        opt.classList.add('border-gray-200');
      }
    });
  }
};

// Display selected answers in sidebar
const displayAnswers = (data) => {
  answersContainer.innerHTML = "";
  data = data.sort((a, b) => a.id - b.id);

  data.forEach((answer, idx) => {
    const originalIndex = quizData.findIndex(q => q.id === answer.id);
    const optionIndex = answer.options.indexOf(answer.givenAns);

    answersContainer.innerHTML += `<div class="text-left bg-white rounded p-2 mb-2 shadow-sm">
        <h1 class="text-xs text-gray-600 mb-2">${originalIndex + 1}. ${answer.question.substring(0, 50)}${answer.question.length > 50 ? '...' : ''}</h1>
        <div class="flex justify-center gap-2">
          <p class="w-6 h-6 ${optionIndex === 0 ? "bg-orange-500" : "bg-gray-300"} rounded-full text-white flex justify-center items-center text-xs">1</p>
          <p class="w-6 h-6 ${optionIndex === 1 ? "bg-orange-500" : "bg-gray-300"} rounded-full text-white flex justify-center items-center text-xs">2</p>
          <p class="w-6 h-6 ${optionIndex === 2 ? "bg-orange-500" : "bg-gray-300"} rounded-full text-white flex justify-center items-center text-xs">3</p>
          <p class="w-6 h-6 ${optionIndex === 3 ? "bg-orange-500" : "bg-gray-300"} rounded-full text-white flex justify-center items-center text-xs">4</p>
        </div>
      </div>`;
  });

  // Update answer count
  const countText = `${data.length}/20`;
  const header = answersContainer.previousElementSibling;
  if (header) {
    header.innerHTML = `${typeof t === 'function' ? t('chosenAnswers') : 'Chosen Answers'} <span class="text-green-600 font-bold">(${countText})</span>`;
  }
};

// Show answers after quiz submission
const showAnswers = (data) => {
  const quizContainer = document.querySelector("#quizContainer");
  quizContainer.innerHTML = "";
  data = data.sort((a, b) => a.id - b.id);

  const givenAnswerLabel = typeof t === 'function' ? t('givenAnswer') : 'Given Answer:';
  const correctAnswerLabel = typeof t === 'function' ? t('correctAnswer') : 'Correct Answer:';
  const descriptionLabel = typeof t === 'function' ? t('description') : 'Description:';

  data.forEach((answer, idx) => {
    const isCorrect = answer.givenAns === answer.answer;

    quizContainer.innerHTML += `<div class="text-left bg-white rounded-lg p-4 mb-3 shadow-sm border-l-4 ${isCorrect ? 'border-green-500' : 'border-red-500'}">
          <div class="flex items-start gap-2 mb-3">
            <span class="text-lg ${isCorrect ? 'text-green-600' : 'text-red-600'}">
              ${isCorrect ? '<i class="fa-solid fa-check-circle"></i>' : '<i class="fa-solid fa-times-circle"></i>'}
            </span>
            <h1 class="text-md font-medium">${idx + 1}. ${answer.question}</h1>
          </div>
          <div class="ml-6 space-y-2">
            <p class="text-sm">
              <span class="font-medium">${givenAnswerLabel}</span> 
              <span class="${isCorrect ? 'text-green-600' : 'text-red-600'}">${answer.givenAns}</span>
            </p>
            ${!isCorrect ? `<p class="text-sm">
              <span class="font-medium">${correctAnswerLabel}</span> 
              <span class="text-green-600">${answer.answer}</span>
            </p>` : ''}
            <p class="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded">
              <span class="font-medium">${descriptionLabel}</span> ${answer.description}
            </p>
          </div>
        </div>`;
  });
};
