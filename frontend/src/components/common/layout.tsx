import React, { ReactNode } from 'react';
import Sidebar from './sidebar';
import Header from './header';
import Footer from './footer';
import NavBar from '../recommend/navbar'
/*
This component is used to combine the Header, Sidebar, Footer components
*/

interface LayoutProps {
    currentPage: string;
    children: ReactNode; // Define children prop
}

const Layout: React.FC<LayoutProps> = ({ currentPage, children }) => {
    return (
        <div>
            {/* <Header /> */}
            <NavBar />
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-2">
                        {/* <Sidebar currentPage={currentPage} /> */}
                    </div>
                    <div className="col-md-8">
                        {/* Render the main content passed as children */}
                        {children}
                    </div>
                    <div className="col-md-2">
                        {/* <Sidebar currentPage={currentPage} /> */}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Layout;
