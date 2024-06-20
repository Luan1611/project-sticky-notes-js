
// Trabalho desenvolvido por Luan Marqueti e Luana Giovana Monteiro

const urlBase = "https://ifsp.ddns.net/webservices/lembretes";
var cronometro;
var msgLoginExpirado;
var logout;

// Funções que tratam da parte do usuário

async function checarLogin() {

    const loginDiv = document.querySelector(".inputLogin");
    const sticknotesDiv = document.querySelector(".inputLembretes");

    const tokenJWT = localStorage.getItem("tokenJWT");

    //verifica se token é valido, inexistente ou inválido
    const booleanResponse = await checarSeTokenAindaTemValidade(tokenJWT);

    if(booleanResponse) {

        let timeReference = new Date().getTime();
        let tokenParseado = parseJWT(tokenJWT);
        let expDoToken = tokenParseado.exp;

        cronometro = setTimeout(checarLogin, ((expDoToken * 1000) - timeReference));
        alertarQueLoginExpirou();
        forcarLogout();

        loginDiv.style.display = "none";
        sticknotesDiv.style.display = "block";
        carregarDadosLembretes();
    } else{

        loginDiv.style.display = "block";
        sticknotesDiv.style.display = "none";
    }

}


function forcarLogout() {

    let tokenJWT = localStorage.getItem("tokenJWT");
    console.log("Estou na funcao forcarLogout");
    let timeReference = new Date().getTime();
    let tokenParseado = parseJWT(tokenJWT);
    let expDoToken = tokenParseado.exp;

    setTimeout( () => {        
        fazerServidorRevogarToken(tokenJWT);
    }, (((expDoToken * 1000) - timeReference)) - 10000);

}


function fazerLogout(e) {

    e.preventDefault();

    let token = localStorage.getItem("tokenJWT"); 
    fazerServidorRevogarToken(token);

}


async function fazerServidorRevogarToken(token) {

    let opcoes = {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    }

    await fetch(urlBase + "/usuarios/logout", opcoes);

    localStorage.clear();

    checarLogin();

}


function alertarQueLoginExpirou() {

    let tokenJWT = localStorage.getItem("tokenJWT");

    let timeReference = new Date().getTime();
    let tokenParseado = parseJWT(tokenJWT);
    let expDoToken = tokenParseado.exp;


    setTimeout( () => {
        alert("Seu tempo de login expirou!");
    }, ((expDoToken * 1000) - timeReference) - 10000);

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

    let timeReference = new Date().getTime();
    let tokenParseado = parseJWT(tokenJWT);
    let expDoToken = tokenParseado.exp;

    cronometro = setTimeout(checarLogin, (expDoToken * 1000) - timeReference);

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

    divPai.innerHTML = "";

    for (lembrete of listaDeLembretes) {

        let divDoLembrete = document.createElement("div");
        divDoLembrete.classList.add("lembrete");

        let dataLembrete = document.createElement("h4");
        dataLembrete.innerHTML = lembrete.data;

        let texAreaDoLembrete = document.createElement("textarea");

        texAreaDoLembrete.setAttribute('cols', 90);
        texAreaDoLembrete.setAttribute('rows', 5);
        texAreaDoLembrete.setAttribute('disabled', true);
        texAreaDoLembrete.innerText = lembrete.texto;
        
        let botaoAlterarLembrete = document.createElement("button");
        botaoAlterarLembrete.innerText = "Editar";
        botaoAlterarLembrete.id = lembrete.id;
        botaoAlterarLembrete.addEventListener("click", editarLembrete);

        let botaoRemoverLembrete = document.createElement("button");
        botaoRemoverLembrete.innerText = "Remover";
        botaoRemoverLembrete.id = lembrete.id;
        botaoRemoverLembrete.addEventListener("click", removerLembrete);

        divDoLembrete.append(dataLembrete);
        divDoLembrete.append(texAreaDoLembrete);
        divDoLembrete.append(botaoAlterarLembrete);
        divDoLembrete.append(botaoRemoverLembrete);

        divPai.append(divDoLembrete);

    }

}


async function salvarLembrete(e) {

    e.preventDefault();

    const tokenJWT = localStorage.getItem("tokenJWT");
    
    let botaoSalvarLembrete = e.target;
    let textArea = botaoSalvarLembrete.parentElement.children[0];
    let valueTextArea = textArea.value;
    let tamanhoDaStringDoTextArea = valueTextArea.length;

    if (tamanhoDaStringDoTextArea > 0 && tamanhoDaStringDoTextArea <= 255) {

        let options = {
            method: "POST",
            body: JSON.stringify({
                texto: valueTextArea
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
    
        let textAreaDoLembrete = document.createElement("textarea");
        textAreaDoLembrete.setAttribute('disabled', true);
        textAreaDoLembrete.setAttribute('cols', 90);
        textAreaDoLembrete.setAttribute('rows', 5);
        textAreaDoLembrete.innerHTML = lembrete.texto;
    
        let botaoAlterarLembrete = document.createElement("button");
        botaoAlterarLembrete.innerText = "Editar";
        botaoAlterarLembrete.id = lembrete.id;
        botaoAlterarLembrete.addEventListener("click", editarLembrete);
    
        let botaoRemoverLembrete = document.createElement("button");
        botaoRemoverLembrete.innerText = "Remover";
        botaoRemoverLembrete.id = lembrete.id;
        botaoRemoverLembrete.addEventListener("click", removerLembrete);
    
        divDoLembrete.append(dataLembrete);
        divDoLembrete.append(textAreaDoLembrete);
        divDoLembrete.append(botaoAlterarLembrete);
        divDoLembrete.append(botaoRemoverLembrete);
    
        divPai.append(divDoLembrete);
    
        textArea.value = "";
    
        renovarToken();
    }

    else {

        alert("Erro. Não é permitido salvar um lembrete vazio, nem um lembrete com mais de 255 caracteres.");

    }

}


async function editarLembrete(e) {

    let botaoEditarLembrete = e.target;

    if (!(botaoEditarLembrete.previousElementSibling.getAttribute("class") === "salvarEdicao")) {

        let botaoSalvarEdicao = document.createElement("button");
        botaoSalvarEdicao.innerText = "Salvar Alteracoes";
        botaoSalvarEdicao.setAttribute("class", "salvarEdicao");
        botaoSalvarEdicao.setAttribute("id", botaoEditarLembrete.getAttribute("id"));
        botaoEditarLembrete.insertAdjacentElement("beforebegin", botaoSalvarEdicao);
        botaoSalvarEdicao.addEventListener("click", salvarEdicaoDoLembrete);

    }

    const token = localStorage.getItem("tokenJWT");

    let idLembrete = botaoEditarLembrete.id;
    let textoDoLembreteASerEditado = botaoEditarLembrete.previousElementSibling.previousElementSibling;
    textoDoLembreteASerEditado.removeAttribute("disabled");

    renovarToken();

}


async function salvarEdicaoDoLembrete(e) {

    e.preventDefault();

    const tokenJWT = localStorage.getItem("tokenJWT");

    let botaoSalvarEdicao = e.target;
    let idAlvo = botaoSalvarEdicao.getAttribute("id");
    let novoValorTextArea = botaoSalvarEdicao.parentElement.children[1].value;
    let tamanhoDaStringDoTextArea = novoValorTextArea.length;

    if (tamanhoDaStringDoTextArea > 0 && tamanhoDaStringDoTextArea <= 255) {

        let options = {
            method: "PUT",
            body: JSON.stringify({
                texto: novoValorTextArea
    
            }),
            headers: {
                "Authorization": `Bearer ${tokenJWT}`
            }
        }
        
        const respServer = await fetch(`${urlBase}/lembrete/${idAlvo}`, options);
        const respJson = await respServer.json();
    
        botaoSalvarEdicao.previousElementSibling.setAttribute("disabled", true);
    
        botaoSalvarEdicao.remove();
    }

    else {

        alert("Erro. Não é permitido salvar um lembrete vazio, nem um lembrete com mais de 255 caracteres.");

    }

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

checarLogin();

const botaoLogin = document.querySelector("#fazerLogin");
botaoLogin.addEventListener("click", logar);

const botaoCadastro = document.querySelector("#fazerCadastro");
botaoCadastro.addEventListener("click", cadastrar);

const botaoSalvarNovoLembreve = document.querySelector("#inputLembrete");
botaoSalvarNovoLembreve.addEventListener("click", salvarLembrete);

const botaoFazerLogout = document.querySelector("#fazerLogout");
botaoFazerLogout.addEventListener("click", fazerLogout);