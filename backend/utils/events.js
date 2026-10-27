// Live updates for the staff dashboard (Server-Sent Events).
// Every open dashboard keeps one connection; when data changes we broadcast a
// topic name ("appointments", "doctors", "messages", "medicines", "orders")
// and the pages showing that data refetch it.
const clients = new Set();

export const subscribe = (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no", // don't let proxies buffer the stream
  });
  res.flushHeaders();
  res.write("retry: 3000\n\n");

  const client = { res, user: req.user };
  clients.add(client);

  // Comment lines keep idle connections open through proxies/load balancers
  const heartbeat = setInterval(() => res.write(": ping\n\n"), 25000);
  req.on("close", () => {
    clearInterval(heartbeat);
    clients.delete(client);
  });
};

export const broadcast = (...topics) => {
  const payload = `data: ${JSON.stringify({ topics, at: Date.now() })}\n\n`;
  for (const { res } of clients) {
    res.write(payload);
  }
};
