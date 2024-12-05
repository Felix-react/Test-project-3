import { findServer } from "../src/findServer";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("findServer", () => {
  const servers = [
    { url: "https://does-not-work.perfume.new", priority: 1 },
    { url: "https://gitlab.com", priority: 4 },
    { url: "http://app.scnt.me", priority: 3 },
    { url: "https://offline.scentronix.com", priority: 2 },
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should resolve with the online server having the lowest priority", async () => {
    mockedAxios.get.mockImplementation((url) => {
      if (url === "https://gitlab.com") {
        return Promise.resolve({ status: 200 });
      }
      if (url === "http://app.scnt.me") {
        return Promise.resolve({ status: 200 });
      }
      return Promise.reject(new Error("Network error"));
    });

    const result = await findServer(servers);
    expect(result).toEqual({ url: "http://app.scnt.me", priority: 3 });
  });

  it("should reject with an error if no servers are online", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network error"));

    await expect(findServer(servers)).rejects.toThrow("No servers are online");
  });

  it(
    "should timeout if a request takes too long",
    async () => {
      mockedAxios.get.mockImplementation(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error("timeout of 5000ms exceeded")), 6000);
          })
      );
  
      await expect(findServer(servers)).rejects.toThrow("No servers are online");
    },
    10000 // Extend timeout for the test
  );
});
