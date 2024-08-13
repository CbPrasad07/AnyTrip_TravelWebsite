// form loading animation

const form = [...document.querySelector('.form').children];

form.forEach((item, i) => {
    setTimeout(() => {
        item.style.opacity = 1;
    }, i*100);
})

window.onload = () => {
    if(sessionStorage.name){
        location.href = '/';
    }
}

// form validation


const name = document.querySelector('.name') || null;
const email = document.querySelector('.email');
const password = document.querySelector('.password');
const submitBtn = document.querySelector('.submit-btn');





function onSignIn(googleUser) {
    const profile = googleUser.getBasicProfile();
    const idToken = googleUser.getAuthResponse().id_token;

    // Send idToken to your backend for server-side verification
    fetch('/google-auth', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idToken })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = '/index.html'
        } else {
            // Handle login failure
            alert('Login failed!');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}






if(name == null){ // means login page is open
    submitBtn.addEventListener('click', () => {
        fetch('/login-user',{
            method: 'post',
            headers: new Headers({'Content-Type': 'application/json'}),
            body: JSON.stringify({
                email: email.value,
                password: password.value
            })
        })
        .then(res => res.json())
        .then(data => {
            validateData(data, 'login');
        })
    })
} else{ // means register page is open

    submitBtn.addEventListener('click', () => {
        fetch('/register-user', {
            method: 'post',
            headers: new Headers({'Content-Type': 'application/json'}),
            body: JSON.stringify({
                name: name.value,
                email: email.value,
                password: password.value
            })
        })
        .then(res => res.json())
        .then(data => {
            validateData(data, 'register');
        })
    })

}


const validateData = (data, action) => {
    if (!data || typeof data !== 'object') {
        alertBox('Please try again.');
    } else if (data.message) {
        alertBox(data.message); 
    } else {
        if (action === 'register') {
            alertBox('Registered successfully!');
        } else if (action === 'login') {
            alertBox('Login successful!');
            sessionStorage.name = data.username;
            sessionStorage.email = data.email;
            location.href = '/'; 
        }
    }
}



const alertBox = (data) => {
    const alertContainer = document.querySelector('.alert-box');
    const alertMsg = document.querySelector('.alert');
    alertMsg.innerHTML = data;

    alertContainer.style.top = `5%`;
    setTimeout(() => {
        alertContainer.style.top = null;
    }, 5000);
}