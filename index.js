const RoboDirections = {
    down: 'down',
    diagonalLeft: 'diag-left',
    diagonalRight: 'diag-right',
}
const numberInput = document.getElementById('box-size');
const autoPlay = document.getElementById('auto-play-slider');
const startButton = document.getElementById('start-game');
const resetButton = document.getElementById('reset-game');
const clearButton = document.getElementById('clear-game');
const currentScoreDisplay = document.getElementById('current-score-display')
const gameDisplay = document.getElementById('game-over-display');
const board = document.getElementById('game-board');
let gameStarted = false, rowColumnCount, pos1, pos2, total = 0, selectedRobo, grid = [];

function init() {
    setHighScore();
    assignListeners();
    enableDisableElements();
}

function assignListeners() {
    startButton.addEventListener('click', startGame);
    resetButton.addEventListener('click', resetGame);
    clearButton.addEventListener('click', clearGame);
    document.addEventListener('keydown', handleRoboMovement);
}

function clearListeners() {
    startButton.removeEventListener('click', startGame);
    resetButton.removeEventListener('click', resetGame);
    clearButton.removeEventListener('click', clearGame);
    document.removeEventListener('keydown', handleRoboMovement);
}

function startGame() {
    let boxSize = numberInput.value ?? "";
    try {
        if (boxSize && parseInt(boxSize)) {
            rowColumnCount = parseInt(boxSize);
            gameStarted = true;
            pos1 = [1, 1];
            pos2 = [1, rowColumnCount];
            selectedRobo = 'robo1';
            total = 0;
            grid = [];
            gameDisplay.innerHTML = '';
            createBoardLayout();
        }
    } catch (err) {
        numberInput.value = "";
        console.log("err : ", err);
        gameStarted = false;
    }
    enableDisableElements();
}

function resetGame() {
    startGame();
}

function getChocolateCount() {
    return parseInt(Math.random() * 50);
}

function createBoardLayout() {
    board.innerHTML = "";
    for (let i = 0; i < rowColumnCount; i++) {
        for (let j = 0; j < rowColumnCount; j++) {
            let div = document.createElement('div')
            div.className = "box";
            let chocolateCount = getChocolateCount();
            if (i === 0 && (j === 0 || j === rowColumnCount - 1)) {
                chocolateCount = 0;
            }
            if(!grid[i]) grid[i] = [];
            grid[i][j] = chocolateCount;
            div.innerText = chocolateCount;
            div.id = 'box-' + (i + 1) + '-' + (j + 1);
            board.appendChild(div);
        }
    }
    let layoutPartitionPercentage = (100 / rowColumnCount).toFixed(2);
    let partitionCss = '';
    for (let i = 0; i < rowColumnCount; i++) {
        partitionCss += (i === 0 ? `${layoutPartitionPercentage}%` : ` ${layoutPartitionPercentage}%`);
    }
    board.style['gridTemplateColumns'] = partitionCss;
    board.style['gridTemplateRows'] = partitionCss;
    if(isAutoPlay()) {
        setTimeout(() => {
            initiateAutoplay();
        }, 1000);
    } else {
        prepareRobos();
    }
}

function getElementCoords(element) {
    if (element) {
        let bounds = element.getBoundingClientRect()
        return [bounds.x, bounds.y];
    }
    return [];
}

function isAutoPlay () {
    return autoPlay?.checked ?? false;
}

function prepareRobos() {
    let box = document.getElementsByClassName('box');
    let roboDimensions = '150px';
    if (box.length > 0) {
        roboDimensions = box[0].offsetHeight / 2;
    }
    let robo1 = document.createElement('div');
    robo1.className = "robo selected";
    robo1.id = 'robo1';
    robo1.style.height = `${roboDimensions}px`;
    robo1.style.width = `${roboDimensions}px`;
    let robo2 = document.createElement('div');
    robo2.className = "robo";
    robo2.id = 'robo2';
    robo2.style.height = `${roboDimensions}px`;
    robo2.style.width = `${roboDimensions}px`;
    positionRobos(robo1, [...pos1]);
    positionRobos(robo2, [...pos2]);
}

function positionRobos(robo, coords) {
    let box = document.getElementById(`box-${coords[0]}-${coords[1]}`)
    if (box) {
        let fetchedScore = box.innerText;
        incrementTotal(fetchedScore);
        box.innerHTML = "";
        box.appendChild(robo);
    }
}

function clearRoboFromOldPosition(coords, roboName) {
    let box = document.getElementById(`box-${coords[0]}-${coords[1]}`)
    if (box) {
        box.innerHTML = "";
        box.className = "box visited-" + roboName
    }
}

function incrementTotal(score) {
    if (isScoreInBoxValid(score)) {
        total += parseInt(score);
    }
    if (currentScoreDisplay) {
        currentScoreDisplay.innerText = "Current Score : " + total;
    }
}

function isScoreInBoxValid(score) {
    try {
        if (score && parseInt(score)) {
            return true;
        }
    } catch (ex) {
        console.log("Got invalid score : ", score);
    }
    return false;
}

function clearGame() {
    numberInput.value = "";
    board.innerHTML = "";
    rowColumnCount = undefined;
    pos1 = undefined;
    pos2 = undefined;
    total = 0;
    grid = [];
    incrementTotal(0);
    gameDisplay.innerHTML = '';
    selectedRobo = undefined;
    gameStarted = false;
    enableDisableElements();
}

function updateHighScore() {
    if (total) {
        let cachedTotal = localStorage.getItem('game-total');
        try {
            if (cachedTotal && parseInt(cachedTotal)) {
                cachedTotal = Math.max(parseInt(cachedTotal), total);
                localStorage.setItem('game-total', cachedTotal);
                setHighScore();
            } else {
                localStorage.setItem('game-total', total);
                setHighScore();
            }
        } catch (err) {
            localStorage.setItem('game-total', total)
            setHighScore();
        }
    }
}

function enableDisableElements() {
    autoPlay.disabled = gameStarted;
    numberInput.disabled = gameStarted;
    startButton.disabled = gameStarted;
    resetButton.disabled = !gameStarted;
    clearButton.disabled = !gameStarted;
}

function setHighScore() {
    let totalCachedScore = localStorage.getItem('game-total');
    if (totalCachedScore) {
        let highScorePanel = document.getElementById('high-score-display');
        if (highScorePanel) {
            highScorePanel.innerText = "High Score : " + totalCachedScore;
        }
    }
}

function handleRoboMovement(event) {
    let keyCode = event.code ?? event.key;
    if (gameStarted && selectedRobo) {
        if (keyCode === 'ArrowDown') {
            handleRoboPositionOnKeyDown(RoboDirections.down);
        } else if (keyCode === 'ArrowLeft') {
            handleRoboPositionOnKeyDown(RoboDirections.diagonalLeft);
        } else if (keyCode === 'ArrowRight') {
            handleRoboPositionOnKeyDown(RoboDirections.diagonalRight);
        } else if (keyCode === 'Tab') {
            event.preventDefault();
            toggleSelectedRobo();
        }
    }
}

function handleRoboPositionOnKeyDown(direction) {
    let coords = selectedRobo === 'robo1' ? [...pos1] : [...pos2];
    if (direction === RoboDirections.down) {
        coords[0] = coords[0] + 1;
    } else if (direction === RoboDirections.diagonalLeft) {
        coords[0] = coords[0] + 1;
        coords[1] = coords[1] - 1;
    } else if (direction === RoboDirections.diagonalRight) {
        coords[0] = coords[0] + 1;
        coords[1] = coords[1] + 1;
    }
    if (isNewLocationValid(coords)) {
        const roboNode = document.getElementById(selectedRobo);
        clearRoboFromOldPosition(selectedRobo === 'robo1' ? [...pos1] : [...pos2], selectedRobo);
        if (selectedRobo === 'robo1') {
            pos1 = [...coords];
        } else {
            pos2 = [...coords];
        }
        positionRobos(roboNode, selectedRobo === 'robo1' ? [...pos1] : [...pos2]);
        toggleSelectedRobo();
        checkIfGameIsOver();
    }
}

function isNewLocationValid(coords) {
    if (coords[0] < 1 || coords[1] < 1 || coords[0] > rowColumnCount || coords[1] > rowColumnCount) return false;
    let conflictingRoboCoords = selectedRobo === 'robo1' ? [...pos2] : [...pos1];
    if (coords[0] === conflictingRoboCoords[0] && coords[1] === conflictingRoboCoords[1]) return false;
    return true;
}

function toggleSelectedRobo() {
    let selectionAllowed = false
    let newSelectionCoords = selectedRobo === 'robo1' ? [...pos2] : [...pos1];
    if (newSelectionCoords[0] <= rowColumnCount - 1) selectionAllowed = true;
    if (selectionAllowed) {
        selectedRobo = selectedRobo === 'robo1' ? 'robo2' : 'robo1';
        selectRoboBasedOnNewSelection();
    }
}

function checkIfGameIsOver() {
    if (pos1[0] === rowColumnCount && pos2[0] === rowColumnCount) {
        clearRoboFromOldPosition([...pos1], 'robo1');
        clearRoboFromOldPosition([...pos2], 'robo2');
        gameDisplay.innerText = `Game Over!! Your total is displayed on top left. Click on Reset Game button to reset the game board.`
        updateHighScore();
    }
}

function selectRoboBasedOnNewSelection() {
    let robo1 = document.getElementById('robo1');
    let robo2 = document.getElementById('robo2');
    robo1.className = selectedRobo === 'robo1' ? 'robo selected' : 'robo'
    robo2.className = selectedRobo === 'robo2' ? 'robo selected' : 'robo'
}

function maxChocolatesAndPaths(grid) {
    const R = grid.length;
    const C = grid[0].length;

    // Initialize the DP table
    const dp = Array.from({ length: R }, () =>
        Array.from({ length: C }, () => Array(C).fill(0))
    );
    const path = Array.from({ length: R }, () =>
        Array.from({ length: C }, () => Array(C).fill(null))
    );

    // Base case: last row
    for (let j1 = 0; j1 < C; j1++) {
        for (let j2 = 0; j2 < C; j2++) {
            if (j1 === j2) {
                dp[R - 1][j1][j2] = grid[R - 1][j1];
            } else {
                dp[R - 1][j1][j2] = grid[R - 1][j1] + grid[R - 1][j2];
            }
        }
    }

    // Fill DP table from bottom to top
    for (let i = R - 2; i >= 0; i--) {
        for (let j1 = 0; j1 < C; j1++) {
            for (let j2 = 0; j2 < C; j2++) {
                let maxChocolates = 0;
                let bestMoves = null;

                for (let nj1 of [j1 - 1, j1, j1 + 1]) {
                    for (let nj2 of [j2 - 1, j2, j2 + 1]) {
                        if (nj1 >= 0 && nj1 < C && nj2 >= 0 && nj2 < C) {
                            const chocolates = dp[i + 1][nj1][nj2];
                            if (chocolates > maxChocolates) {
                                maxChocolates = chocolates;
                                bestMoves = [nj1, nj2];
                            }
                        }
                    }
                }

                dp[i][j1][j2] =
                    grid[i][j1] +
                    (j1 === j2 ? 0 : grid[i][j2]) +
                    maxChocolates;
                path[i][j1][j2] = bestMoves;
            }
        }
    }

    // Recover paths
    const robot1Path = [];
    const robot2Path = [];
    let j1 = 0, j2 = C - 1;

    for (let i = 0; i < R; i++) {
        robot1Path.push(j1);
        robot2Path.push(j2);
        if (i < R - 1) {
            [j1, j2] = path[i][j1][j2];
        }
    }

    return {
        maxChocolates: dp[0][0][C - 1],
        robot1Path,
        robot2Path
    };
}

function initiateAutoplay () {
    let {maxChocolates, robot1Path, robot2Path} = maxChocolatesAndPaths([...grid]);
    incrementTotal(maxChocolates);
    let robo1FollowedPath = [], robo2FollowedPath = [];
    for(let i = 0; i < robot1Path.length; i++){
        let coords1 = [i+1, robot1Path[i] + 1];
        let coords2 = [i+1, robot2Path[i] + 1];
        robo1FollowedPath.push(coords1);
        robo2FollowedPath.push(coords2);
    }
    pos1 = [...robo1FollowedPath[robo1FollowedPath.length - 1]];
    pos2 = [...robo2FollowedPath[robo2FollowedPath.length - 1]];
    checkIfGameIsOver();
    highlightBoxesAfterAutoplay(robo1FollowedPath, robo2FollowedPath);
}

function highlightBoxesAfterAutoplay (robo1FollowedPath, robo2FollowedPath) {
    for(let i=0;i<robo1FollowedPath.length;i++) {
        let box1 = document.getElementById(`box-${robo1FollowedPath[i][0]}-${robo1FollowedPath[i][1]}`);
        let box2 = document.getElementById(`box-${robo2FollowedPath[i][0]}-${robo2FollowedPath[i][1]}`);
        box1.className = "box visited-robo1";
        box2.className = "box visited-robo2";
        box1.innerHTML = "";
        box2.innerHTML = "";
    }
}

init();