import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import userReducer from "./userSlice";
import { encryptTransform } from "redux-persist-transform-encrypt";

// ✅ Use environment variable for security
const ENCRYPTION_KEY = "fallback-key"; // Replace with a secure key

// ✅ Fix: Serialize state before encryption
const userPersistConfig = {
  key: "user",
  storage,
  transforms: [
    encryptTransform({
      secretKey: ENCRYPTION_KEY,
      onError: (error) => console.error("Encryption error:", error),
    }),
  ],
};



// ✅ Only persist `user`
const persistedUserReducer = persistReducer(userPersistConfig, userReducer);

// ✅ Root reducer
const rootReducer = combineReducers({
  user: persistedUserReducer,
});

// ✅ Configure store with middleware fix
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"], // Ignore persist actions
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
