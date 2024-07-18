const question = document.querySelector('.question');
const option1 = document.querySelector('#option-1');
const option2 = document.querySelector('#option-2');
const option3 = document.querySelector('#option-3');
const option4 = document.querySelector('#option-4');
const beginBtn = document.querySelector('.begin-btn');
const selectCategory = document.querySelector('#select-category');
const questionNumber = document.querySelector('.question-number');
const totalQuestions = document.querySelector('.total-questions');
const nextBtn = document.querySelector('.next-btn');
const previousBtn = document.querySelector('.previous-btn');
const restartBtn = document.querySelector('.restart-btn');
const error_msg = document.querySelector('.error-msg');
const display_answer = document.querySelector('.display-answer');
const beginQuiz = document.querySelector('.begin-quiz');
const quizArea = document.querySelector('.quiz-area');
const endArea = document.querySelector('.end-area');
const totalScore = document.querySelector('.total-score');

// Global variables
let randomOptions = [];
let currentQuestionIndex = 0;
let opts_input = Array.from(document.getElementsByName('options'));
let quizData = null;
let userScore = 0;
let currentQuestionNumber = 1;
let category_id = 18; // Default category: Computer Science
let quizCategory = null;

// Fetching category data from API
async function getCategory() {
    const url = 'https://opentdb.com/api_category.php';
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.log(error);
    }
}

// Display categories in the select dropdown
async function displayCategory() {
    quizCategory = await getCategory();
    const triviaCategories = quizCategory.trivia_categories;
    triviaCategories.forEach(category => {
        const option = document.createElement('option');
        option.setAttribute('value', `${category.id}`);
        option.textContent = category.name;
        selectCategory.appendChild(option);
    });
}

// Update the selected category ID
function updateCategoryID() {
    category_id = selectCategory.value;
}

// Fetching quiz data from API
async function getQuizData() {
    const url = `https://opentdb.com/api.php?amount=10&category=${category_id}&type=multiple`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch data');
        return await response.json();
    } catch (error) {
        console.log(error);
    }
}

// Start the quiz
async function startQuiz() {
    clearHTML();
    updateCategoryID();
    beginQuiz.classList.add('hidden');
    quizArea.classList.remove('hidden');
    endArea.classList.add('hidden');
    quizData = await getQuizData();
    console.log(quizData);
    renderHTML();
}

// Render question and options
function renderHTML() {
    opts_input.forEach(opt => opt.nextElementSibling.classList.remove('correct-answer'));
    const decodeQuestion = decodeHTML(quizData.results[currentQuestionIndex].question);
    question.textContent = decodeQuestion;

    const options = [
        decodeHTML(quizData.results[currentQuestionIndex].incorrect_answers[0]),
        decodeHTML(quizData.results[currentQuestionIndex].incorrect_answers[1]),
        decodeHTML(quizData.results[currentQuestionIndex].incorrect_answers[2]),
        decodeHTML(quizData.results[currentQuestionIndex].correct_answer),
    ];
    shuffleOptions(options);

    questionNumber.textContent = currentQuestionNumber;
    totalQuestions.textContent = quizData.results.length;
    option1.nextElementSibling.textContent = randomOptions[0];
    option2.nextElementSibling.textContent = randomOptions[1];
    option3.nextElementSibling.textContent = randomOptions[2];
    option4.nextElementSibling.textContent = randomOptions[3];
}

// Shuffle the options array
function shuffleOptions(options) {
    while (randomOptions.length < options.length) {
        const randomItem = options[Math.floor(Math.random() * options.length)];
        if (!randomOptions.includes(randomItem)) {
            randomOptions.push(randomItem);
        }
    }
}

// Move to the next question
function nextQuestion() {
    const selectedOption = opts_input.find(opt => opt.checked);
    const correctAnswer = decodeHTML(quizData.results[currentQuestionIndex].correct_answer);

    if (!selectedOption) {
        error_msg.textContent = 'No skipping questions!';
        error_msg.classList.remove('hidden');
        setTimeout(() => {
            error_msg.classList.add('hidden');
        }, 1000);
        return;
    }

    if (selectedOption.nextElementSibling.textContent === correctAnswer) {
        userScore++;
        selectedOption.nextElementSibling.classList.add('correct-answer');
    } else {
        display_answer.textContent = correctAnswer;
        display_answer.classList.remove('hidden');
        setTimeout(() => {
            display_answer.classList.add('hidden');
            renderHTML();
        }, 1000);
    }

    setTimeout(() => {
        currentQuestionNumber++;
        currentQuestionIndex++;
        randomOptions = [];
        clearSelectedOption();
        if (currentQuestionIndex < quizData.results.length) {
            renderHTML();
        } else {
            quizArea.classList.add('hidden');
            endArea.classList.remove('hidden');
            console.log('end of quiz!');
            console.log(`Your total score is: ${userScore}`);
            totalScore.textContent = `Score: ${userScore} out of ${quizData.results.length}`;
        }
    }, 1000);
}

// Move to the previous question
function previousQuestion() {
    if (currentQuestionIndex <= 0) {
        error_msg.textContent = 'This is the first question';
        error_msg.classList.remove('hidden');
        setTimeout(() => {
            error_msg.textContent = 'Please select an option.';
            error_msg.classList.add('hidden');
        }, 1000);
        return;
    }
    currentQuestionNumber--;
    currentQuestionIndex--;
    randomOptions = [];
    clearSelectedOption();
    renderHTML();
}

// Clear the selected option
function clearSelectedOption() {
    opts_input.forEach(opt => opt.checked = false);
}

// Decode HTML entities
function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

// Reset the quiz
function resetQuiz() {
    currentQuestionIndex = 0;
    currentQuestionNumber = 1;
    startQuiz();
}

// Clear HTML content for new questions
function clearHTML() {
    question.textContent = '';
    option1.nextElementSibling.textContent = '';
    option2.nextElementSibling.textContent = '';
    option3.nextElementSibling.textContent = '';
    option4.nextElementSibling.textContent = '';
    randomOptions = [];
    error_msg.classList.add('hidden');
    display_answer.classList.add('hidden');
    userScore = 0;
}

// Event listeners
nextBtn.addEventListener('click', nextQuestion);
previousBtn.addEventListener('click', previousQuestion);
beginBtn.addEventListener('click', startQuiz);
restartBtn.addEventListener('click', resetQuiz);

// Initialize category display
displayCategory();
