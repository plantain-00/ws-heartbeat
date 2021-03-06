export type WsHeartbeatOption = Partial<{
    pingInterval: number;
    pingTimeout: number;
}>;

export type WebSocketBase = {
    close: () => void;
    send: (data: any) => void;
    addEventListener: (name: "message" | "close", listener: (e: any) => void) => void;
};

export function setWsHeartbeat(ws: WebSocketBase, pingMessage: string, option?: WsHeartbeatOption) {
    let pingInterval = 25000;
    let pingTimeout = 60000;
    if (option) {
        if (typeof option.pingInterval === "number") {
            pingInterval = option.pingInterval;
        }
        if (typeof option.pingTimeout === "number") {
            pingTimeout = option.pingTimeout;
        }
    }
    let messageAccepted = false;
    ws.addEventListener("message", (e: any) => {
        messageAccepted = true;
    });
    const pingTimer = setInterval(() => {
        try {
            ws.send(pingMessage);
        } catch (_) {
            // do nothing
        }
    }, pingInterval);
    const timeoutTimer = setInterval(() => {
        if (!messageAccepted) {
            ws.close();
        } else {
            messageAccepted = false;
        }
    }, pingTimeout);
    ws.addEventListener("close", (e: any) => {
        clearInterval(pingTimer);
        clearInterval(timeoutTimer);
    });
}
