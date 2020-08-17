async function refresh(token, refreshToken){
    const refreshResponse = await fetch('api/account/refresh',{
        method:'POST',
        body:JSON.stringify({token, refreshToken}),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    });
    return refreshResponse;
}

const getJwtToken = () => localStorage.getItem('token');
const getRefreshToken = () => localStorage.getItem('refreshToken');
export const saveJwtToken = (token) => localStorage.setItem('token', token);
export const saveRefreshToken = (refreshToken) => localStorage.setItem('refreshToken', refreshToken);

export async function fetchWithCredentials(url, options){
    const jwtToken = getJwtToken();
    options.headers = options.headers || {};
    options.headers['Authorization'] = 'Bearer ' + jwtToken;
    let response = await fetch(url, options);
    if (response.ok) return response;

    if (response.status === 401 && response.headers.has('Token-Expired')){
        console.log('token expired');
        const refreshToken = getRefreshToken();
        const refreshResponse = await refresh(jwtToken, refreshToken);

        if (!refreshResponse.ok){
            return response; //failed to refresh so return original 401 response
        }

        var jsonRefreshResponse = await refreshResponse.json();        
        saveJwtToken(jsonRefreshResponse.token);
        saveRefreshToken(jsonRefreshResponse.refreshToken);

        return await fetchWithCredentials(url, options);
    }
    
    return {response};
}