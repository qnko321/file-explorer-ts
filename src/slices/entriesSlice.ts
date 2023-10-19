import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { invoke } from '@tauri-apps/api';
import { emit } from '@tauri-apps/api/event';

export const entriesSlice = createSlice({
    name: 'entries',
    initialState: {},
    reducers: {
        
    },
    extraReducers(builder) {
        builder
            .addCase(getEntries.pending, (state, action) => {
                
            })
            .addCase(getEntries.fulfilled, (state, action) => {
                state[`${action.payload.path}`] = action.payload.response;
            })
            .addCase(getEntries.rejected, (state, action) => {
                emit('display-error', {
                    error: action.payload//.error + " (" + action.payload.path + ")",
                });
            })
            
            .addCase(refreshEntries.fulfilled, (state, action) => {
                state[`${action.payload.path}`] = action.payload.response;
            })
            ;
    },
})

export const refreshEntries = createAsyncThunk("refreshEntries", async (qnko, thunkAPI) => {
    const state = thunkAPI.getState();
    
    if (state === undefined) {
        return;
    }

    //@ts-ignore
    const path = state.tabs.data[state.tabs.currentTabIndex].path;
    
    try {
        const response = await invoke("get_directory_content", {
            path,
        });

        return {
            path,
            response,
        };
    } catch (error) {
        return thunkAPI.rejectWithValue({error, path});
    }  
});

export const getEntries = createAsyncThunk("getEntries", async (qnko, thunkAPI) => {
    const state: any = thunkAPI.getState();
    
    if (state === undefined) {
        return {
            path: "",
            response: [],
        }
    }

    const entries = state.entries;
    const path = state.tabs.data[state.tabs.currentTabIndex].path;
    if (entries[`${path}`] !== undefined) {
        return {
            path,
            response: entries[`${path}`],
        };
    } else {
        try {
            const response = await invoke("get_directory_content", {
                path,
            });
    
            return {
                path,
                response,
            };
        } catch (error) {
            return thunkAPI.rejectWithValue({error, path});
        }  
    }
});

export const {
    
 } = entriesSlice.actions;
export default entriesSlice.reducer;