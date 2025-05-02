import React, { useEffect } from 'react';
import EditCompany from '../../../superadmin/module/company/EditCompany';
import { useGetAllCountriesQuery } from '../../../superadmin/module/settings/services/settingsApi';
import { useGetAllCompaniesQuery, useUpdateCompanyMutation } from '../../../superadmin/module/company/services/companyApi';
import { useDispatch } from 'react-redux';
import { updateUser } from '../../../auth/services/authSlice';
import { message } from 'antd';

const EditCompanyWrapper = (props) => {
    const dispatch = useDispatch();
    const { data: companies, refetch, isLoading: isLoadingCompanies } = useGetAllCompaniesQuery(undefined, {
        refetchOnMountOrArgChange: true // Force refetch when component mounts
    });
    const [updateCompany] = useUpdateCompanyMutation();

    const companiesData = companies?.data || [];

    // Find the current company data
    const currentCompany = companiesData?.find(company => company.id === props.initialValues?.id);

    // Effect to ensure we have company data
    useEffect(() => {
        if (!companies && !isLoadingCompanies) {
            refetch();
        }
    }, [companies, isLoadingCompanies, refetch]);

    // Handle form submission
    const handleSubmit = async (formData) => {
        try {
            if (!props.initialValues?.id) {
                message.error('Company ID not found. Please try refreshing the page.');
                return;
            }

            console.log('Submitting update for company:', props.initialValues.id);

            const result = await updateCompany({
                id: props.initialValues.id,
                data: formData
            }).unwrap();

            console.log('Update result:', result);

            // Update Redux store with the new data immediately
            if (result?.data) {
                dispatch(updateUser({
                    ...props.initialValues,
                    ...result.data,
                    // Ensure profile picture is updated if it exists
                    profilePic: result.data.profilePic || props.initialValues.profilePic
                }));

                message.success('Profile updated successfully');
            }

            // Refetch company data after successful update
            await refetch();

            // Call original onCancel if provided
            props.onCancel?.();
        } catch (error) {
            console.error('Failed to update company:', error);
            message.error('Failed to update profile. Please try again.');
        }
    };

    // Extend props to include our custom handlers and indicate this is profile view
    const extendedProps = {
        ...props,
        onSubmit: handleSubmit,
        isProfileView: true,
        // Pass loading state to show loading indicator
        loading: isLoadingCompanies
    };

    return <EditCompany {...extendedProps} />;
};

export default EditCompanyWrapper; 