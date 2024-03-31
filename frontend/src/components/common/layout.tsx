import React, { ReactNode } from 'react';
import Sidebar from './sidebar';
import Header from './header';
import Footer from './footer';

/*
This component is used to combine the Header, Sidebar, Footer components
*/

interface LayoutProps {
    currentPage: string;
    setCurrentPage: (page: string) => void;
    children: ReactNode; // Define children prop
}

const Layout: React.FC<LayoutProps> = ({ currentPage, setCurrentPage, children }) => {
    setCurrentPage('/moodlog');

    return (
        <div>
            <Header />
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-2">
                        <Sidebar currentPage={currentPage} />
                    </div>
                    <div className="col-md-10">
                        {/* Render the main content passed as children */}
                        {children}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Layout;
