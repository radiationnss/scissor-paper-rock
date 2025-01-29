import WebSocket, { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';

const wss = new WebSocketServer({ port: 8080 });

console.log("WebSocket server is running on ws://localhost:8080");

const sessions = new Map<string, { ws: WebSocket; data: { ready: boolean; choice: string | null } }>();
let playerNumber: number = 0;

wss.on('connection', (ws: WebSocket) => {
    playerNumber++;
    const sessionId = uuidv4();
    sessions.set(sessionId, { ws, data: { ready: false, choice: null } });

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
        if (data.choice === true) {
            session.data.ready = true;
            console.log(`Player ${data.sessionId} is ready.`);

            if (sessions.size === 2 && Array.from(sessions.values()).every((s) => s.data.ready)) {
                console.log("Both players are ready! Game can now start.");

                sessions.forEach((s) => {
                    s.ws.send(JSON.stringify({ type: 'gameStart' }));
                });
            }
        } else if (typeof data.choice === 'string') {
            session.data.choice = data.choice;
            console.log(`Player with session ID ${data.sessionId} chose: ${data.choice}`);
            if (sessions.size === 2 && Array.from(sessions.values()).every((s) => s.data.choice !== null)) {
                console.log("Both players have made their choices!");

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
                console.log("Waiting for the next round...");
            }
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
        return '0';
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
