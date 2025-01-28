const ws = new WebSocket('ws://localhost:8080');

const playerName = document.getElementById('playerName') as HTMLDivElement;
const resultDiv = document.getElementById('result') as HTMLDivElement;
const buttons = document.querySelectorAll('.choices button');

let sessionId: string | null = null;

// Handle WebSocket connection
ws.onopen = () => {
    console.log('Connected to WebSocket helo');
    resultDiv.textContent = 'Connected! Make your choice.';
};

// Handle WebSocket messages
ws.onmessage = (event) => {
    console.log(event);
    const message = JSON.parse(event.data);

    if (message.type == 'session') {
        sessionId = message.sessionId;
        console.log(`sessionId: ${sessionId}`);

        playerName.textContent = `You are ${message.playerName}`;
    } else if (message.type === 'result') {
        resultDiv.textContent = `You chose ${message.yourChoice}, opponent chose ${message.opponentChoice}. ${message.result}`
    }
};

// Handle WebSocket errors
ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    resultDiv.textContent = 'Connection error. Please try again.';
};

// Handle WebSocket close
ws.onclose = () => {
    console.log('WebSocket connection closed');
    resultDiv.textContent = 'Connection closed. Refresh to reconnect.';
};

// Add event listeners to buttons
buttons.forEach((button) => {
    button.addEventListener('click', () => {
        if (!sessionId) {
            console.error(`sessionId not set`);
            return;

        }
        const choice = button.id; // rock, paper, or scissors
        ws.send(JSON.stringify({ sessionId, choice }));
    });
});
