import './App.css';



import React from 'react';
import useSize from './component/common/useSize';
import { extendTheme, ChakraProvider, StyleFunctionProps } from "@chakra-ui/react";

import {Routes, Route, useNavigate, useMatch} from 'react-router-dom';


import Auth from './pages/Auth';

import Home from "./pages/Home";

import TopNav from './component/common/TopNav';
import BottomNav from './component/common/BottomNav';

import Write2 from './pages/Writing2'
import DiaryMock from './pages/Result'

import { getEmail, getUserId, setEmail } from './localstorage/user';
import AllDiary from './pages/AllDiary';
import Signup from './pages/Signup';



function App() {
    const { height } = useSize();
    const isAuthenticated = getUserId(); // 로그인 상태 확인
    const Navigate = useNavigate();
    const styles = {
        global: (props: StyleFunctionProps) => ({
          html: {
            maxW: '500px',
            mx: 'auto',
            height: height,
            bg: 'gray.100',
            webkitTouchCallout: 'none',
            webkitUserSelect: 'none',
            webkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
          },
          body: {
            color: 'black',
          },
        }),
      };
      
      const theme = extendTheme({
        styles,
      });
      

    return (
        
        <ChakraProvider theme={theme}>

            <div className="App">
            <div>
               <TopNav/>
                  
              <Routes>
                {/* 로그인 상태 확인 */}
                {isAuthenticated ? (
                  <>
                    <Route path="/home" element={<><Home /><BottomNav number={1} /></>} />
                    <Route path="/writing" element={<><Write2 /><BottomNav number={2} /></>} />
                    <Route path="/list" element={<><DiaryMock /><BottomNav number={3} /></>} />
                    <Route path="/alldiary" element={<><AllDiary /><BottomNav number={3} /></>} />
                    <Route path="/" element={<><Home /><BottomNav number={1} /></>} />
                    {/* 기본 경로를 HOME으로 설정 */}
                    <Route path="*" element={<Navigate to="/home" replace />} />
                  </>
                ) : (
                  <>
                    {/* 로그인 상태가 아니면 Auth 페이지로 리다이렉트 */}
                    <Route path="/" element={<Auth />} />
                    <Route path="/signup" element={<Signup />} />
                  </>
                )}
              </Routes>

            </div>

        </div>
        </ChakraProvider>
    );
}

export default App;
