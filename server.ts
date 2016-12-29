import * as WebSocket from "ws";

export type HeartbeatOption = Partial<{
    pingTimeout: number;
}>;

export function setWsHeartbeat(wss: WebSocket.Server, pong: (ws: WebSocket, data: any, binary: boolean) => void, pingTimeout: number = 60000) {
    const connections = new Set<WebSocket>();
    wss.addListener("connection", ws => {
        connections.add(ws);
        ws.addListener("message", (data, flag) => {
            connections.add(ws);
            pong(ws, data, flag.binary);
        });
    });
    setInterval(() => {
        for (const ws of wss.clients) {
            if (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN) {
                if (!connections.has(ws)) {
                    ws.close();
                }
            }
        }
        connections.clear();
    }, pingTimeout);
}
