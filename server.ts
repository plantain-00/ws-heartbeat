export interface WebSocketServerBase {
    addListener: (name: "connection", listener: (ws: WebSocketBase) => void) => void;
    clients: WebSocketBase[];
}

export interface WebSocketBase {
    readyState: number;
    CONNECTING: number;
    OPEN: number;
    addListener: (name: "message", listener: (data: any, flag: { binary: boolean }) => void) => void;
    close(): void;
    emit(data: any): void;
}

export function setWsHeartbeat(wss: WebSocketServerBase, pong: (ws: WebSocketBase, data: any, binary: boolean) => void, pingTimeout: number = 60000) {
    const connections = new Set<WebSocketBase>();
    wss.addListener("connection", ws => {
        connections.add(ws);
        ws.addListener("message", (data, flag) => {
            connections.add(ws);
            pong(ws, data, flag.binary);
        });
    });
    setInterval(() => {
        for (const ws of wss.clients) {
            if (ws.readyState === ws.CONNECTING || ws.readyState === ws.OPEN) {
                if (!connections.has(ws)) {
                    ws.close();
                }
            }
        }
        connections.clear();
    }, pingTimeout);
}
