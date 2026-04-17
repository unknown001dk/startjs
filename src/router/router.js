import { TrieRouter } from "./trie.js";

export class Router {
  constructor() {
    this.trie = new TrieRouter();
  }

  register(method, path, handlers) {
    this.trie.register(method, path, handlers);
  }

  match(method, path) {
    return this.trie.match(method, path);
  }
}
