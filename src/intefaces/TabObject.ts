interface TabObject {
    path: string;
    title: string;
    selectedEntries: SelectedEntry[];
    searchFor: string;
    history: string[];
    historyCursor: number;
}

export default TabObject;