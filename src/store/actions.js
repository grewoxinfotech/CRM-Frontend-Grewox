export const RESET_STATE = 'RESET_STATE';
export const RESET_API_STATE = 'RESET_API_STATE';

export const resetState = () => ({
    type: RESET_STATE
});

export const resetApiState = () => ({
    type: RESET_API_STATE
});
