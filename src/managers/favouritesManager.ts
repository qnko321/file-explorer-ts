const data: {
    favourites: string[],
} = {
    favourites: [],
};

const addFavourite = (path: string) => {
    data["favourites"] = [...data["favourites"], path];
    console.log(data);
    
}