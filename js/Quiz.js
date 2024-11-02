const quizContainer = document.querySelector(".quiz-container");
const paginationContainer = document.querySelector(".pagination-container");
const questionsPerPage = 1;
let currentPage = 1;
let totalQuestions = 10; // Limit questions to 10
let questions = [];
let selectedAnswers = {}; // Object to save user answers
let incorrectAnswers = []; // Array to store the indices of incorrect answers


// Fetch quizzes for the selected category
const getQuizzesCategories = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get("category");
    console.log("Selected category:", category);

    try {
        const response = await fetch(`https://the-trivia-api.com/v2/questions?limit=10&categories=${category}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        questions = await response.json();
        console.log(questions)
        displayQuestions();
        setupPagination();
    } catch (error) {
        console.error("Error fetching quiz data:", error);
    }
};

// Display questions and options
const displayQuestions = () => {
    //Pagination Calculation:
    const startIndex = (currentPage - 1) * questionsPerPage;
    const endIndex = startIndex + questionsPerPage;
    const questionsToDisplay = questions.slice(startIndex, endIndex);

    const result = questionsToDisplay.map((question, index) => {
        const questionIndex = startIndex + index + 1;
        const answers = [question.correctAnswer, ...question.incorrectAnswers];
        const shuffledAnswers = answers.sort(() => Math.random() - 0.5);

        const options = shuffledAnswers.map((answer) => {
            const checked = selectedAnswers[questionIndex] === answer ? "checked" : ""; // To save the answers
            return `
                <label>
                    <input type="radio" name="question${questionIndex}" value="${answer}" ${checked}>
                    ${answer}
                </label>
            `;
        }).join('');

        return `
            <div class="question">
                <h2>Question ${questionIndex}</h2>
                <p>${question.question.text}</p>
                <div class="options" data-question-index="${questionIndex}">
                    ${options}
                </div>
            </div>
        `;
    }).join('');

    quizContainer.innerHTML = result;

    // Add event listeners to save answers
    document.querySelectorAll('.options input[type="radio"]').forEach((input) => {
        input.addEventListener('change', (event) => {
            const questionIndex = event.target.closest('.options').getAttribute('data-question-index');
            selectedAnswers[questionIndex] = event.target.value;
        });
    });

    // Add submit button if it's the last page
    const submitButtonHTML = currentPage === Math.ceil(totalQuestions / questionsPerPage)
        ? `<button id="submit-btn">Submit Quiz</button>`
        : '';
    quizContainer.insertAdjacentHTML('beforeend', submitButtonHTML);

    // Submit button event listener
    const submitBtn = document.getElementById("submit-btn");
    if (submitBtn) {
        submitBtn.addEventListener("click", validateAndSubmitQuiz);
    }
};

// Update pagination to show answered questions
const updatePaginationStatus = () => {
    document.querySelectorAll('.pagination-btn').forEach((button) => {
        const pageIndex = parseInt(button.getAttribute('data-page'));

        if (selectedAnswers[(pageIndex - 1) * questionsPerPage + 1]) {
            button.classList.add('answered');
        } else {
            button.classList.remove('answered');
        }

        // Apply wrongAnswer class if this page index is in incorrectAnswers
        if (incorrectAnswers.includes(pageIndex)) {
            button.classList.add('wrongAnswer');
        }
    });
};

// Validate all questions are answered before submission
const validateAndSubmitQuiz = () => {
    if (Object.keys(selectedAnswers).length < totalQuestions) {
        alert("Please answer all questions before submitting!");
    } else {
        calculateScore();
    }
};

// Calculate and display the score, highlighting wrong answers
const calculateScore = () => {
    const alertContainer = document.getElementById('alert-container');
    alertContainer.innerHTML = ''; // Clear previous alerts
    let score = 0;
    incorrectAnswers = []; // Reset incorrect answers

    questions.forEach((question, index) => {
        const questionIndex = index + 1;
        if (selectedAnswers[questionIndex] === question.correctAnswer) {
            score++;
        } else {
            // Add to incorrectAnswers array
            incorrectAnswers.push(Math.ceil(questionIndex / questionsPerPage));
        }
    });

    let alertHTML = '';
    if (score >= 5) {
        alertHTML = `
            <div class="alert alert-success">
                <p>Congratulations, you have passed the quiz!</p> <br>
                <p>Your score is: ${score} out of ${totalQuestions}</p>
                <span class="mdi mdi-close close"><i class="fa-thin fa-x"></i></span>
            </div>
        `;
    } else {
        alertHTML = `
            <div class="alert alert-error">
                <p>Sorry, you have failed the quiz!</p> 
                <p>Your score is: ${score} out of ${totalQuestions}</p>
                <span class="mdi mdi-close close"><i class="fa-thin fa-x"></i></span>
            </div>
        `;
    }

    alertContainer.innerHTML = alertHTML;

    const closeButton = document.querySelector('.close');
    closeButton.addEventListener('click', () => {
        alertContainer.innerHTML = '';
    });

    updatePaginationStatus(); // Call to ensure wrong answers are highlighted
};

// Setup pagination
const setupPagination = () => {
    const totalPages = Math.ceil(totalQuestions / questionsPerPage);
    let paginationHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const isActive = i === currentPage ? 'active' : '';
        paginationHTML += `<button class="pagination-btn ${isActive}" data-page="${i}">${i}</button>`;
    }

    paginationContainer.innerHTML = paginationHTML;
    updatePaginationStatus(); // Update status of pagination buttons

    document.querySelectorAll('.pagination-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            currentPage = parseInt(event.target.getAttribute('data-page'));
            displayQuestions();
            setupPagination();
        });
    });
};

getQuizzesCategories();
