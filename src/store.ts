import { configureStore } from "@reduxjs/toolkit";
import tabsReducer from './slices/tabsSlice';
import entriesReducer from './slices/entriesSlice';

const store = configureStore({
    reducer: {
        tabs: tabsReducer,
        entries: entriesReducer,
    },
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({
        serializableCheck: false
    }),
});

export default store;