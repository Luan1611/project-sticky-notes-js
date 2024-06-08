function checarLogin() {
    const loginDiv = document.querySelector(".telalogin")
    const sticknotesDiv = document.querySelector(".lembretes");
    const login = localStorage.getItem("tokenJWT");

    if(login){
        loginDiv.style.display = "none";
        sticknotesDiv.style.display = "block";
    }else{
        loginDiv.style.display = "block";
        sticknotesDiv.style.display = "none";
    }
}

function fazerLogin() {
    const loginForm = document.querySelector("#login")
    loginForm.addEventListener("submit", login);

}

function login(e) {
    e.preventDefault();
    const email = document.querySelector("#email")
    localStorage.setItem("tokenJWT", email.value);
    email.value = "";
    checarLogin();
}

checarLogin();

fazerLogin();