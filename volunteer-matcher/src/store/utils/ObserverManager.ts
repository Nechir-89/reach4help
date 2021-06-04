import { SubscribeFunction } from '../types';

export interface IObserverManager {
  isSubscribed(observerName: string): boolean;
  register(observerName: string, subscribe: SubscribeFunction): void;
  unsubscribe(observerName: string): boolean;
}

interface ObserverInfo {
  unsubscribe: Function;
  numberOfListeners: number;
}
class ObserverManager {
  private static instance: IObserverManager;

  private subscribedObservers: Record<string, ObserverInfo>;

  constructor() {
    this.subscribedObservers = {};
  }

  public static getInstance(): IObserverManager {
    if (!ObserverManager.instance) {
      ObserverManager.instance = new ObserverManager();
    }

    return ObserverManager.instance;
  }

  public isSubscribed = (observerName: string): boolean =>
    !!this.subscribedObservers[observerName];

  public unsubscribe = (observerName: string): boolean => {
    if (!this.subscribedObservers[observerName]) {
      return false;
    }
    this.subscribedObservers[observerName].numberOfListeners -= 1;

    if (this.subscribedObservers[observerName].numberOfListeners <= 0) {
      this.subscribedObservers[observerName].unsubscribe();
      return true;
    }
    return false;
  };

  public register = (observerName: string, subscribe: SubscribeFunction) => {
    if (this.isSubscribed(observerName)) {
      this.subscribedObservers[observerName].numberOfListeners += 1;
      return;
    }
    const unsubscribe = subscribe();
    this.subscribedObservers[observerName] = {
      numberOfListeners: 1,
      unsubscribe,
    };
  };
}

export default ObserverManager;
