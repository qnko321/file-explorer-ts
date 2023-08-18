import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import TabData from '../components/Center/DirectoryWindow/TabData';
import TabObject from '../components/Center/DirectoryWindow/TabObject';

interface TabsState {
    currentTabIndex: number,
    data: TabObject[]
};

type CreatePayload = {
    path: string | undefined,
}

type OpenPayload ={
    path: string | undefined,
    newTab: boolean,
}

type SelectTabPayload ={
    index: number,
}

type SearchPayload ={
    searchFor: string,
}

type ClosePayload = number;
type SelectEntryPayload = number;

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
            state.data = state.data.filter((_, index) => index !== action.payload);
            if (state.currentTabIndex === action.payload) {
                state.currentTabIndex = state.data.length - 1;
            }
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
            if (state.data[state.currentTabIndex].selectedEntries.includes(action.payload)) {
                state.data[state.currentTabIndex].selectedEntries = state.data[state.currentTabIndex].selectedEntries.filter((entryIndex, _) => entryIndex !== action.payload);
            } else {
                state.data[state.currentTabIndex].selectedEntries.push(action.payload);
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