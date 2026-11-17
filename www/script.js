let fila = [];
let jogando = [];

// Abas
const menus = document.querySelectorAll(".menu");
const paginas = document.querySelectorAll(".pagina");

// Troca de telas
menus.forEach(botao => {
    botao.addEventListener("click", () => {
        menus.forEach(b => b.classList.remove("ativo"));
        paginas.forEach(p => p.classList.remove("ativa"));

        botao.classList.add("ativo");
        const pagina = document.getElementById(botao.dataset.page);
        pagina.classList.add("ativa");
    });
});

// Conteúdo inicial das páginas
document.getElementById("jogadores").innerHTML = `
<div class="card">
<h2>👥 Jogadores</h2>
<input type="text" id="nomeJogador" placeholder="Nome do jogador">
<button id="btnAdicionar">➕ Adicionar Jogador</button>
<p id="contador">Jogadores: 0</p>
</div>
<div class="card">
<div id="listaJogadores">Nenhum jogador cadastrado.</div>
</div>
`;

document.getElementById("sorteio").innerHTML = `
<div class="card cardConfig">
    <div class="topoConfig">
        <div class="menuConfig" id="btnConfig">⋮</div>
    </div>
    <div id="menuConfiguracoes" style="display:none; margin-top:15px;">
        <label>Jogadores por time</label>
        <input type="number" id="jogadoresTime" value="6" min="1">
        <label>Levantadores por time</label>
        <input type="number" id="levantadoresTime" value="1" min="0">
        <label>Meninas por time</label>
        <input type="number" id="meninasTime" value="0" min="0">
        <button id="btnSortear">🎲 Sortear Times</button>
    </div>
</div>
<div class="areaTimes">
    <div class="card">
        <h3>🔵 Time Azul</h3>
        <div id="timeAzul">Nenhum sorteio.</div>
    </div>
    <div class="card">
        <h3>🔴 Time Vermelho</h3>
        <div id="timeVermelho">Nenhum sorteio.</div>
    </div>
    <div class="card">
        <h3>⏳ Fila de Espera</h3>
        <div id="filaEspera">Nenhum jogador.</div>
    </div>
</div>
`;

document.getElementById("btnConfig").onclick = () => {
    const menu = document.getElementById("menuConfiguracoes");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
};

document.getElementById("placar").innerHTML = `
<div class="seletorEsporte" id="seletorEsporte">
<button class="chip ativo" data-esporte="volei">🏐 Vôlei</button>
<button class="chip" data-esporte="basquete">🏀 Basquete</button>
<button class="chip" data-esporte="futsal">⚽ Futsal</button>
<button class="chip" data-esporte="futebol">⚽ Futebol</button>
</div>

<div id="placarVolei">
<div class="quadro">

<div class="quadroTopo">
<div id="vlTitulo" class="periodo">🏐 Vôlei • até 25 pontos</div>
<div class="vlConfig">
<select id="limitePontos">
<option value="15">15 pontos</option>
<option value="21">21 pontos</option>
<option value="25" selected>25 pontos</option>
<option value="personalizado">Personalizado</option>
</select>
<input type="number" id="pontosPersonalizado" placeholder="Quantos pontos?" style="display:none;" min="1">
</div>
</div>

<div class="quadroTimes">
<div class="timeBox azul">
<h3>🔵 Azul</h3>
<div class="gols" id="pontosAzul">0</div>
<div class="botoesPonto">
<button id="vlAzulMais">+1</button>
</div>
</div>

<div class="timeBox vermelho">
<h3>🔴 Vermelho</h3>
<div class="gols" id="pontosVermelho">0</div>
<div class="botoesPonto">
<button id="vlVermelhoMais">+1</button>
</div>
</div>
</div>

<div class="acoesPartida">
<button id="desfazerPonto">↩️ Desfazer</button>
<button id="iniciarPartida">🔄 Nova partida</button>
<button id="btnSync">📡 Bluetooth</button>
</div>

</div>
</div>

<div id="placarTempo" style="display:none;">
<div class="quadro">

<div class="quadroTopo">
<div id="tpPeriodo" class="periodo"></div>
<div id="tpRelogio" class="relogio">00:00</div>
<div class="ctrlRelogio">
<button id="tpPlay">▶️ Iniciar</button>
<button id="tpAjuste">⏱️ Ajustar</button>
<button id="tpProximo">⏭️ Próximo</button>
</div>
</div>

<div class="quadroTimes" id="tpTimes"></div>

<div class="acoesPartida">
<button id="tpDesfazer">↩️ Desfazer</button>
<button id="tpNova">🔄 Nova partida</button>
<button id="btnSyncTempo">📡 Bluetooth</button>
</div>

</div>
</div>
`;

document.getElementById("ranking").innerHTML = `
<div class="card">
<h2>🏆 Ranking</h2><br>
<p>Nenhuma partida registrada.</p>
</div>
`;

// ==========================
// JOGADORES
// ==========================

let jogadores = JSON.parse(localStorage.getItem("jogadores")) || [];
const lista = document.getElementById("listaJogadores");
const contador = document.getElementById("contador");
const nome = document.getElementById("nomeJogador");

document.getElementById("btnAdicionar").onclick = adicionarJogador;

function normalizarNome(n){
    return n.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
}

function nomeRepetido(n, ignorar){
    const alvo = normalizarNome(n);
    return jogadores.some((j,i)=> i !== ignorar && normalizarNome(j.nome) === alvo);
}

function salvarJogadores(){
    localStorage.setItem("jogadores", JSON.stringify(jogadores));
}

let jogadorEditando = -1;
const modal = document.getElementById("modalEditar");
const editNome = document.getElementById("editNome");
const editSexo = document.getElementById("editSexo");
const editLevantador = document.getElementById("editLevantador");

function atualizarJogadores(){
    contador.innerHTML = "Jogadores: " + jogadores.length;
    if(jogadores.length === 0){
        lista.innerHTML = "Nenhum jogador cadastrado.";
        return;
    }
    lista.innerHTML = "";
    jogadores.forEach((j,index)=>{
        lista.innerHTML += `
        <div class="jogador">
            <div class="infoJogador">
                <div class="nomeJogador">👤 ${j.nome}</div>
                <div class="detalhes">
                    ${j.sexo=="M" ? "🚹 Masculino" : "🚺 Feminino"}<br>
                    ${j.levantador ? "🏐 Levantador" : ""}
                </div>
            </div>
            <div class="acoes">
                <button class="btnIcone editar" onclick="editar(${index})">✏️</button>
                <button class="btnIcone excluir" onclick="excluir(${index})">🗑️</button>
            </div>
        </div>`;
    });
}

function adicionarJogador(){
    let n = nome.value.replace(/\s+/g, " ").trim();
    if(n=="") return;
    if(nomeRepetido(n, -1)){
        alert("Esse jogador já existe.");
        return;
    }
    jogadores.push({ nome:n, sexo:"M", levantador:false });
    nome.value="";
    salvarJogadores();
    atualizarJogadores();
}

function excluir(i){
    if(!confirm("Excluir jogador?")) return;
    jogadores.splice(i,1);
    salvarJogadores();
    atualizarJogadores();
}

function editar(i){
    jogadorEditando = i;
    editNome.value = jogadores[i].nome;
    editSexo.value = jogadores[i].sexo;
    editLevantador.checked = jogadores[i].levantador;
    modal.classList.add("ativo");
}

atualizarJogadores();

document.getElementById("cancelarEditar").onclick = () => {
    modal.classList.remove("ativo");
};

document.getElementById("salvarJogador").onclick = () => {
    let nomeNovo = editNome.value.trim();
    if(nomeNovo==""){
        alert("Digite um nome.");
        return;
    }
    if(nomeRepetido(nomeNovo, jogadorEditando)){
        alert("Esse nome já existe.");
        return;
    }
    jogadores[jogadorEditando].nome = nomeNovo;
    jogadores[jogadorEditando].sexo = editSexo.value;
    jogadores[jogadorEditando].levantador = editLevantador.checked;
    salvarJogadores();
    atualizarJogadores();
    modal.classList.remove("ativo");
};

function embaralhar(lista){
    let copia = [...lista];
    for(let i=copia.length-1;i>0;i--){
        let j = Math.floor(Math.random()*(i+1));
        [copia[i],copia[j]] = [copia[j],copia[i]];
    }
    return copia;
}

// ==========================
// REGRAS DO SORTEIO
// ==========================

let azulAtual = [];
let vermelhoAtual = [];

function configSorteio(){
    return {
        qtd:  Math.max(1, Number(document.getElementById("jogadoresTime").value) || 6),
        nLev: Math.max(0, Number(document.getElementById("levantadoresTime").value) || 0),
        nMen: Math.max(0, Number(document.getElementById("meninasTime").value) || 0)
    };
}

function ehMenina(j){ return j.sexo == "F"; }

function formarTime(pool, cfg){
    const { qtd, nLev, nMen } = cfg;
    let disponiveis = [...pool];
    let time = [];
    let cntL = 0;
    let cntF = 0;

    while(time.length < qtd && disponiveis.length){
        let melhor = -1;
        let melhorScore = -1;

        disponiveis.forEach((j, i)=>{
            const L = !!j.levantador;
            const F = ehMenina(j);
            if(nLev > 0 && L && cntL >= nLev) return;
            if(nMen > 0 && F && cntF >= nMen) return;
            let score = 0;
            if(nLev > 0 && L) score++;
            if(nMen > 0 && F) score++;
            if(score > melhorScore){
                melhor = i;
                melhorScore = score;
            }
        });

        if(melhor < 0) break;
        const j = disponiveis.splice(melhor, 1)[0];
        if(j.levantador) cntL++;
        if(ehMenina(j)) cntF++;
        time.push(j);
    }

    while(time.length < qtd && disponiveis.length){
        time.push(disponiveis.shift());
    }

    return { time: time, resto: disponiveis };
}

function rotulo(j){
    const icone = j.levantador ? "🏐" : (ehMenina(j) ? "👩" : "👨");
    return icone + " " + j.nome;
}

function mostrarTimes(){
    const azulDiv = document.getElementById("timeAzul");
    const vermelhoDiv = document.getElementById("timeVermelho");
    const filaDiv = document.getElementById("filaEspera");

    azulDiv.innerHTML = azulAtual.length ? azulAtual.map(rotulo).join("<br>") : "Nenhum jogador.";
    vermelhoDiv.innerHTML = vermelhoAtual.length ? vermelhoAtual.map(rotulo).join("<br>") : "Nenhum jogador.";
    filaDiv.innerHTML = fila.length ? fila.map(rotulo).join("<br>") : "Nenhum jogador na fila.";
}

document.getElementById("btnSortear").onclick = ()=>{
    if(jogadores.length === 0){
        alert("Cadastre os jogadores primeiro.");
        return;
    }

    const cfg = configSorteio();
    let azulDiv = document.getElementById("timeAzul");
    let vermelhoDiv = document.getElementById("timeVermelho");

    azulDiv.classList.add("animando");
    vermelhoDiv.classList.add("animando");

    let tempo = 0;
    let efeito = setInterval(()=>{
        let nomes = embaralhar(jogadores);
        azulDiv.innerHTML = nomes.slice(0, cfg.qtd).map(j=>"🏐 "+j.nome).join("<br>");
        vermelhoDiv.innerHTML = nomes.slice(cfg.qtd, cfg.qtd*2).map(j=>"🏐 "+j.nome).join("<br>");
        tempo++;

        if(tempo >= 15){
            clearInterval(efeito);
            azulDiv.classList.remove("animando");
            vermelhoDiv.classList.remove("animando");

            let pool = embaralhar(jogadores);
            let a = formarTime(pool, cfg);
            let v = formarTime(a.resto, cfg);

            azulAtual = a.time;
            vermelhoAtual = v.time;
            fila = v.resto;
            jogando = [...azulAtual, ...vermelhoAtual];

            mostrarTimes();
            zerarVolei();
        }
    }, 120);
};

function proximaRodada(vencedor){
    const existe = j => jogadores.includes(j);
    azulAtual = azulAtual.filter(existe);
    vermelhoAtual = vermelhoAtual.filter(existe);
    fila = fila.filter(existe);

    jogadores.forEach(j=>{
        if(!azulAtual.includes(j) && !vermelhoAtual.includes(j) && !fila.includes(j)){
            fila.push(j);
        }
    });

    const cfg = configSorteio();
    const perderam = vencedor == "azul" ? vermelhoAtual : azulAtual;
    const pool = [...fila, ...embaralhar(perderam)];
    const r = formarTime(pool, cfg);

    if(vencedor == "azul"){
        vermelhoAtual = r.time;
    }else{
        azulAtual = r.time;
    }

    fila = r.resto;
    jogando = [...azulAtual, ...vermelhoAtual];
    mostrarTimes();
}

// ==========================
// PLACAR VÔLEI
// ==========================

let pontosAzul = 0;
let pontosVermelho = 0;
let historico = [];

document.getElementById("limitePontos").onchange = function(){
    document.getElementById("pontosPersonalizado").style.display =
        this.value=="personalizado" ? "block" : "none";
};

function zerarVolei(){
    pontosAzul = 0;
    pontosVermelho = 0;
    historico = [];

    document.getElementById("pontosAzul").innerHTML = "0";
    document.getElementById("pontosVermelho").innerHTML = "0";

    btEnviarEstadoCompleto();
}

document.getElementById("iniciarPartida").onclick = ()=>{
    if(pontosAzul + pontosVermelho > 0){
        if(!confirm("Começar uma nova partida? O placar será zerado.")) return;
    }
    zerarVolei();
};

function limite(){
    let valor = document.getElementById("limitePontos").value;
    if(valor=="personalizado"){
        return Number(document.getElementById("pontosPersonalizado").value);
    }
    return Number(valor);
}

function atualizarTituloVolei(){
    let max = limite();
    document.getElementById("vlTitulo").textContent =
        "🏐 Vôlei" + (max > 0 ? " • até " + max + " pontos" : "");
}

document.getElementById("limitePontos").addEventListener("change", () => {
    atualizarTituloVolei();
    btEnviarEstadoCompleto();
});

document.getElementById("pontosPersonalizado").addEventListener("input", () => {
    atualizarTituloVolei();
    btEnviarEstadoCompleto();
});

atualizarTituloVolei();

document.getElementById("vlAzulMais").onclick = ()=>{
    pontosAzul++;
    historico.push("azul");
    document.getElementById("pontosAzul").innerHTML = pontosAzul;
    btEnviar({ t: "ponto", time: "azul" });
    verificarFim();
};

document.getElementById("vlVermelhoMais").onclick = ()=>{
    pontosVermelho++;
    historico.push("vermelho");
    document.getElementById("pontosVermelho").innerHTML = pontosVermelho;
    btEnviar({ t: "ponto", time: "vermelho" });
    verificarFim();
};

document.getElementById("desfazerPonto").onclick = ()=>{
    let ultimo = historico.pop();
    if(!ultimo) return;

    if(ultimo=="azul"){
        pontosAzul--;
        document.getElementById("pontosAzul").innerHTML = pontosAzul;
    }else{
        pontosVermelho--;
        document.getElementById("pontosVermelho").innerHTML = pontosVermelho;
    }
    btEnviar({ t: "desfazer" });
};

function verificarFim(){
    let max = limite();
    if(max<=0) return;

    if(pontosAzul>=max || pontosVermelho>=max){
        const vencedor = pontosAzul >= max ? "azul" : "vermelho";
        const nomeVencedor = vencedor == "azul" ? "🔵 Azul" : "🔴 Vermelho";
        const placarFinal = pontosAzul + " x " + pontosVermelho;
        const temTimes = azulAtual.length > 0 && vermelhoAtual.length > 0;

        setTimeout(()=>{
            const msg = temTimes
                ? "🏁 Fim da partida!\n\n" + nomeVencedor + " venceu (" + placarFinal + ")\n\nOK = Próxima rodada (quem perdeu sai e entra um novo time)\nCancelar = Desfazer ponto"
                : "🏁 Fim da partida!\n\n" + nomeVencedor + " venceu (" + placarFinal + ")\n\nOK = Nova partida\nCancelar = Desfazer ponto";

            if(confirm(msg)){
                if(temTimes) proximaRodada(vencedor);
                zerarVolei();
            }else{
                document.getElementById("desfazerPonto").click();
            }
        },100);
    }
}

let paginaAtual = "jogadores";
menus.forEach(botao => {
    botao.addEventListener("click", () => {
        paginaAtual = botao.dataset.page;
    });
});

window.addEventListener("orientationchange", () => {
    setTimeout(() => {
        paginas.forEach(p => p.classList.remove("ativa"));
        menus.forEach(b => b.classList.remove("ativo"));
        document.getElementById(paginaAtual).classList.add("ativa");
        document.querySelector(`.menu[data-page="${paginaAtual}"]`).classList.add("ativo");
    }, 200);
});

// ==========================
// MULTI-ESPORTES (basquete, futsal, futebol)
// ==========================

const ESPORTES = {
    basquete: {
        nome: "Basquete", periodos: 4, minutos: 10, prorrog: 5,
        regressivo: true, rotulo: n => n + "º Quarto",
        pontos: [1, 2, 3], limiteFaltas: 5, rotuloLimite: "BÔNUS", zerarFaltas: true, tempos: true
    },
    futsal: {
        nome: "Futsal", periodos: 2, minutos: 20, prorrog: 5,
        regressivo: true, rotulo: n => n + "º Tempo",
        pontos: [1], limiteFaltas: 5, rotuloLimite: "LIMITE", zerarFaltas: true, tempos: true
    },
    futebol: {
        nome: "Futebol", periodos: 2, minutos: 45, prorrog: 15,
        regressivo: false, rotulo: n => n + "º Tempo",
        pontos: [1], limiteFaltas: 0, rotuloLimite: "", zerarFaltas: false, tempos: false
    }
};

let esporteAtual = "volei";
let tp = null;
let tpIntervalo = null;
const tpEstados = {};

function tpNovo(chave) {
    const t = {
        chave: chave, periodo: 0, seg: 0, alvo: 0, rodando: false,
        ultimo: 0, avisou: false, fim: false, hist: [],
        azul: { pts: 0, faltas: 0, tempos: 0 },
        vermelho: { pts: 0, faltas: 0, tempos: 0 }
    };
    tpPosicionar(t, 0);
    return t;
}

function tpDuracao(e, i) {
    return (i < e.periodos ? e.minutos : e.prorrog) * 60;
}

function tpPosicionar(t, i) {
    const e = ESPORTES[t.chave];
    t.periodo = i;
    if (e.regressivo) {
        t.seg = tpDuracao(e, i);
        t.alvo = 0;
    } else {
        let inicio = 0;
        for (let k = 0; k < i; k++) inicio += tpDuracao(e, k);
        t.seg = inicio;
        t.alvo = inicio + tpDuracao(e, i);
    }
    t.avisou = false;
    t.fim = false;
}

function tpNomePeriodo(chave, i) {
    const e = ESPORTES[chave];
    if (i < e.periodos) return e.rotulo(i + 1);
    const n = i - e.periodos + 1;
    return "Prorrogação" + (n > 1 ? " " + n : "");
}

function apito() {
    try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        const ctx = new Ctx();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.value = 880;
        g.gain.value = 0.2;
        o.start();
        o.stop(ctx.currentTime + 0.8);
    } catch (e) {}
    if (navigator.vibrate) navigator.vibrate([300, 100, 300]);
}

function tpMostrar() {
    const e = ESPORTES[tp.chave];
    const s = e.regressivo ? Math.ceil(tp.seg) : Math.floor(tp.seg);
    const m = Math.floor(s / 60);
    const r = s % 60;
    const el = document.getElementById("tpRelogio");
    el.textContent = String(m).padStart(2, "0") + ":" + String(r).padStart(2, "0");
    el.classList.toggle("estourou", !e.regressivo && tp.seg >= tp.alvo);
    el.classList.toggle("parado", !tp.rodando);
}

function tpRenderTopo() {
    document.getElementById("tpPeriodo").textContent =
        tpNomePeriodo(tp.chave, tp.periodo) + (tp.fim ? " • ⏰ Fim do período" : "");
    const b = document.getElementById("tpPlay");
    b.textContent = tp.rodando ? "⏸️ Pausar" : "▶️ Iniciar";
    b.classList.toggle("rodando", tp.rodando);
    tpMostrar();
}

function tpRenderTimes() {
    const e = ESPORTES[tp.chave];

    const caixa = (cor, titulo) => {
        const t = tp[cor];
        const aviso = (e.limiteFaltas && t.faltas >= e.limiteFaltas)
            ? ` <span class="bonus">${e.rotuloLimite}</span>` : "";

        const controle = (rotulo, campo, valor, extra) => `
        <div class="linhaExtra">
            <span>${rotulo}${extra || ""}</span>
            <span class="controles">
                <button data-a="${campo}" data-t="${cor}" data-v="-1">−</button>
                <b>${valor}</b>
                <button data-a="${campo}" data-t="${cor}" data-v="1">+</button>
            </span>
        </div>`;

        return `
        <div class="timeBox ${cor}">
            <h3>${titulo}</h3>
            <div class="gols">${t.pts}</div>
            <div class="botoesPonto">
                ${e.pontos.map(p =>
                    `<button data-a="pts" data-t="${cor}" data-v="${p}">+${p}</button>`
                ).join("")}
            </div>
            ${controle("Faltas", "faltas", t.faltas, aviso)}
            ${e.tempos ? controle("Pedidos de tempo", "tempos", t.tempos) : ""}
        </div>`;
    };

    document.getElementById("tpTimes").innerHTML =
        caixa("azul", "🔵 Azul") + caixa("vermelho", "🔴 Vermelho");
}

function tpTick() {
    const agora = Date.now();
    const dt = (agora - tp.ultimo) / 1000;
    tp.ultimo = agora;

    if (ESPORTES[tp.chave].regressivo) {
        tp.seg -= dt;
        if (tp.seg <= 0) {
            tp.seg = 0;
            tpPausar();
            tp.fim = true;
            apito();
            tpRenderTopo();
            return;
        }
    } else {
        tp.seg += dt;
        if (!tp.avisou && tp.seg >= tp.alvo) {
            tp.avisou = true;
            apito();
        }
    }
    tpMostrar();
}

function tpIniciar() {
    if (tp.rodando) return;
    if (ESPORTES[tp.chave].regressivo && tp.seg <= 0) return;
    tp.rodando = true;
    tp.ultimo = Date.now();
    tpIntervalo = setInterval(tpTick, 200);
    tpRenderTopo();
}

function tpPausar() {
    tp.rodando = false;
    clearInterval(tpIntervalo);
    tpIntervalo = null;
    tpRenderTopo();
}

function tpSnapshot() {
    tp.hist.push(JSON.stringify({ azul: tp.azul, vermelho: tp.vermelho }));
    if (tp.hist.length > 100) tp.hist.shift();
}

document.getElementById("tpTimes").addEventListener("click", ev => {
    const b = ev.target.closest("button[data-a]");
    if (!b) return;
    const time = tp[b.dataset.t];
    const campo = b.dataset.a;
    const novo = Math.max(0, time[campo] + Number(b.dataset.v));
    if (novo === time[campo]) return;
    tpSnapshot();
    time[campo] = novo;
    tpRenderTimes();
    btEnviar({ t: "tp_sync", chave: tp.chave, azul: tp.azul, vermelho: tp.vermelho });
});

document.getElementById("tpPlay").onclick = () => {
    tp.rodando ? tpPausar() : tpIniciar();
};

document.getElementById("tpAjuste").onclick = () => {
    const atual = document.getElementById("tpRelogio").textContent;
    const r = prompt("Ajustar relógio (mm:ss)", atual);
    if (r === null) return;
    const m = r.trim().match(/^(\d{1,3}):([0-5]?\d)$/);
    if (!m) {
        alert("Use o formato mm:ss, por exemplo 08:30");
        return;
    }
    tp.seg = Number(m[1]) * 60 + Number(m[2]);
    tp.fim = false;
    tp.avisou = !ESPORTES[tp.chave].regressivo && tp.seg >= tp.alvo;
    tpRenderTopo();
};

document.getElementById("tpProximo").onclick = () => {
    const e = ESPORTES[tp.chave];
    const prox = tp.periodo + 1;
    if (!confirm("Ir para: " + tpNomePeriodo(tp.chave, prox) + "?")) return;
    if (tp.rodando) tpPausar();
    if (e.zerarFaltas) {
        tp.azul.faltas = 0;
        tp.vermelho.faltas = 0;
    }
    tp.hist = [];
    tpPosicionar(tp, prox);
    tpRenderTopo();
    tpRenderTimes();
};

document.getElementById("tpDesfazer").onclick = () => {
    const ultimo = tp.hist.pop();
    if (!ultimo) return;
    const d = JSON.parse(ultimo);
    tp.azul = d.azul;
    tp.vermelho = d.vermelho;
    tpRenderTimes();
    btEnviar({ t: "tp_sync", chave: tp.chave, azul: tp.azul, vermelho: tp.vermelho });
};

document.getElementById("tpNova").onclick = () => {
    if (!confirm("Começar uma nova partida? O placar e o relógio serão zerados.")) return;
    if (tp.rodando) tpPausar();
    tp = tpNovo(tp.chave);
    tpEstados[tp.chave] = tp;
    tpRenderTopo();
    tpRenderTimes();
    btEnviar({ t: "tp_sync", chave: tp.chave, azul: tp.azul, vermelho: tp.vermelho });
};

function selecionarEsporte(chave) {
    if (tp && tp.rodando) tpPausar();
    if (tp) tpEstados[tp.chave] = tp;

    esporteAtual = chave;

    document.querySelectorAll("#seletorEsporte .chip").forEach(c => {
        c.classList.toggle("ativo", c.dataset.esporte === chave);
    });

    const volei = chave === "volei";
    document.getElementById("placarVolei").style.display = volei ? "block" : "none";
    document.getElementById("placarTempo").style.display = volei ? "none" : "block";

    if (!volei) {
        tp = tpEstados[chave] || tpNovo(chave);
        tpRenderTopo();
        tpRenderTimes();
    }

    try { localStorage.setItem("esporteAtual", chave); } catch (e) {}
}

document.querySelectorAll("#seletorEsporte .chip").forEach(c => {
    c.onclick = () => selecionarEsporte(c.dataset.esporte);
});

(function () {
    let salvo = "volei";
    try { salvo = localStorage.getItem("esporteAtual") || "volei"; } catch (e) {}
    if (salvo !== "volei" && !ESPORTES[salvo]) salvo = "volei";
    selecionarEsporte(salvo);
})();

try {
    if(screen.orientation && screen.orientation.unlock) screen.orientation.unlock();
} catch(e){}


// ==========================
// SINCRONIZAÇÃO VIA BLUETOOTH (APP NATIVO)
// ==========================

let btAplicando = false;

function btEnviar(obj) {
    if (btAplicando) return;
    if (typeof SyncBT !== "undefined" && SyncBT.conectado) {
        SyncBT.enviarPlacar(obj);
    }
}

function btEnviarEstadoCompleto() {
    btEnviar({
        t: "estado",
        pa: pontosAzul,
        pv: pontosVermelho,
        h: historico,
        az: azulAtual,
        ve: vermelhoAtual,
        fi: fila,
        lim: document.getElementById("limitePontos").value,
        limp: document.getElementById("pontosPersonalizado").value
    });
}

function btReceberPacote(m) {
    btAplicando = true;
    try {
        if (m.t === "ponto") {
            if (m.time === "azul") {
                pontosAzul++;
                document.getElementById("pontosAzul").innerHTML = pontosAzul;
            } else {
                pontosVermelho++;
                document.getElementById("pontosVermelho").innerHTML = pontosVermelho;
            }
            historico.push(m.time);
        } 
        else if (m.t === "desfazer") {
            const ultimo = historico.pop();
            if (ultimo === "azul") {
                pontosAzul--;
                document.getElementById("pontosAzul").innerHTML = pontosAzul;
            } else if (ultimo === "vermelho") {
                pontosVermelho--;
                document.getElementById("pontosVermelho").innerHTML = pontosVermelho;
            }
        } 
        else if (m.t === "estado") {
            pontosAzul = m.pa;
            pontosVermelho = m.pv;
            historico = m.h || [];
            document.getElementById("pontosAzul").innerHTML = pontosAzul;
            document.getElementById("pontosVermelho").innerHTML = pontosVermelho;

            if (m.az) azulAtual = m.az;
            if (m.ve) vermelhoAtual = m.ve;
            if (m.fi) fila = m.fi;
            mostrarTimes();

            const sel = document.getElementById("limitePontos");
            const per = document.getElementById("pontosPersonalizado");
            sel.value = m.lim;
            per.value = m.limp || "";
            atualizarTituloVolei();
        }
        else if (m.t === "tp_sync") {
            if (esporteAtual !== m.chave) selecionarEsporte(m.chave);
            tp.azul = m.azul;
            tp.vermelho = m.vermelho;
            tpRenderTimes();
        }
    } finally {
        btAplicando = false;
    }
}

// Inicia o ouvinte do Bluetooth assim que o app abrir
if (typeof SyncBT !== "undefined") {
    SyncBT.iniciar(btReceberPacote);
}

function btAtualizarBotoesStatus(texto) {
    const b1 = document.getElementById("btnSync");
    const b2 = document.getElementById("btnSyncTempo");
    if (b1) b1.textContent = texto;
    if (b2) b2.textContent = texto;
}

function abrirTelaBluetooth() {
    let tela = document.getElementById("syncTela");
    if (tela) {
        tela.style.display = "flex";
        return;
    }

    tela = document.createElement("div");
    tela.id = "syncTela";
    tela.innerHTML = `
    <div class="syncCaixa">
        <h3>📡 Conectar via Bluetooth</h3>
        <p class="syncDica">
            <b>Passo 1:</b> Pareie os dois celulares nas configurações de Bluetooth do Android.<br>
            <b>Passo 2:</b> Um celular cria a sala e o outro conecta na lista abaixo.
        </p>

        <div id="btStatusTexto" class="syncStatus">⚪ Aguardando ação...</div>

        <div class="syncEscolha">
            <button id="btBtnCriar">📱 Criar Sala<br><small>(Esperar conexão)</small></button>
            <button id="btBtnBuscar">🔍 Buscar Celular<br><small>(Conectar em sala)</small></button>
        </div>

        <div id="btListaAparelhos" style="margin-top:12px; display:flex; flex-direction:column; gap:8px;"></div>

        <div class="syncLinha" style="margin-top:18px;">
            <button id="btBtnFechar" style="background:#ef4444; color:#fff;">Fechar</button>
        </div>
    </div>`;

    document.body.appendChild(tela);

    const statusEl = document.getElementById("btStatusTexto");
    const listaEl = document.getElementById("btListaAparelhos");

    // Botão 1: Criar Sala (Anfitrião)
    document.getElementById("btBtnCriar").onclick = () => {
        listaEl.innerHTML = "";
        if (typeof SyncBT === "undefined") {
            statusEl.textContent = "❌ Erro: Arquivo bluetooth.js não encontrado.";
            return;
        }
        SyncBT.criarSala((msg) => {
            statusEl.textContent = msg;
            if (SyncBT.conectado) {
                btAtualizarBotoesStatus("🟢 Conectado");
                btEnviarEstadoCompleto();
            }
        });
    };

    // Botão 2: Buscar Aparelhos Pareados (Convidado)
    document.getElementById("btBtnBuscar").onclick = () => {
        listaEl.innerHTML = "Buscando aparelhos pareados...";
        if (typeof SyncBT === "undefined") {
            statusEl.textContent = "❌ Erro: Arquivo bluetooth.js não encontrado.";
            return;
        }
        SyncBT.listarAparelhos((aparelhos) => {
            listaEl.innerHTML = "";
            if (!aparelhos || aparelhos.length === 0) {
                listaEl.innerHTML = "<p style='font-size:13px; color:#fbbf24;'>Nenhum aparelho pareado encontrado. Pareie os celulares no Bluetooth do Android primeiro!</p>";
                return;
            }
            aparelhos.forEach(ap => {
                const btn = document.createElement("button");
                btn.style.background = "#243447";
                btn.style.color = "#fff";
                btn.style.textAlign = "left";
                btn.innerHTML = `📲 <b>${ap.name || "Sem nome"}</b> <br><small style="opacity:0.7">${ap.address}</small>`;
                
                btn.onclick = () => {
                    SyncBT.conectarNoAparelho(ap.address, (msg) => {
                        statusEl.textContent = msg;
                        if (SyncBT.conectado) {
                            btAtualizarBotoesStatus("🟢 Conectado");
                            listaEl.innerHTML = "";
                        }
                    });
                };
                listaEl.appendChild(btn);
            });
        });
    };

    document.getElementById("btBtnFechar").onclick = () => {
        tela.style.display = "none";
    };
}

document.getElementById("btnSync").onclick = abrirTelaBluetooth;
document.getElementById("btnSyncTempo").onclick = abrirTelaBluetooth;
