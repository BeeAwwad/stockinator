import { openDB } from "idb";

export const offlineDB = await openDB("inventory_offline", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("pending_transactions")) {
      db.createObjectStore("pending_transactions", { keyPath: "id" });
    }
  },
});
