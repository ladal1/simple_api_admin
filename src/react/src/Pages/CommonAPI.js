function Send_to_API(query, callback=()=>{}, error_callback=()=>{}){
    console.log(query)
    fetch('../api/', {
    // fetch('http://localhost:8000/api/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRF()
        },
        credentials: 'include',
        body: JSON.stringify({
            query: query
        }),
    }).then((response) => response.json()).catch(e => error_callback(e.text))
        .then(r => {callback(r); return r}).catch(e => error_callback(e.text))
}

function api_login(user, callback, error_callback){
    if(user === null){
        api_logout(user, callback, error_callback);
        return
    }

    //TODO change to ./login
    fetch('./login',
    // fetch('http://localhost:8000/simple/login',
        {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRF()
            },
            credentials: 'include',
            body: JSON.stringify({
                username: user, operation:'login'})
        }).then(r => r.json()).then(r => api_check(user, r, callback, error_callback)).catch(e=>error_callback(e.text))
}

function api_logout(user, callback, error_callback){
    //TODO change to ./login
    fetch('./login',
    // fetch('http://localhost:8000/simple/login',
        {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRF()
            },
            credentials: 'include',
            body: JSON.stringify({operation:'logout'})
        }).then(r => r.json()).then(r => api_check(user, r, callback, error_callback)).catch(e=>error_callback(e.text))
}

function api_login_status(callback, error_callback){
    //TODO change to ./login
    fetch('./login',
    // fetch('http://localhost:8000/simple/login',
        {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRF()
            },
            credentials: 'include',
            body: JSON.stringify({operation:'status'})
        }).then(r => r.json()).then(r => api_check(r.username, r, callback, error_callback))
}

function api_check(username, response, callback, error_callback){
    // console.log(response)
    if(response.success){
        callback(username)
    } else {
        error_callback(response.reason)
    }
}

function stringify_replacer(key, value){
    if (key === "__typename"){ return undefined }
    else return value
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function setCookie(name, value){
    let date = new Date();
    //Expire in a week
    date.setTime(date.getTime()+(7*24*60*60*1000));
    document.cookie = name + "=" + value + "; expires=" + date.toUTCString();
}

function getSimpleSchema(callback, error_callback){
    const query = `
    {
      __types{
        typename
        fields{
          name
          typename
        }
      }
      __objects{
        name
        pk_field
        actions{
          name
          parameters{
            name
            typename
            default
          }
          data {
            name
            typename
            default
          }
          mutation
          return_type
          permitted
          deny_reason
          retry_in
        }
      }
    __actions{
      name
      parameters{
        name
        typename
        default
      }
      data {
        name
        typename
        default
      }
      mutation
      return_type
      permitted
      deny_reason
      retry_in
    }
}`
    Send_to_API(query, (val)=>{if(val !== undefined){callback(val.data)}else{error_callback(val)}}, error_callback)
}

function getCSRF(){
    return getCookie('csrftoken')
}


export {Send_to_API, getSimpleSchema, stringify_replacer, getCookie, setCookie, api_login, api_logout, api_login_status};
