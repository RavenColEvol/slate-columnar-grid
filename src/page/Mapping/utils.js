const base_url = `api.contentstack.io`
const allContentUrl = `https://${base_url}/v3/content_types?include_count=false`
const headers = {
    'api_key': 'blt2cf669e5016d5e07',
    'access_token': 'cs81606189c4e950040a23abe0'
}

export const getContentTypes = async () => {
    const res = await fetch(allContentUrl, {
        headers
    });
    const json = await res.json();
    return await json;
}