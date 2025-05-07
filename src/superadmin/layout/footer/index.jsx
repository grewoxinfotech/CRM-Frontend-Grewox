import React from 'react';
import { Link } from 'react-router-dom';
import './footer.scss';

const Footer = () => {
    return (
        <footer className="superadmin-footer">
            <div className="footer-content">
                <div className="footer-left">
                    © 2025 Grewox Infotech. All rights reserved.
                </div>
                <div className="footer-right">
                    <Link to="/privacy-policy">Privacy Policy</Link>
                    <Link to="/terms-of-service">Terms of Service</Link>
                    <Link to="/support">Support</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 