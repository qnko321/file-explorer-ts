interface TabObject {
    path: string;
    title: string;
    selectedEntries: number[];
    searchFor: string;
    history: string[];
    historyCursor: number;
}

export default TabObject;