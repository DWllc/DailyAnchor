// This makes the app's existing window.storage.get/set/delete calls work
// in a real browser, by saving everything to localStorage on the person's
// own device. No backend, no account system - matches how the app already
// behaved, just running for real instead of inside the Claude preview.

const PREFIX = "daily-anchor:";

window.storage = {
  get: async (key, _shared) => {
    const value = localStorage.getItem(PREFIX + key);
    if (value === null) {
      throw new Error("not found");
    }
    return { key, value, shared: false };
  },
  set: async (key, value, _shared) => {
    localStorage.setItem(PREFIX + key, value);
    return { key, value, shared: false };
  },
  delete: async (key, _shared) => {
    localStorage.removeItem(PREFIX + key);
    return { key, deleted: true, shared: false };
  },
};
