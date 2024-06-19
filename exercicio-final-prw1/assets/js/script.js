
const urlBase = "https://ifsp.ddns.net/webservices/lembretes";
var cronometro;
var msgLoginExpirado;
var logout;


// Funções que tratam da parte do usuário

async function checarLogin() {

    const loginDiv = document.querySelector(".inputLogin");
    const sticknotesDiv = document.querySelector(".inputLembretes");

    const token = localStorage.getItem("tokenJWT");

    //verifica se token é valido, inexistente ou inválido
    const booleanResponse = await checarSeTokenAindaTemValidade(token);

    if(booleanResponse) {
        cronometro = setTimeout(checarLogin, 180000);
        alertarQueLoginExpirou();
        fazerLogout();

        loginDiv.style.display = "none";
        sticknotesDiv.style.display = "block";
        carregarDadosLembretes();
    } else{
        loginDiv.style.display = "block";
        sticknotesDiv.style.display = "none";
    }

}


function fazerLogout() {

    setTimeout(() => {
            let token = localStorage.getItem("tokenJWT"); 
            fazerServidorRevogarToken(token);
    }, 179999);

}


async function fazerServidorRevogarToken(token) {
    
    let opcoes = {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    }

    let serverResponse = await fetch(urlBase + "/usuarios/logout", opcoes);
    let obj = serverResponse.json();

    console.log(obj.msg);

    localStorage.clear();

}


function alertarQueLoginExpirou() {

    setTimeout( () => {
        alert("Seu tempo de login expirou!");
    }, 179999);

}


function parseJWT(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}


async function checarSeTokenAindaTemValidade(token) {

    if (token !== null) {
    
        try {

            let opcoes = {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }

            let respostaServidor = await fetch(urlBase + "/usuario/check", opcoes);
            console.log(respostaServidor.status);
            console.log(respostaServidor.ok);
            console.log(respostaServidor);

            let mensagemRetornada = await respostaServidor.json();

            if (mensagemRetornada.msg === "Você não está logado") {
                return false;
            }
        
            return true;
        }

        catch {
            (err) => {
                console.log(err);
            }
        }

    }

    return false;

}


async function logar(e) {

    e.preventDefault();

    let botaoClicado = e.target;
    let valorEmailPessoa = botaoClicado.parentElement.children[0].value;
    let valorSenhaPessoa = botaoClicado.parentElement.children[1].value;

    let options = {
        method: "POST",
        body: JSON.stringify({
            login: valorEmailPessoa,
            senha: valorSenhaPessoa
        }),
        headers: {
            "Content-type": "application/json"
        }
    }

    let resposta = await fetch(urlBase + "/usuario/login", options);
    let valorToken = await resposta.json();
    console.log(parseJWT(valorToken.token));
    console.log(valorToken);

    if (valorToken.token) {
        localStorage.setItem("tokenJWT", valorToken.token);
        verificarSeEstaLogado();
        checarLogin();
    } else {
        alert(JSON.stringify(valorToken.msg));
    }

}


async function cadastrar(e) {

    e.preventDefault();

    let botaoClicado = e.target;
    let valorEmailPessoa = botaoClicado.parentElement.children[0].value;
    let valorSenhaPessoa = botaoClicado.parentElement.children[1].value;

    let options = {
        method: "POST",
        body: JSON.stringify({
            login: valorEmailPessoa,
            senha: valorSenhaPessoa
        }),
        headers: {
            "Content-type": "application/json"
        }
    }

    let resposta = await fetch(urlBase + "/usuario/signup", options);
    let valorToken = await resposta.json();

    if (valorToken.key === "token") {
        localStorage.setItem("tokenJWT", JSON.stringify(valorToken));
        alert("Cadastro realizado com sucesso! Por favor, agora realize o Login");
    } else {
        alert(JSON.stringify(valorToken.msg));
    }
    
}


async function renovarToken() {

    const tokenJWT = localStorage.getItem("tokenJWT");

    let options = {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${tokenJWT}`
        }
    }

    const respServer = await fetch(`${urlBase}/usuario/renew`, options);

    const respJson = await respServer.json();

    localStorage.removeItem("tokenJWT");

    localStorage.setItem("tokenJWT", respJson.token);

    clearTimeout(cronometro);

    cronometro = setTimeout(checarLogin, 180000);
    alertarQueLoginExpirou();

}


async function verificarSeEstaLogado() {

    const tokenJWT = localStorage.getItem("tokenJWT");

    let options = {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${tokenJWT}`
        }
    }

    const respServer = await fetch(urlBase + "/usuario/check", options);
    const respJson = await respServer.json();

    return (respJson.msg === "Você está logado"? false : true);

}




//Funções que tratam da parte dos Lembretes

async function carregarDadosLembretes() {

    const tokenJWT = localStorage.getItem("tokenJWT");

    let options = {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${tokenJWT}`
        }
    }

    const resposta = await fetch(urlBase + "/lembrete", options);
    const listaDeLembretes = await resposta.json();

    let divPai = document.querySelector(".container-lembretes");

    console.log(listaDeLembretes);

    for (lembrete of listaDeLembretes) {

        let divDoLembrete = document.createElement("div");
        divDoLembrete.classList.add("lembrete");

        let dataLembrete = document.createElement("h4");
        dataLembrete.innerHTML = lembrete.data;

        let conteudoLembrete = document.createElement("p");
        conteudoLembrete.innerHTML = lembrete.texto;

        let botaoAlterarLembrete = document.createElement("button");
        botaoAlterarLembrete.innerText = "Editar";
        botaoAlterarLembrete.id = lembrete.id;
        botaoAlterarLembrete.addEventListener("click", editarLembrete);

        let botaoRemoverLembrete = document.createElement("button");
        botaoRemoverLembrete.innerText = "Remover";
        botaoRemoverLembrete.id = lembrete.id;
        botaoRemoverLembrete.addEventListener("click", removerLembrete);

        divDoLembrete.append(dataLembrete);
        divDoLembrete.append(conteudoLembrete);
        divDoLembrete.append(botaoAlterarLembrete);
        divDoLembrete.append(botaoRemoverLembrete);

        divPai.append(divDoLembrete);

    }

}


async function salvarLembrete(e) {

    renovarToken();

    const tokenJWT = localStorage.getItem("tokenJWT");

    e.preventDefault();

    let botaoSalvarLembrete = e.target;
    let valorTextArea = botaoSalvarLembrete.parentElement.children[0].value;

    let options = {
        method: "POST",
        body: JSON.stringify({
            texto: valorTextArea
        }),
        headers: {
            "Content-type": "application/json",
            "Authorization": `Bearer ${tokenJWT}`
        }
    }

    let resposta = await fetch(urlBase + "/lembrete", options);
    let lembrete = await resposta.json();

    let divPai = document.querySelector(".container-lembretes");

    let divDoLembrete = document.createElement("div");
    divDoLembrete.classList.add("lembrete");

    let dataLembrete = document.createElement("h4");
    dataLembrete.innerHTML = lembrete.data;

    let conteudoLembrete = document.createElement("p");
    conteudoLembrete.innerHTML = lembrete.texto;

    let botaoAlterarLembrete = document.createElement("button");
    botaoAlterarLembrete.innerText = "Editar";
    botaoAlterarLembrete.id = lembrete.id;
    botaoAlterarLembrete.addEventListener("click", editarLembrete);

    let botaoRemoverLembrete = document.createElement("button");
    botaoRemoverLembrete.innerText = "Remover";
    botaoRemoverLembrete.id = lembrete.id;
    botaoRemoverLembrete.addEventListener("click", removerLembrete);

    divDoLembrete.append(dataLembrete);
    divDoLembrete.append(conteudoLembrete);
    divDoLembrete.append(botaoAlterarLembrete);
    divDoLembrete.append(botaoRemoverLembrete);

    divPai.append(divDoLembrete);

}


//TODO: Terminar função de editar um lembrete
function editarLembrete() {

    const tokenJWT = localStorage.getItem("tokenJWT");

    let options = {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${tokenJWT}`
        }
    }
    console.log("editar")
}


async function removerLembrete(e) {

    const tokenJWT = localStorage.getItem("tokenJWT");

    let options = {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${tokenJWT}`
        }
    }

    let botaoRemoverLembrete = e.target;
    let idLembrete = botaoRemoverLembrete.id;

    const respServer = await fetch(`${urlBase}/lembrete/${idLembrete}`, options);
    const respJson = await respServer.json();

    alert(respJson.msg);

    let lembreteASerRemovido = botaoRemoverLembrete.parentElement;
    lembreteASerRemovido.remove();

    renovarToken();

}


function textCounter(field, countfield, maxlimit) {

    if (field.value.length > maxlimit)
    field.value = field.value.substring(0, maxlimit);
    else 
    countfield.value = maxlimit - field.value.length;
    
}


checarLogin();

const botaoLogin = document.querySelector("#fazerLogin");
botaoLogin.addEventListener("click", logar);

const botaoCadastro = document.querySelector("#fazerCadastro");
botaoCadastro.addEventListener("click", cadastrar);

const inputAdicionarLembrete = document.querySelector("#inputLembrete");
inputAdicionarLembrete.addEventListener("click", salvarLembrete);

const botaoFazerLogout = document.querySelector("#fazerLogout");
botaoFazerLogout.addEventListener("click", fazerServidorRevogarToken);


/*    
const tokenJWT = localStorage.getItem("tokenJWT");

    let options = {
        method: "POST",
        body: JSON.stringify({
            login: valorEmailPessoa,
            senha: valorSenhaPessoa
        }),
        headers: {
            "Content-type": "application/json",
            "Authorization": `Bearer ${tokenJWT}`
        }
    }*/