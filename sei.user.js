// ==UserScript==
// @name        SEI!
// @namespace   http://nadameu.com.br/sei
// @include     https://sei.trf4.jus.br/sei/controlador.php?*
// @include     https://sei.trf4.jus.br/controlador.php?*
// @version     13.0.1
// ==/UserScript==
    
const CoresMarcadores = [
    { cor: 'amarelo', hex: 'fff200' },
    { cor: 'amarelo_claro', hex: 'dde134' },
    { cor: 'amarelo_ouro', hex: 'f7b431' },
    { cor: 'azul', hex: '4285f4' },
    { cor: 'azul_ceu', hex: '009df2' },
    { cor: 'azul_marinho', hex: '002d9e' },
    { cor: 'azul_riviera', hex: '205d8c' },
    { cor: 'bege', hex: 'f8d396' },
    { cor: 'branco', hex: 'ffffff' },
    { cor: 'bronze', hex: 'a56738' },
    { cor: 'champagne', hex: 'e0a076' },
    { cor: 'ciano', hex: '00ffff' },
    { cor: 'cinza', hex: 'c0c0c0' },
    { cor: 'cinza_escuro', hex: '527b79' },
    { cor: 'laranja', hex: 'ff5f00' },
    { cor: 'lilas', hex: 'c892d8' },
    { cor: 'marrom', hex: '61280a' },
    { cor: 'ouro', hex: 'a7790b' },
    { cor: 'prata', hex: '81979d' },
    { cor: 'preto', hex: '000000' },
    { cor: 'rosa', hex: 'ff1cae' },
    { cor: 'rosa_claro', hex: 'ffa7dc' },
    { cor: 'roxo', hex: '68339b' },
    { cor: 'tijolo', hex: 'c35107' },
    { cor: 'verde', hex: '00ff00' },
    { cor: 'verde_abacate', hex: '57b952' },
    { cor: 'verde_agua', hex: '00c4ba' },
    { cor: 'verde_amazonas', hex: '007725' },
    { cor: 'verde_escuro', hex: '004225' },
    { cor: 'verde_turquesa', hex: '00858a' },
    { cor: 'vermelho', hex: 'ed1c24' },
    { cor: 'vinho', hex: '633039' },
].map(({ cor, hex }) => ({ cor, hex, inverterTexto: !isContrastEnough(hex) }));
// https://www.w3.org/TR/WCAG20-TECHS/G18.html#G18-tests
function luminance(hex) {
    const [r, g, b] = hex
        .match(/^([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/)
        .slice(1)
        .map(x => parseInt(x, 16))
        .map(x => x / 255)
        .map(x => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrastRatio(hex) {
    return 1.05 / (luminance(hex) + 0.05);
}
function isContrastEnough(hex) {
    return contrastRatio(hex) >= 4.5;
}

function analisarPagina() {
    const tabelas = document.querySelectorAll('table.tabelaControle');
    if (tabelas.length !== 2)
        throw new Error(`Número inesperado de tabelas: ${tabelas.length}.`);
    const infoTabelas = Array.from(tabelas, analisarTabela);
    const divRecebidos = document.querySelector('div#divRecebidos');
    if (!divRecebidos)
        throw new Error('Elemento não encontrado: "#divRecebidos".');
    return { divRecebidos, tabelas: infoTabelas };
}
function analisarTabela(tabela) {
    if (tabela.tBodies.length !== 1)
        throw new Error('Erro ao analisar tabela.');
    const cabecalho = tabela.rows[0];
    const err = () => {
        throw new Error('Erro ao analisar cabeçalho.');
    };
    if (!cabecalho)
        err();
    const celulasCabecalho = Array.from(cabecalho.cells);
    if (!celulasCabecalho.every(x => x.matches('th')))
        err();
    if (cabecalho.cells.length !== 2)
        err();
    if (cabecalho.cells[1].colSpan !== 3)
        err();
    const linhasProcessos = Array.from(tabela.rows).slice(1);
    return { elemento: tabela, cabecalho, processos: linhasProcessos.map(analisarLinha) };
}
function analisarTooltipLinkComMouseover(link) {
    const match = link
        .getAttribute('onmouseover')
        .match(/^return infraTooltipMostrar\('(.*)','(.+)'\);$/);
    if (!match)
        throw new Error('Erro ao analisar tooltip.');
    const [, texto, titulo] = match;
    return { titulo, texto: texto || undefined };
}
function analisarLinha(linha, ordemOriginal) {
    if (linha.cells.length !== 4)
        throw new Error(`Número inesperado de células: ${linha.cells.length}.`);
    const linkProcesso = linha.cells[2].querySelector('a[href^="controlador.php?acao=procedimento_trabalhar&"][onmouseover]');
    if (!linkProcesso)
        throw new Error('Link do processo não encontrado.');
    const numeroFormatado = linkProcesso.textContent;
    if (!numeroFormatado)
        throw new Error('Número do processo não encontrado.');
    const numero = analisarNumeroFormatado(numeroFormatado);
    const { titulo: tipo, texto: especificacao } = analisarTooltipLinkComMouseover(linkProcesso);
    const imgAnotacao = linha.cells[1].querySelector([1, 2].map(n => `a[href][onmouseover] > img[src^="svg/anotacao${n}\.svg"]`).join(', '));
    const anotacao = imgAnotacao ? analisarAnotacao(imgAnotacao) : undefined;
    const imgMarcador = linha.cells[1].querySelector(CoresMarcadores.map(({ cor }) => `a[href][onmouseover] > img[src^="svg/marcador_${cor}.svg"]`).join(', '));
    const marcador = imgMarcador ? analisarMarcador(imgMarcador) : undefined;
    return {
        linha,
        link: linkProcesso,
        ordemOriginal,
        numero,
        tipo,
        especificacao,
        anotacao,
        marcador,
    };
}
function analisarNumeroFormatado(numeroFormatado) {
    const textoNumero = numeroFormatado.replace(/[\.-]/g, '');
    let ano, ordinal, local;
    if (textoNumero.length === 20) {
        ano = Number(textoNumero.substr(9, 4));
        ordinal = Number(textoNumero.substr(0, 7));
        local = Number(textoNumero.substr(16, 4));
    }
    else if (textoNumero.length === 13) {
        ano = 2000 + Number(textoNumero.substr(0, 2));
        ordinal = Number(textoNumero.substr(3, 9));
        local = Number(textoNumero.substr(2, 1));
    }
    else {
        throw new Error(`Tipo de número desconhecido: ${numeroFormatado}.`);
    }
    return ano * 1000000000 + ordinal + local / 10000;
}
function analisarAnotacao(imgAnotacao) {
    const link = imgAnotacao.parentElement;
    const { titulo: usuario, texto } = analisarTooltipLinkComMouseover(link);
    if (!texto)
        throw new Error('Erro ao analisar tooltip.');
    const prioridade = /^svg\/anotacao2\.svg/.test(imgAnotacao.getAttribute('src'));
    return { texto, usuario, prioridade, imagem: imgAnotacao, src: imgAnotacao.src, url: link.href };
}
function analisarMarcador(imgMarcador) {
    const link = imgMarcador.parentElement;
    const { titulo: nome, texto } = analisarTooltipLinkComMouseover(link);
    const cor = imgMarcador.getAttribute('src').match(/^svg\/marcador_(.*)\.svg/)[1];
    return { imagem: imgMarcador, nome, cor, texto: texto || undefined };
}

function getSetBoolean(name, value) {
    if (typeof value === 'boolean')
        setValue(name, value ? 'S' : 'N');
    return getValue(name, 'N') === 'S';
}
function getSetInt(name, value) {
    if (typeof value === 'number' && Number.isInteger(value))
        setValue(name, value.toString());
    else if (value !== undefined)
        throw new Error(`Valor inválido para "${name}": "${value}"`);
    return Number(getValue(name, '0'));
}
function getValue(name, defaultValue) {
    const value = localStorage.getItem(name);
    return value !== null && value !== void 0 ? value : defaultValue;
}
function setValue(name, value) {
    localStorage.setItem(name, value);
}
function obterPreferencias() {
    return {
        ocultarFieldset: getSetBoolean('ocultarFieldset'),
        mostrarTipo: getSetBoolean('mostrarTipo'),
        mostrarAnotacoes: getSetBoolean('mostrarAnotacoes'),
        mostrarCores: getSetBoolean('mostrarCores'),
        mostrarMarcadores: getSetBoolean('mostrarMarcadores'),
        agruparMarcadores: getSetBoolean('agruparMarcadores'),
        ordemTabelas: getSetInt('ordemTabelas'),
    };
}

function adicionarEstilos() {
    const styles = `
table.tabelaControle { border-collapse: collapse; }
table.tabelaControle td:nth-child(3) { white-space: nowrap; }
.mostrarTipo table.tabelaControle td { border: 0 solid black; border-width: 1px 0; }
table.tabelaControle td.colAdicional, table.tabelaControle td.colAdicionalMarcador { padding: 0.5em 0.3em; }
div.anotacao { background-color: #ffa; }
div.anotacao.prioridade { background-color: #faa; font-weight: bold; }
div.tipo { font-weight: bold; }
div.marcador { text-align: center; font-weight: bold; }
td.colAdicionalMarcador img { float: left; padding-right: 1ex; }

th.colAdicional, td.colAdicional, th.colAdicionalMarcador, td.colAdicionalMarcador, .anotacao, .tipo, .especificacao, .ambos { display: none; }
.mostrarAnotacoes .colAdicional, .mostrarTipo .colAdicional { display: table-cell; }
.mostrarAnotacoes .anotacao { display: block; }
.mostrarAnotacoes .iconeAnotacao { display: none; }
.mostrarTipo .tipo, .mostrarTipo .especificacao { display: block; }
.mostrarTipo th .tipo, .mostrarAnotacoes th .anotacao, .mostrarTipo.mostrarAnotacoes th .ambos { display: inline; font-weight: bold; }
.mostrarMarcadores .iconeMarcador { display: none; }
.mostrarMarcadores .colAdicionalMarcador { display: table-cell; }
.ocultarCores tr { background: none !important; }
.ocultarFieldset fieldset > div { display: none; }
/* .ocultarFieldset fieldset legend { display: inherit; } */

div.marcador, tr.infraTrAcessada div.marcador { padding: 1px; border: 1px solid black; border-radius: 4px; color: white; }
`;
    const cores = CoresMarcadores.map(({ cor, hex, inverterTexto }) => `
div.marcador[data-cor="${cor}"], tr.infraTrAcessada div.marcador[data-cor="${cor}"] {
  border-color: #${hex};
  background-color: #${hex};
  ${inverterTexto ? 'color: black;' : ''}
}`);
    const style = document.createElement('style');
    style.textContent = [styles].concat(cores).join('\n');
    document.head.appendChild(style);
}

function corrigirHTML(texto) {
    return texto
        .replace(/\\r/g, '\r')
        .replace(/\\n/g, '\n')
        .replace(/\\&/g, '&')
        .replace(/\r\n/g, '<br/>');
}

function criarColunasAdicionaisCabecalho(cabecalho) {
    const coluna = cabecalho.cells[1];
    coluna.colSpan = 2;
    coluna.insertAdjacentHTML('afterend', [
        '<th class="infraTh tituloControle colAdicionalMarcador">Marcador</th>',
        '<th class="infraTh tituloControle colAdicional"><span class="tipo">Tipo / Especificação</span><span class="ambos"> / </span><span class="anotacao">Anotações</span></th>',
        '<th class="infraTh"></th>',
    ].join(''));
}
function criarColunasAdicionaisProcesso(linha, processo) {
    const coluna = linha.cells[2];
    coluna.insertAdjacentHTML('afterend', [
        criarColunaAdicionalMarcador(processo.marcador),
        '<td class="colAdicional">',
        criarDivTipo(processo.tipo),
        criarDivEspecificacao(processo.especificacao),
        criarDivAnotacao(processo.anotacao),
        '</td>',
    ].join(''));
}
function criarColunaAdicionalMarcador(marcador) {
    return [
        '<td class="colAdicionalMarcador">',
        marcador
            ? `<div class="marcador" data-cor="${marcador.cor}">${corrigirHTML(marcador.nome)}</div>${marcador.texto ? `<div class="marcadorTexto">${corrigirHTML(marcador.texto)}</div>` : ''}`
            : '',
        '</td>',
    ].join('');
}
function criarDivTipo(tipo) {
    return `<div class="tipo">${corrigirHTML(tipo)}</div>`;
}
function criarDivEspecificacao(especificacao) {
    return especificacao ? `<div class="especificacao">${corrigirHTML(especificacao)}</div>` : '';
}
function criarDivAnotacao(anotacao) {
    if (!anotacao)
        return '';
    const classes = ['anotacao'].concat(anotacao.prioridade ? ['prioridade'] : []);
    return `<div class="${classes.join(' ')}"><a href="${anotacao.url}"><img src="${anotacao.src}"></a> ${corrigirHTML(anotacao.texto)} (${corrigirHTML(anotacao.usuario)})</div>`;
}

const Acao = {
    setBool: (nome, valor) => ({ tipo: 'setBool', nome, valor }),
    setOrdenacao: (valor) => ({ tipo: 'setOrdenacao', valor }),
};

const Ordenacao = {
    PADRAO: 0,
    NUMERO: 1,
    TIPO: 2,
    ANOTACAO: 3,
    INVERTER: 4,
    PRIORITARIOS: 8,
};

function criarFormulario({ divRecebidos, preferencias, dispatch, }) {
    const div = document.createElement('div');
    div.append(criarCheckbox('Mostrar tipo e especificação dos processos', 'mostrarTipo'), document.createElement('br'), criarCheckbox('Mostrar anotações dos processos', 'mostrarAnotacoes'), document.createElement('br'), criarCheckbox('Mostrar cores conforme tipo de processo', 'mostrarCores'), document.createElement('br'), criarCheckbox('Mostrar texto dos marcadores dos processos', 'mostrarMarcadores'), document.createElement('br'), criarCheckbox('Agrupar processos por marcador', 'agruparMarcadores'), document.createElement('br'), criarSelectOrdenacao(preferencias.ordemTabelas, dispatch));
    const legend = document.createElement('legend');
    legend.style.fontSize = '1em';
    legend.appendChild(criarCheckbox('Ocultar preferências', 'ocultarFieldset'));
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'infraFieldset ml-0  pl-0 d-none  d-md-block  col-12 col-md-12';
    fieldset.append(legend, div);
    divRecebidos.insertAdjacentElement('beforebegin', fieldset);
    function criarCheckbox(texto, preferencia) {
        const id = `gmSeiChkBox${preferencia}`;
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.className = 'infraCheckbox';
        input.id = id;
        input.checked = preferencias[preferencia];
        input.addEventListener('change', () => dispatch(Acao.setBool(preferencia, input.checked)));
        const label = document.createElement('label');
        label.className = 'infraLabelOpcional';
        label.htmlFor = id;
        label.textContent = ` ${texto}`;
        const fragmento = document.createDocumentFragment();
        fragmento.append(input, label);
        return fragmento;
    }
}
function criarSelectOrdenacao(valor, dispatch) {
    const select = document.createElement('select');
    select.style.display = 'inline-block';
    select.style.fontSize = '1em';
    const campos = [
        { valor: Ordenacao.PADRAO, nome: 'Padrão' },
        { valor: Ordenacao.NUMERO, nome: 'Ano e número (antigos primeiro)' },
        { valor: Ordenacao.NUMERO | Ordenacao.INVERTER, nome: 'Ano e número (novos primeiro)' },
        { valor: Ordenacao.TIPO, nome: 'Tipo, especificação e anotação' },
        { valor: Ordenacao.ANOTACAO, nome: 'Anotação (somente texto)' },
        {
            valor: Ordenacao.ANOTACAO | Ordenacao.PRIORITARIOS,
            nome: 'Anotação (prioritários primeiro)',
        },
    ];
    const options = campos.map(({ nome, valor }) => `<option value="${valor}">${nome}</option>`);
    select.insertAdjacentHTML('beforeend', options.join(''));
    select.value = String(valor);
    const label = document.createElement('label');
    label.className = 'infraLabelOpcional';
    label.append('Ordenação dos processos: ', select);
    select.addEventListener('change', () => {
        const valor = Number(select.value);
        dispatch(Acao.setOrdenacao(valor));
    });
    return label;
}

const Ordering = { LT: -1, EQ: 0, GT: +1 };
function altOrdering(...fns) {
    return (a, b) => {
        let result = Ordering.EQ;
        for (const fn of fns) {
            result = fn(a, b);
            if (result !== Ordering.EQ)
                break;
        }
        return result;
    };
}
function compareDefault(a, b) {
    return a < b ? Ordering.LT : a > b ? Ordering.GT : Ordering.EQ;
}
function compareUsing(f) {
    return (a, b) => compareDefault(f(a), f(b));
}

function gerarFuncaoOrdenarPorMarcador(fnOrdenacao, inverter) {
    return altOrdering((a, b) => {
        var _a, _b, _c, _d;
        let textoA = (_b = (_a = a.marcador) === null || _a === void 0 ? void 0 : _a.nome.toLocaleLowerCase()) !== null && _b !== void 0 ? _b : 'zz';
        let textoB = (_d = (_c = b.marcador) === null || _c === void 0 ? void 0 : _c.nome.toLocaleLowerCase()) !== null && _d !== void 0 ? _d : 'zz';
        if (inverter) {
            [textoB, textoA] = [textoA, textoB];
        }
        return textoA < textoB ? Ordering.LT : textoA > textoB ? Ordering.GT : Ordering.EQ;
    }, fnOrdenacao);
}
const ordenarPorOrdemPadrao = compareUsing(x => x.ordemOriginal);
const ordenarPorAnotacao = altOrdering(compareUsing(x => { var _a, _b; return (_b = (_a = x.anotacao) === null || _a === void 0 ? void 0 : _a.texto.toLocaleLowerCase()) !== null && _b !== void 0 ? _b : 'zz'; }), ordenarPorOrdemPadrao);
const ordenarPorAnotacaoPrioritariosPrimeiro = altOrdering(compareUsing(x => { var _a, _b; return (((_b = (_a = x.anotacao) === null || _a === void 0 ? void 0 : _a.prioridade) !== null && _b !== void 0 ? _b : false) ? 'A' : 'B'); }), compareUsing(x => { var _a, _b; return (_b = (_a = x.anotacao) === null || _a === void 0 ? void 0 : _a.texto.toLocaleLowerCase()) !== null && _b !== void 0 ? _b : 'zz'; }), ordenarPorOrdemPadrao);
const ordenarPorNumero = compareUsing(x => x.numero);
const ordenarPorTipoEspecificacaoAnotacao = altOrdering(compareUsing(({ tipo, especificacao, anotacao }) => {
    var _a, _b;
    return `${tipo.toLocaleLowerCase()}${(_a = especificacao === null || especificacao === void 0 ? void 0 : especificacao.toLocaleLowerCase()) !== null && _a !== void 0 ? _a : 'zz'}${(_b = anotacao === null || anotacao === void 0 ? void 0 : anotacao.texto.toLocaleLowerCase()) !== null && _b !== void 0 ? _b : 'zz'}`;
}), ordenarPorOrdemPadrao);

function definirOrdenacaoProcessos(tabela, ordenacao, agrupar) {
    let funcaoOrdenacao;
    switch (ordenacao & 3) {
        case Ordenacao.ANOTACAO:
            if (ordenacao & Ordenacao.PRIORITARIOS) {
                funcaoOrdenacao = ordenarPorAnotacaoPrioritariosPrimeiro;
            }
            else {
                funcaoOrdenacao = ordenarPorAnotacao;
            }
            break;
        case Ordenacao.TIPO:
            funcaoOrdenacao = ordenarPorTipoEspecificacaoAnotacao;
            break;
        case Ordenacao.NUMERO:
            funcaoOrdenacao = ordenarPorNumero;
            break;
        case Ordenacao.PADRAO:
        default:
            funcaoOrdenacao = ordenarPorOrdemPadrao;
            break;
    }
    if (agrupar)
        funcaoOrdenacao = gerarFuncaoOrdenarPorMarcador(funcaoOrdenacao, (ordenacao & Ordenacao.INVERTER) > 0);
    const linhas = tabela.processos
        .slice()
        .sort(funcaoOrdenacao)
        .map(x => x.linha);
    const linhasOrdenadas = (ordenacao & Ordenacao.INVERTER) > 0 ? linhas.reverse() : linhas;
    tabela.elemento.tBodies[0].append(...linhasOrdenadas);
}

function obterCor(texto) {
    const STEPS_H = 10;
    const MULTI_H = 240 / STEPS_H;
    let h = 0;
    for (let i = 0, len = texto.length; i < len; i++) {
        h = (h + texto.charCodeAt(i)) % STEPS_H;
    }
    h = Math.floor(h * MULTI_H);
    return `hsl(${h}, 60%, 85%)`;
}

function renderizarPagina(pagina, preferencias, dispatch) {
    let mostrarTooltip = !preferencias.mostrarTipo;
    adicionarEstilos();
    criarFormulario({ divRecebidos: pagina.divRecebidos, preferencias, dispatch });
    for (const { cabecalho, processos } of pagina.tabelas) {
        for (const celula of cabecalho.cells)
            celula.removeAttribute('width');
        criarColunasAdicionaisCabecalho(cabecalho);
        for (const processo of processos) {
            processo.linha.style.backgroundColor = obterCor(processo.tipo);
            for (const celula of processo.linha.cells)
                celula.removeAttribute('width');
            criarColunasAdicionaisProcesso(processo.linha, processo);
            processo.link.removeAttribute('onmouseover');
            processo.link.addEventListener('mouseover', () => {
                var _a;
                if (mostrarTooltip)
                    infraTooltipMostrar((_a = processo.especificacao) !== null && _a !== void 0 ? _a : '', processo.tipo);
            });
            if (processo.anotacao)
                processo.anotacao.imagem.classList.add('iconeAnotacao');
            if (processo.marcador)
                processo.marcador.imagem.classList.add('iconeMarcador');
        }
    }
    let agruparAtual = undefined;
    let ordemAtual = undefined;
    atualizar(preferencias);
    return atualizar;
    function atualizar(preferencias) {
        mostrarTooltip = !preferencias.mostrarTipo;
        const campos = [
            'ocultarFieldset',
            'mostrarTipo',
            'mostrarAnotacoes',
            'mostrarMarcadores',
        ];
        for (const campo of campos) {
            document.body.classList.toggle(campo, preferencias[campo]);
        }
        document.body.classList.toggle('ocultarCores', !preferencias.mostrarCores);
        if (preferencias.agruparMarcadores !== agruparAtual ||
            preferencias.ordemTabelas !== ordemAtual) {
            agruparAtual = preferencias.agruparMarcadores;
            ordemAtual = preferencias.ordemTabelas;
            for (const tabela of pagina.tabelas)
                definirOrdenacaoProcessos(tabela, ordemAtual, agruparAtual);
        }
    }
}

function main() {
    const params = new URL(document.location.href).searchParams;
    if (params.get('acao') === 'procedimento_controlar') {
        const pagina = analisarPagina();
        const preferencias = obterPreferencias();
        const atualizar = renderizarPagina(pagina, preferencias, dispatch);
        function dispatch(acao) {
            switch (acao.tipo) {
                case 'setBool':
                    getSetBoolean(acao.nome, acao.valor);
                    break;
                case 'setOrdenacao':
                    getSetInt('ordemTabelas', acao.valor);
                    break;
            }
            atualizar(obterPreferencias());
        }
    }
}

try {
    main();
}
catch (err) {
    console.error(err);
}
