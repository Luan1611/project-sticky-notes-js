export function checarLogin(){
    const loginForm = document.querySelector("#login")
    const sticknotes = document.querySelector("#sticknotes");
    const login = localStorage.localStorage.getItem("tokenJWT")

    if(login){
        loginForm.style.display = "none";
        sticknotes.style.display = "block";
    }else{
        loginForm.style.display = "block";
        sticknotes.style.display = "none";
    }
}
