const ws = new WebSocket('ws://localhost:8080');

const resultDiv = document.getElementById('result') as HTMLDivElement;
const buttons = document.querySelectorAll('.choices button');

// Handle WebSocket connection
ws.onopen = () => {
    console.log('Connected to WebSocket server');
    resultDiv.textContent = 'Connected! Make your choice.';
};

// Handle WebSocket messages
ws.onmessage = (event) => {
    const message = event.data;
    resultDiv.textContent = message;
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
        const choice = button.id; // rock, paper, or scissors
        ws.send(choice);
    });
});
