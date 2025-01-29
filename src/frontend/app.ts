const ws = new WebSocket('ws://localhost:8080');
const playerName = document.getElementById('playerName') as HTMLDivElement;
const resultDiv = document.getElementById('result') as HTMLDivElement;
const buttons = document.querySelectorAll('.choices button');
const startGame = document.getElementById('startGame') as HTMLButtonElement;

localStorage.clear();

let sessionId: string | null = null; // Ensure sessionId starts as null

// Disable choice buttons initially
buttons.forEach(button => ((button as HTMLButtonElement).disabled = true));

ws.onopen = () => {
    console.log('Connected to WebSocket ✅');
    resultDiv.textContent = 'Connected! Click "Start Game" to begin.';
};

ws.onmessage = (event) => {
    const message = JSON.parse(event.data);

    if (message.type === 'session') {
        sessionId = message.sessionId;
        console.log(`sessionId: ${sessionId}`);
        localStorage.setItem('sessionId', message.sessionId); // Store sessionId
        playerName.textContent = `You are ${message.playerName}`;
    } else if (message.type === 'result') {
        let WinLose = 'Lose';
        if (localStorage.getItem('sessionId') === message.sessionId) {
            WinLose = "Win";
        }
        if (message.sessionId === '0') {
            WinLose = "Tie";
        }
        resultDiv.textContent = `${WinLose}, You chose ${message.yourChoice}, opponent chose ${message.opponentChoice}`;

        // Enable "Start Game" for the next round
        startGame.disabled = false;
    }
};

// Handle WebSocket errors
ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    resultDiv.textContent = 'Connection error. Please try again.';
};

// Handle WebSocket close
ws.onclose = () => {
    console.log('WebSocket connection closed ❌');
    resultDiv.textContent = 'Connection closed. Refresh to reconnect.';
};

// Start Game Button Logic
if (startGame) {
    startGame.addEventListener('click', () => {
        if (!sessionId) {
            console.error('sessionId not set');
            return;
        }

        ws.send(JSON.stringify({ sessionId, choice: true })); // Indicate readiness

        // Enable choice buttons
        buttons.forEach(button => ((button as HTMLButtonElement).disabled = false));
        startGame.disabled = true; // Disable "Start Game" while waiting for choices
    });
}

// Choice Buttons Logic
buttons.forEach((button) => {
    button.addEventListener('click', () => {
        if (!sessionId) {
            console.error(`sessionId not set`);
            return;
        }

        const choice = button.id; // rock, paper, or scissors
        ws.send(JSON.stringify({ sessionId, choice }));

        // Disable all buttons after making a choice
        buttons.forEach(btn => (btn as HTMLButtonElement).disabled = true);
    });
});
