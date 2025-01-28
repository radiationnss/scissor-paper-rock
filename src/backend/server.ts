import WebSocket, { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { log } from 'console';
// import { log } from 'console';

const wss = new WebSocketServer({ port: 8080 });

console.log("WebSocket server is running on ws://localhost:8080");

const sessions = new Map<string, { ws: WebSocket; data: any }>();
let playerNumber: number = 0;

wss.on('connection', (ws: WebSocket) => {
    playerNumber++;
    const sessionId = uuidv4();
    sessions.set(sessionId, { ws, data: {} });

    let playerName = `Player ${playerNumber}`;
    console.log(`Client connected with sessionId: ${sessionId} & ${playerName}`);

    ws.send(JSON.stringify({ type: 'session', sessionId, playerName }));



    ws.on('message', (message: string) => {
        const data = JSON.parse(message);


        if (!data.sessionId || !sessions.has(data.sessionId)) {
            console.error('Invalid sessionId');
            return;

        }

        const session = sessions.get(data.sessionId);
        if (!session) return;
        session.data.choice = data.choice;
        console.log(`player with session ID ${data.sessionId} chose: ${data.choice}`);


        if (sessions.size === 2 && Array.from(sessions.values()).every((s) => s.data.choice)) {
            console.log("Both players have made their choice");
            const [player1, player2] = Array.from(sessions.values());
            const result = determineWinner(player1.data.choice, player2.data.choice);
            player1.ws.send(JSON.stringify({ type: 'result', result, yourChoice: player1.data.choice, opponentChoice: player2.data.choice }));
            player2.ws.send(JSON.stringify({ type: 'result', result, yourChoice: player2.data.choice, opponentChoice: player1.data.choice }));

            sessions.forEach((session) => {
                session.data.choice = null;
            });
        }

    });


    ws.on('close', () => {
        console.log(`Client with session ID ${sessionId} disconnected`);
        sessions.delete(sessionId);
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
