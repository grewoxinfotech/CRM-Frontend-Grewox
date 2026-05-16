import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/services/authSlice';
import { useGetsubcriptionByIdQuery } from '../superadmin/module/SubscribedUser/services/SubscribedUserApi';

export const useFeatureAccess = () => {
    const user = useSelector(selectCurrentUser);
    const userRole = user?.role_name || user?.Role?.role_name;
    const isSuperAdminCompanyLogin = !!user?.superAdminCompanyId;
    
    // For clients, we use their own ID or client_plan_id to get subscription
    // For staff/users, we use their client_id (which is usually user.id for the client themselves)
    const subscriptionId = user?.client_plan_id || user?.id;
    
    const { data: subscriptionData, isLoading } = useGetsubcriptionByIdQuery(subscriptionId, {
        skip: !subscriptionId || userRole === 'super-admin'
    });

    const hasFeature = (featureKey) => {
        // Super admins and company logins from super admin have full access
        if (userRole === 'super-admin' || isSuperAdminCompanyLogin) return true;
        
        let features = subscriptionData?.data?.Plan?.features || subscriptionData?.data?.plan?.features || subscriptionData?.data?.features;
        
        if (typeof features === 'string') {
            try { features = JSON.parse(features); } catch (e) { features = null; }
        }

        if (!features) return false;
        
        return !!features[featureKey];
    };

    return { hasFeature, subscriptionData, isLoading };
};
