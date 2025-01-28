import WebSocket, { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';

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
            const [player1, player2] = Array.from(sessions.entries()).map(([sessionId, value]) => ({
                sessionId,
                ...value,
            }));


            const result = determineWinner(player1, player2);
            player1.ws.send(JSON.stringify({ type: 'result', yourChoice: player1.data.choice, opponentChoice: player2.data.choice, sessionId: result }));
            player2.ws.send(JSON.stringify({ type: 'result', yourChoice: player2.data.choice, opponentChoice: player1.data.choice, sessionId: result }));

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

function determineWinner(player1: any, player2: any): string {
    let choice1 = player1.data.choice;
    let choice2 = player2.data.choice;
    if (choice1 === choice2) {
        return 'It\'s a tie!';
    } else if (
        (choice1 === 'rock' && choice2 === 'scissors') ||
        (choice1 === 'paper' && choice2 === 'rock') ||
        (choice1 === 'scissors' && choice2 === 'paper')
    ) {
        return player1.sessionId;
    } else {
        return player2.sessionId;
    }
}
