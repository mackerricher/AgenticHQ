import { apiRequest } from "./queryClient";

export interface ChatResponse {
  assistantMessage: string;
  planId?: number;
  steps?: any[];
}

export interface KeyStatus {
  hasKey: boolean;
  updatedAt?: string;
  keyPreview?: string;
}

export const api = {
  chat: {
    send: async (userMessage: string, clientId?: number): Promise<ChatResponse> => {
      const endpoint = clientId ? `/api/chat/send/${clientId}` : "/api/chat";
      const response = await apiRequest("POST", endpoint, { message: userMessage });
      return response.json();
    },
    
    getHistory: async (clientId?: number) => {
      const endpoint = clientId ? `/api/chat/history/${clientId}` : "/api/chat/history";
      const response = await apiRequest("GET", endpoint);
      return response.json();
    },
    
    clearHistory: async () => {
      const response = await apiRequest("DELETE", "/api/chat/history");
      return response.json();
    },
  },

  plans: {
    get: async (id: number) => {
      const response = await apiRequest("GET", `/api/plans/${id}`);
      return response.json();
    },
    
    events: (id: number) => {
      return new EventSource(`/api/plans/${id}/events`);
    },
  },

  keys: {
    get: async (provider: string): Promise<KeyStatus> => {
      const response = await apiRequest("GET", `/api/keys/${provider}`);
      return response.json();
    },
    
    set: async (provider: string, key: string) => {
      const response = await apiRequest("POST", `/api/keys/${provider}`, { key });
      return response.json();
    },
    
    delete: async (provider: string) => {
      const response = await apiRequest("DELETE", `/api/keys/${provider}`);
      return response.json();
    },
    
    test: async (provider: string) => {
      const response = await apiRequest("POST", `/api/keys/${provider}/test`);
      return response.json();
    },
  },
};
