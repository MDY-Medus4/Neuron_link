export async function HTTPGet(url, headers) {
    let response = await fetch(url, {
        method: 'GET',
        headers: headers
    })
    let data = await response.json()
    return data
}

export async function HTTPPost(url, headers, body) {
    let response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body
    })
    let data = await response.json()
    return data
}