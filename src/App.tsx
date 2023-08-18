import { Provider, useDispatch } from "react-redux";
import Center from "./components/Center/Center";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import store from "./store";
import { emit } from "@tauri-apps/api/event";
const App: React.FC = () => {

    return (
        <Provider store={store}>
            <div 
                className="container" 
                onClick={() => {
                    emit('close-context-menu', {
                        menu: 'none',
                    });
                }}
                onContextMenu={(e) => {
                    e.preventDefault();
                    emit('close-context-menu', {
                        menu: 'none',
                    });
                }}    
            >
                <Header/>
                <Center/>
                <Footer/>
            </div>
        </Provider>
    )
}

export default App;
