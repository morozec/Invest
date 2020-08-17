async function refresh(tokensContainer){
    const refreshResponse = await fetch('api/account/refresh',{
        method:'POST',
        body:JSON.stringify(tokensContainer),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    });
    return refreshResponse;
}

export async function fetchWithCredentials(url, options, tokensContainer, setTokensContainerCookieCallback){

    options.headers = options.headers || {};
    options.headers['Authorization'] = 'Bearer ' + tokensContainer.token;
    let response = await fetch(url, options);
    if (response.ok) return {response};

    if (response.status === 401 && response.headers.has('Token-Expired')){
        console.log('token expired');
        const refreshResponse = await refresh(tokensContainer);

        if (!refreshResponse.ok){
            return {response}; //failed to refresh so return original 401 response
        }

        var jsonRefreshResponse = await refreshResponse.json();        

        response = await fetchWithCredentials(url, options, jsonRefreshResponse, setTokensContainerCookieCallback);
        // setTokensContainerCookieCallback('tokensContainer', jsonRefreshResponse);
        return {response, newTokensContainer:jsonRefreshResponse};
    }
    
    return {response};
}