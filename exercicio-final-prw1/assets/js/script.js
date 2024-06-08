function checarLogin() {
    const loginDiv = document.querySelector(".inputLogin")
    const sticknotesDiv = document.querySelector(".lembretes");
    const login = localStorage.getItem("tokenJWT");

    if(login) {
        loginDiv.style.display = "none";
        sticknotesDiv.style.display = "block";
    } else{
        loginDiv.style.display = "block";
        sticknotesDiv.style.display = "none";
    }
}

function login(e) {

    e.preventDefault();
    const email = document.querySelector("#email")
    localStorage.setItem("tokenJWT", email.value);
    email.value = "";
    checarLogin();
}

async function cadastrar(e) {

    e.preventDefault();

    let botaoClicado = e.target;
    let valorEmailPessoa = botaoClicado.parentElement.children[0].innerHTML;
    let valorSenhaPessoa = botaoClicado.parentElement.children[1].innerHTML;
    let options = {
        method: "POST",
        body: JSON.stringify({
            login: emailPessoa,
            senha: valorSenhaPessoa
        }),
    }
    const resposta = await fetch("url", options).json();

    console.log(resposta)
}

const urlLogin = https://ifsp.ddns.net/webservices/lembretes/;
const tokenJWT = localStorage.getItem("tokenJWT");

checarLogin();

const botaoLogin = document.querySelector("#fazerLogin")
botaoLogin.addEventListener("click", login);

const botaoCadastro = document.querySelector("#fazerCadastro");
botaoCadastro.addEventListener("click", cadastrar);






/* let op = {
    headers: { "Authorization": `Bearer ${tokenJWT}` }
    }
    const res = await fetch("url", op); */