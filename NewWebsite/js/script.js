// ====================================================================
//  1. Cookie Handling
// ====================================================================



let want_cookies;
let tictactoe_score = 0;
const day = 24 * 60 * 60 * 1000;

async function save_score() {
    // We only save if cookies have been accepted
    if (want_cookies) {
        await cookieStore.set({
            name: "score_cookie",
            value: tictactoe_score,
            expires: Date.now() + day,
            partitioned: true,
        });
    }
}

async function checking_if_cookie() {
    const cookie_border = document.getElementById("cookie_border");
    try {
        const cookie = await cookieStore.get("score_cookie");
        if (cookie) {
            // Cookie found, hide banner and load the score
            cookie_border.style.display = "none";
            tictactoe_score = Number(cookie.value);
            want_cookies = true;
            
            const tictactoe_counter = document.getElementById("counter");
            if (tictactoe_counter) tictactoe_counter.innerHTML = tictactoe_score;
        } else {
            // No cookie, show the consent banner
            cookie_border.style.display = "flex";
        }
    } catch (error) {
        console.error("Could not access cookies. Displaying banner as a fallback.", error);
        cookie_border.style.display = "flex";
    }
}

async function setting_cookie(event) {
    if (event.target.id == "cookie_accept") {
        want_cookies = true;
        await save_score(); // Save the current score immediately
    } else {
        want_cookies = false;
    }
    document.getElementById("cookie_border").style.display = "none";
}
// ====================================================================
//  3. Tic-Tac-Toe Game Logic
// ====================================================================

// --- Tic-Tac-Toe State Variables ---
let currentPlayer = "o";
let gameActive = true;

// --- DOM Element References (assigned on DOM load) ---
let squares, winnerDisplay, menuPopover, tictactoe_counter;

// --- Constants & SVG Definitions ---
const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];
const svgO = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; pointer-events: none;"><defs><filter id="glow-effect"><feGaussianBlur stdDeviation="3.5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><circle cx="50" cy="50" r="40" stroke="rgb(226, 43, 134)" stroke-width="10" fill="none" filter="url(#glow-effect)" stroke-opacity="0"><animate class="initial_anim" id="initial_anim_c1" attributeName="stroke-opacity" from="0" to="1" dur="0.75s" fill="freeze" begin="indefinite" calcMode="spline" keyTimes="0;1" keySplines="0.40 0.00 0.14 1.00"/><animate class="indefinite_anim" begin="initial_anim_c1.end" attributeName="stroke-width" values="10;6.5;10" dur="3s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="0.69 0.15 0.28 0.95; 0.69 0.15 0.28 0.95"/></circle></svg>`;
const svgX = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; pointer-events: none;"><defs><filter id="glow-effect"><feGaussianBlur stdDeviation="3.5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><path d="M 15 15 L 85 85 M 85 15 L 15 85" stroke="rgb(226, 43, 134)" stroke-width="10" stroke-linecap="round" filter="url(#glow-effect)" stroke-opacity="0"><animate class="initial_anim" id="initial_anim_x1" attributeName="stroke-opacity" from="0" to="1" dur="0.75s" fill="freeze" begin="indefinite" calcMode="spline" keyTimes="0;1" keySplines="0.40 0.00 0.14 1.00"/><animate class="indefinite_anim" begin="initial_anim_x1.end" attributeName="stroke-width" values="10;6.5;10" dur="3s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="0.69 0.15 0.28 0.95; 0.69 0.15 0.28 0.95"/></path></svg>`;
const svgO_popover = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width: 40%; height: 40%; pointer-events: none;"><circle cx="50" cy="50" r="40" stroke="rgb(226, 43, 134)" stroke-width="10" fill="none" /></svg>`;
const svgX_popover = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width: 40%; height: 40%; pointer-events: none;"><line x1="15" y1="15" x2="85" y2="85" stroke="rgb(226, 43, 134)" stroke-width="10" stroke-linecap="round"/><line x1="85" y1="15" x2="15" y2="85" stroke="rgb(226, 43, 134)" stroke-width="10" stroke-linecap="round"/></svg>`;

// --- Tic-Tac-Toe Functions ---
function handleSquareClick(event) {
    const square = event.target.closest('.playarea');
    if (!gameActive || !square || square.dataset.player) return;

    square.dataset.player = currentPlayer;
    square.innerHTML = currentPlayer === "o" ? svgO : svgX;
    square.querySelectorAll('.initial_anim').forEach(anim => anim.beginElement());

    if (checkWin()) {
        endGame(false);
    } else if (checkDraw()) {
        endGame(true);
    } else {
        currentPlayer = currentPlayer === "o" ? "x" : "o";
    }
}

function checkWin() {
    return winConditions.some(condition => {
        return condition.every(index => squares[index].dataset.player === currentPlayer);
    });
}

function checkDraw() {
    return [...squares].every(square => square.dataset.player);
}

function endGame(isDraw) {
    gameActive = false;
    winnerDisplay.innerHTML = isDraw ? "It's a Draw!" : `Player ${currentPlayer === 'o' ? svgO_popover : svgX_popover} Won!`;
    menuPopover.showPopover();

    if (!isDraw) {
        tictactoe_score += 1;
    }

    if (tictactoe_counter) tictactoe_counter.innerHTML = tictactoe_score;
    save_score();
}

function refreshPlayarea() {
    if (tictactoe_counter) tictactoe_counter.innerHTML = tictactoe_score;
    squares.forEach(square => {
        square.innerHTML = "";
        delete square.dataset.player;
    });
    currentPlayer = "o";
    gameActive = true;
    winnerDisplay.textContent = "";
    if (menuPopover.matches(':popover-open')) menuPopover.hidePopover();
}

// ====================================================================
//  4. Initialization
// ====================================================================

function initGameAndCookies() {
    // --- Assign DOM elements for Tic-Tac-Toe ---
    squares = document.querySelectorAll(".playarea");
    winnerDisplay = document.getElementById("winner_display");
    menuPopover = document.getElementById("menu_popover");
    tictactoe_counter = document.getElementById("counter");
    const refreshButton = document.getElementById("refresh_button");

    // --- Assign DOM elements for Cookies ---
    const cookieAcceptButton = document.getElementById("cookie_accept");
    const cookieDeclineButton = document.getElementById("cookie_decline");

    // --- Attach Event Listeners ---
    // Tic-Tac-Toe listeners
    squares.forEach(square => square.addEventListener("click", handleSquareClick));
    if (refreshButton) refreshButton.addEventListener("click", refreshPlayarea);

    // Cookie listeners
    if (cookieAcceptButton) cookieAcceptButton.addEventListener("click", setting_cookie);
    if (cookieDeclineButton) cookieDeclineButton.addEventListener("click", setting_cookie);

    // --- Initial Load Check ---
    checking_if_cookie();
}

function openSite(siteName) {
    window.open(siteName);
}
function changeWindow(siteName) {
    window.location = siteName;
}

// Run initialization logic after the DOM has fully loaded
document.addEventListener('DOMContentLoaded', initGameAndCookies);