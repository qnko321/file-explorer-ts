import TabObject from "./TabObject";

class TabData {
    path: string;
    title: string;
    selectedEntries: number[];
    searchFor: string;
    history: string[];
    historyCursor: number;

	/// Provide a valid path in the file system or undefined to list the drives
    constructor(path: string | undefined) {
        if (path === "drives" || path === undefined) {
			path = "drives"
            this.path = path;
            this.title = "Drives";
            this.selectedEntries = [];
            this.searchFor = "";
            this.history = [path];
            this.historyCursor = 0;
        } else {
            this.path = path;
            this.title = getTitleFromPath(path);
            this.selectedEntries = [];
            this.searchFor = "";
            this.history = [path];
            this.historyCursor = 0;
        }
    }

    public async handleOpenNew(newPath: string) {
        if (newPath === this.history[this.historyCursor]) {
            return;
        }
 
        if (this.historyCursor === this.history.length - 1) {
            this.history.push(newPath);
            this.historyCursor += 1;
        } else {
            this.history = this.history.slice(0, this.historyCursor + 1);
            this.history.push(newPath);
            this.historyCursor = this.history.length - 1;
        }
        
		this.path = newPath;
        this.title = getTitleFromPath(this.path);
    }

    public async navigateBack() {
        if (this.historyCursor - 1 < 0) {
            return;
        }

        this.historyCursor -= 1;
        this.path = this.history[this.historyCursor];
        this.title = getTitleFromPath(this.path);
        this.selectedEntries = [];
    }

    public navigateForward() {
        if (this.historyCursor + 1 > this.history.length - 1) {
            return;
        }

        this.historyCursor += 1;
        this.path = this.history[this.historyCursor];
        this.title = getTitleFromPath(this.path);
        this.selectedEntries = [];
    }

    public toObject(): TabObject {
        return {
            path: this.path,
            title: this.title,
            selectedEntries: this.selectedEntries,
            searchFor: this.searchFor,
            history: this.history,
            historyCursor: this.historyCursor
        } as TabObject;
    }
    
    public static fromObject(object: TabObject): TabData {
        const data = new TabData(object.path);
        data.path = object.path;
        data.title = object.title;
        data.selectedEntries = object.selectedEntries;
        data.searchFor = object.searchFor;
        data.history = object.history;
        data.historyCursor = object.historyCursor;

        return data;
    }
}

function getTitleFromPath(path: string) {
    if (path === 'drives') {
        return "Drives";
    }

	const dirs = path.split('\\');
	var title = dirs[dirs.length - 1];
    if (title === '') {
        var title = "Drive " + dirs[dirs.length - 2][0];
    }
    
	return title;
}

export default TabData;