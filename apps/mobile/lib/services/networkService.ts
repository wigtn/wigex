import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

type NetworkListener = (isConnected: boolean) => void;

class NetworkService {
  private listeners: Set<NetworkListener> = new Set();
  private isConnected: boolean = true;
  private unsubscribe: (() => void) | null = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    this.unsubscribe = NetInfo.addEventListener(this.handleConnectivityChange);
  }

  private handleConnectivityChange = (state: NetInfoState) => {
    const wasConnected = this.isConnected;
    this.isConnected = state.isConnected ?? false;

    // Notify listeners when reconnected
    if (!wasConnected && this.isConnected) {
      this.notifyListeners(true);
    } else if (wasConnected && !this.isConnected) {
      this.notifyListeners(false);
    }
  };

  private notifyListeners(isConnected: boolean) {
    this.listeners.forEach((listener) => {
      try {
        listener(isConnected);
      } catch (error) {
        console.error('Network listener error:', error);
      }
    });
  }

  subscribe(listener: NetworkListener): () => void {
    this.listeners.add(listener);
    // Immediately notify with current state
    listener(this.isConnected);
    return () => this.listeners.delete(listener);
  }

  async checkConnection(): Promise<boolean> {
    const state = await NetInfo.fetch();
    this.isConnected = state.isConnected ?? false;
    return this.isConnected;
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }

  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.listeners.clear();
  }
}

export const networkService = new NetworkService();
