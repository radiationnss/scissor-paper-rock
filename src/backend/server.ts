import WebSocket, { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

console.log("WebSocket server is running on ws://localhost:8080");

const players: WebSocket[] = [];
const choices: { [key: string]: string } = {};

wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected');
    players.push(ws);

    if (players.length === 2) {
        players.forEach((player) => {
            player.send('Game starts! Make your choice.');
        });
    }

    ws.on('message', (message: string) => {
        const playerIndex = players.indexOf(ws);
        const choice = message.toString().toLowerCase();
        choices[playerIndex] = choice;

        console.log(`Player ${playerIndex + 1} chose: ${choice}`);

        if (Object.keys(choices).length === 2) {
            const [player1Choice, player2Choice] = [choices[0], choices[1]];
            const result = determineWinner(player1Choice, player2Choice);

            players.forEach((player, index) => {
                player.send(`You chose ${choices[index]}, opponent chose ${choices[1 - index]}. ${result}`);
            });

            // Reset choices for the next round
            Object.keys(choices).forEach((key) => delete choices[key]);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        const playerIndex = players.indexOf(ws);
        players.splice(playerIndex, 1);
        delete choices[playerIndex];
    });
});

function determineWinner(choice1: string, choice2: string): string {
    if (choice1 === choice2) {
        return 'It\'s a tie!';
    } else if (
        (choice1 === 'rock' && choice2 === 'scissors') ||
        (choice1 === 'paper' && choice2 === 'rock') ||
        (choice1 === 'scissors' && choice2 === 'paper')
    ) {
        return 'Player 1 wins!';
    } else {
        return 'Player 2 wins!';
    }
}
