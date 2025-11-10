import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../auth/services/authSlice';

export const useLogout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear super-admin company login flag
        localStorage.removeItem('isSuperAdminCompanyLogin');
        dispatch(logout());
        navigate('/login');
    };

    return handleLogout;
};
