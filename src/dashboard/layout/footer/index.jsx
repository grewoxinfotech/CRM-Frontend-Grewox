import React from 'react';
import { Layout } from 'antd';
import './footer.scss';

const { Footer } = Layout;

const DashboardFooter = () => {
    return (
        <Footer className="dashboard-footer">
            <div className="footer-content">
                <span>© {new Date().getFullYear()} Grewox. All rights reserved.</span>
                <div className="footer-links">
                    <a href="/privacy">Privacy Policy</a>
                    <a href="/terms">Terms of Service</a>
                    <a href="/contact">Contact Us</a>
                </div>
            </div>
        </Footer>
    );
};

export default DashboardFooter; 