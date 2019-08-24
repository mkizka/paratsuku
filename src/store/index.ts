import Vue from 'vue';

class Store {
  private _count = 0;

  public get count() {
    return this._count;
  }

  public increment() {
    this._count++;
  }

  public decrement() {
    this._count--;
  }
}

export const storeInstance = Vue.observable(new Store());
