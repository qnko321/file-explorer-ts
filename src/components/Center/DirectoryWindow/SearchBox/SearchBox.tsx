import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { searchTab } from "../../../../slices/tabsSlice";

interface SearchBoxProps {
    searchFor: string,
}

const SearchBox: React.FC<SearchBoxProps> = ({searchFor}) => {
    const dispatch = useDispatch();

    const [search, setSearch] = useState<string>(searchFor);
    const [lastSearchFor, setLastSearchFor] = useState<string>(searchFor);

    useEffect(() => {
        if (searchFor !== lastSearchFor) {
            setLastSearchFor(searchFor);
            setSearch(searchFor);
        }
    });

    const handleSearchOnChange = (e) => {
        const searchFor = e.target.value;
        setSearch(searchFor);
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            dispatch(searchTab({
                searchFor: search
            }));
        }
    }

    return (
        <div className="search-box">
            <input 
                type="text" 
                value={search} 
                onChange={handleSearchOnChange}
                onKeyDown={handleKeyDown}
            />
        </div>
    )
}

export default SearchBox;