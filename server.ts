import { WebSocket } from "./types";

export function setWsHeartbeat(wss: WebSocket.Server, pong: (ws: WebSocket, data: any, binary: boolean) => void, pingTimeout: number = 60000) {
    const connections = new Set<WebSocket>();
    wss.addListener("connection", ws => {
        connections.add(ws);
        ws.addListener("message", (data) => {
            connections.add(ws);
            pong(ws, data, typeof data !== "string");
        });
    });
    const handle = setInterval(() => {
        for (const ws of wss.clients) {
            if (ws.readyState === ws.CONNECTING || ws.readyState === ws.OPEN) {
                if (!connections.has(ws)) {
                    ws.close();
                }
            }
        }
        connections.clear();
    }, pingTimeout);
    wss.addListener("close", () => {
        clearInterval(handle)
    })
}
