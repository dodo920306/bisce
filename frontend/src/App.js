import './App.css';
import { BrowserRouter as Router, Route , Routes} from 'react-router-dom'
import PrivateRoute from './utils/PrivateRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import TransferPage from './pages/TransferPage';
import Header from './components/Header';
import { AuthProvider } from './context/AuthContext'
import SignupPage from './pages/SignupPage';

function App() {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
        <Header />
        <Routes>
          <Route 
            exact path="/" 
            element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
            }  
          />
          <Route
            exact path="/transfer" 
            element={
            <PrivateRoute>
              <TransferPage />
            </PrivateRoute>
            }  
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage/>} />          
        </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
