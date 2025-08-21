import './App.css';
import HeroPage from './page/HeroPage/HeroPage';
import {Route,Routes} from 'react-router-dom'
import MainPage from './page/MainPage/MainPage';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HeroPage />}></Route>
        <Route path="/mainpage" element={<MainPage />}></Route>
      </Routes>
    </div>
  );
}

export default App;
