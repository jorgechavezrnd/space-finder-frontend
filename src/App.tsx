import { useState } from 'react';
import './App.css'
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import NavBar from './components/NavBar';
import { AuthService } from './services/AuthService';
import LoginComponent from './components/LoginComponent';
import { DataService } from './services/DataService';
import CreateSpace from './components/spaces/CreateSpace';

const authService = new AuthService();
const dataService = new DataService();

function App() {
  const [userName, setUserName] = useState<string | undefined>(undefined);

  const router = createBrowserRouter([
    {
      element: (
        <>
          <NavBar userName={userName}/>
          <div className="wrapper">
            <Outlet />
          </div>
        </>
      ),
      children:[
        {
          path: "/",
          element: <div>Hello world!</div>,
        },
        {
          path: "/login",
          element: <LoginComponent authService={authService} setUserNameCb={setUserName} />,
        },
        {
          path: "/profile",
          element: <div>Profile page</div>,
        },
        {
          path: "/createSpace",
          element: <CreateSpace dataService={dataService} />,
        },
        {
          path: "/spaces",
          element: <div>Spaces page</div>,
        },
      ]
    },
  ]);

  return <RouterProvider router={router} />
}

export default App
