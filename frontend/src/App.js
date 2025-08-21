import './App.css';
import HeroPage from './page/HeroPage/HeroPage';
import {Route,Routes} from 'react-router-dom'
import MainPage22 from './page/MainPage/MainPage22';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HeroPage />}></Route>
        <Route path="/mainpage" element={<MainPage22 />}></Route>
      </Routes>
    </div>
  );
}

export default App;
