import { configureStore } from "@reduxjs/toolkit";
import tabsReducer from './slices/tabsSlice';

const store = configureStore({
    reducer: {
        tabs: tabsReducer,
    },
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({
        serializableCheck: false
    }),
});

export default store;