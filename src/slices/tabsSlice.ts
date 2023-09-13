import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import TabData from '../components/Center/DirectoryWindow/TabData';
import TabObject from '../intefaces/TabObject';

interface TabsState {
    currentTabIndex: number,
    data: TabObject[]
};

type ClosePayload = number;

type CreatePayload = {
    path: string | undefined,
}

type OpenPayload = {
    path: string | undefined,
    newTab: boolean,
}

type SelectTabPayload = {
    index: number,
}

type SearchPayload = {
    searchFor: string,
}

type SelectEntryPayload = {
    index: number,
    path: string,
    isDir: boolean,
};

export const tabSlice = createSlice({
    name: 'tabs',
    initialState: {
        currentTabIndex:-1,
        data: [] as TabObject[],
    } as TabsState,
    reducers: {
        create: (state, action: PayloadAction<CreatePayload>) => {
            const tab = new TabData(action.payload.path);
            state.data.push(tab.toObject());
            state.currentTabIndex = state.data.length - 1
        },
        close: (state, action: PayloadAction<ClosePayload>) => {
            if (state.data.length - 1 < action.payload) { 
                return;
            }
            if (state.currentTabIndex === action.payload) {
                state.currentTabIndex = state.data.length - 1;
            }
            state.data = state.data.filter((_, index) => index !== action.payload);
            
        },
        open: (state, action: PayloadAction<OpenPayload>) => {
            if (action.payload.newTab) {
                const tabData = new TabData(action.payload.path);
                const tabObject = tabData.toObject();
                state.data.push(tabObject);
                state.currentTabIndex = state.data.length - 1;
            } else {
                if (state.currentTabIndex === -1) {
                    return;
                }
                const tabData = TabData.fromObject(state.data[state.currentTabIndex]);
                tabData.handleOpenNew(action.payload.path as string);
                const tabObject = tabData.toObject();
                state.data[state.currentTabIndex] = tabObject;
            }
            

        },
        selectTab: (state, action: PayloadAction<SelectTabPayload>) => {
            if (state.data.length - 1 < action.payload.index) {
                return;
            }

            state.currentTabIndex = action.payload.index;
        },
        selectEntry: (state, action: PayloadAction<SelectEntryPayload>) => {
            if (state.data[state.currentTabIndex].selectedEntries.some(entry => entry.index === action.payload.index && entry.path === action.payload.path)) {
                state.data[state.currentTabIndex].selectedEntries = state.data[state.currentTabIndex].selectedEntries.filter((entry, _) => entry.index !== action.payload.index);
            } else {
                state.data[state.currentTabIndex].selectedEntries.push({
                    index: action.payload.index,
                    path: action.payload.path,
                    isDir: action.payload.isDir,
                } as SelectedEntry);
            }
        },
        navigateBack: (state) => {
            if (state.currentTabIndex === -1) {
                return;
            }

            const tabData = TabData.fromObject(state.data[state.currentTabIndex]);
            tabData.navigateBack();
            const tabObject = tabData.toObject();
            state.data[state.currentTabIndex] = tabObject;
        },
        navigateForward: (state) => {
            if (state.currentTabIndex === -1) {
                return;
            }

            const tabData = TabData.fromObject(state.data[state.currentTabIndex]);
            tabData.navigateForward();
            const tabObject = tabData.toObject();
            state.data[state.currentTabIndex] = tabObject;
        },
        searchTab: (state, action: PayloadAction<SearchPayload>) => {
            state.data[state.currentTabIndex].searchFor = action.payload.searchFor;
        }
    }
})

export const {
    create,
    close,
    selectTab,
    selectEntry,
    open,
    navigateBack,
    navigateForward,
    searchTab,
 } = tabSlice.actions;
export default tabSlice.reducer;