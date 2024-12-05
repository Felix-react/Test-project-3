import axios from "axios";

interface Server {
  url: string;
  priority: number;
}

/**
 * Function to find the online server with the lowest priority
 * @param servers - List of servers to check
 * @returns Promise<Server> - Resolves with the online server having the lowest priority or rejects with an error
 */
export async function findServer(servers: Server[]): Promise<Server> {
  const TIMEOUT = 5000; // Timeout in milliseconds

  const serverChecks = servers.map((server) =>
    axios
      .get(server.url, { timeout: TIMEOUT })
      .then((response) => {
        if (response.status >= 200 && response.status < 300) {
          return server; // Server is online
        }
        throw new Error("Server responded with non-2xx status code");
      })
      .catch(() => null) // Treat failed requests as offline
  );

  const results = await Promise.all(serverChecks);
  const onlineServers = results.filter((server): server is Server => server !== null);

  if (onlineServers.length === 0) {
    throw new Error("No servers are online");
  }

  return onlineServers.reduce((lowest, current) =>
    current.priority < lowest.priority ? current : lowest
  );
}
