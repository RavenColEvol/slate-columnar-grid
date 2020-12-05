const base_url = `api.contentstack.io`

const headers = {
    'api_key': 'blt2cf669e5016d5e07',
    'access_token': 'cs81606189c4e950040a23abe0',
    'environment': 'development',
    'authorization': 'csf9e7a0d0e7e9d04e14215f9a'
}

export const getContentDetail = async (uid) => {
    const contentUrl = `https://${base_url}/v3/content_types/${uid}`
    const res = await fetch(contentUrl, {
        headers
    });
    const json = await res.json();
    return await json['content_type'];
}

export const getSingleEntry = async (uid, entryId) => {
    console.log(uid, entryId)
    const entryUrl = `https://${base_url}/v3/content_types/${uid}/entries/${entryId}`
    const res = await fetch(entryUrl, {
        headers
    });
    const json = await res.json();
    console.log(json)
    return await json['entry'];
}