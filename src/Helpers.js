export async function apiCall(api_url) {
    // const cache = localStorage.getItem(api_url);
    // if (cache) {
    //     return JSON.parse(cache);
    // }

    var requestOptions = {
        method: 'GET',
        redirect: 'follow',
        headers: new Headers({
            'key': 'ylPI5rutd4MESz4l'
        })
    };

    return fetch(api_url, requestOptions)
        .then(res => res.json())
        .then(
            (result) => {
                localStorage.setItem(api_url, JSON.stringify(result));
                return result;
            },
            // Remarque : il est important de traiter les erreurs ici
            // au lieu d'utiliser un bloc catch(), pour ne pas passer à la trappe
            // des exceptions provenant de réels bugs du composant.
            (error) => {
                console.log(error);
            }
        );
}