// ==UserScript==
// @name        SEI!
// @namespace   http://nadameu.com.br/sei
// @include     https://sei.trf4.jus.br/sei/controlador.php?*
// @include     https://sei.trf4.jus.br/controlador.php?*
// @version     12.1.0
// ==/UserScript==
    
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

// https://www.w3.org/TR/WCAG20-TECHS/G18.html#G18-tests
const luminance = (hex) => {
    const [r, g, b] = hex
        .match(/^([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/)
        .slice(1)
        .map(x => parseInt(x, 16))
        .map(x => x / 255)
        .map(x => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const whiteLuminance = 1;
const contrastRatio = (hex) => (whiteLuminance + 0.05) / (luminance(hex) + 0.05);
const isContrastEnough = (hex) => contrastRatio(hex) >= 4.5;
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

function criarElementoEstilo(text) {
    const style = document.createElement('style');
    style.textContent = text;
    document.head.appendChild(style);
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

.colAdicional, .colAdicionalMarcador, .anotacao, .tipo, .especificacao, .ambos { display: none; }
.mostrarAnotacoes .colAdicional, .mostrarTipo .colAdicional { display: table-cell; }
.mostrarAnotacoes .anotacao { display: block; }
.mostrarAnotacoes .iconeAnotacao { display: none; }
.mostrarTipo .tipo, .mostrarTipo .especificacao { display: block; }
.mostrarTipo th .tipo, .mostrarAnotacoes th .anotacao, .mostrarTipo.mostrarAnotacoes th .ambos { display: inline; font-weight: bold; }
.mostrarMarcadores .iconeMarcador { display: none; }
.mostrarMarcadores .colAdicionalMarcador { display: table-cell; }
.ocultarCores tr { background: none !important; }
.ocultarFieldset fieldset > * { display: none; }
.ocultarFieldset fieldset legend { display: inherit; }

div.marcador, tr.infraTrAcessada div.marcador { padding: 1px; border: 1px solid black; border-radius: 4px; color: white; }
`;
    const cores = CoresMarcadores.map(({ cor, hex, inverterTexto }) => `
div.marcador[data-cor="${cor}"], tr.infraTrAcessada div.marcador[data-cor="${cor}"] {
  border-color: #${hex};
  background-color: #${hex};
  ${inverterTexto ? 'color: black;' : ''}
}`);
    criarElementoEstilo([styles].concat(cores).join('\n'));
}

const toggleBodyClass = (className) => (active) => {
    document.body.classList.toggle(className, active);
};
const alternarOcultacaoFieldset = toggleBodyClass('ocultarFieldset');
function alternarExibicaoTipo(exibir) {
    toggleBodyClass('mostrarTipo')(exibir);
    document
        .querySelectorAll('a[href^="controlador.php?acao=procedimento_trabalhar"]')
        .forEach(exibir
        ? link => {
            link.setAttribute('onmouseover', `return; ${link.getAttribute('onmouseover') || ''}`);
        }
        : link => {
            link.setAttribute('onmouseover', (link.getAttribute('onmouseover') || '').replace(/^return; /, ''));
        });
}
const alternarExibicaoAnotacoes = toggleBodyClass('mostrarAnotacoes');
const alternarExibicaoMarcadores = toggleBodyClass('mostrarMarcadores');
function alternarExibicaoCores(exibir) {
    toggleBodyClass('ocultarCores')(!exibir);
}

const Ordenacao = {
    PADRAO: 0,
    NUMERO: 1,
    TIPO: 2,
    ANOTACAO: 3,
    INVERTER: 4,
    PRIORITARIOS: 8,
};

const getSetBoolean = (name) => (value) => {
    if (typeof value === 'boolean')
        setValue(name, value ? 'S' : 'N');
    return getValue(name, 'N') === 'S';
};
const getSetInt = (name) => (value) => {
    if (typeof value === 'number' && Number.isInteger(value))
        setValue(name, value.toString());
    else if (value !== undefined)
        throw new Error(`Valor inválido para "${name}": "${value}"`);
    return Number(getValue(name, '0'));
};
const usuarioDesejaMostrarTipo = getSetBoolean('mostrarTipo');
const usuarioDesejaMostrarAnotacoes = getSetBoolean('mostrarAnotacoes');
const usuarioDesejaMostrarCores = getSetBoolean('mostrarCores');
const usuarioDesejaMostrarMarcadores = getSetBoolean('mostrarMarcadores');
const usuarioDesejaOrdenarTabelas = getSetInt('ordenarTabelas');
const usuarioDesejaAgruparMarcadores = getSetBoolean('agruparMarcadores');
const usuarioDesejaOcultarFieldset = getSetBoolean('ocultarFieldset');
function getValue(name, defaultValue) {
    const value = localStorage.getItem(name);
    return value !== null && value !== void 0 ? value : defaultValue;
}
function setValue(name, value) {
    localStorage.setItem(name, value);
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
const compareDefault = (a, b) => {
    return a < b ? Ordering.LT : a > b ? Ordering.GT : Ordering.EQ;
};
function compareUsing(f) {
    return (a, b) => compareDefault(f(a), f(b));
}

function gerarFuncaoOrdenarPorMarcador(fnOrdenacao, inverter) {
    return (a, b) => {
        let textoA = a.marcador === '' ? 'zz' : a.marcador;
        let textoB = b.marcador === '' ? 'zz' : b.marcador;
        if (inverter) {
            [textoB, textoA] = [textoA, textoB];
        }
        return textoA < textoB ? Ordering.LT : textoA > textoB ? Ordering.GT : fnOrdenacao(a, b);
    };
}
const ordenarPorOrdemPadrao = compareUsing(x => x.ordemOriginal);
const ordenarPorAnotacao = altOrdering(compareUsing(x => (x.anotacao === '' ? 'zz' : x.anotacao)), ordenarPorOrdemPadrao);
const ordenarPorAnotacaoPrioritariosPrimeiro = altOrdering(compareUsing(x => `${x.prioridade === '' ? 'zz' : x.prioridade}${x.anotacao === '' ? 'zz' : x.anotacao}`), ordenarPorOrdemPadrao);
const ordenarPorNumero = compareUsing(x => x.numero);
const ordenarPorTipoEspecificacaoAnotacao = altOrdering(compareUsing(({ tipo, especificacao, anotacao }) => `${tipo}${especificacao}${anotacao}`), ordenarPorOrdemPadrao);

function definirOrdenacaoTabelas(ordenacao, agrupar) {
    document.querySelectorAll('table.tabelaControle').forEach(tabela => {
        const linhas = tabela.querySelectorAll('tr[id]');
        const informacoes = [];
        linhas.forEach((linha, l) => {
            const links = linha.querySelectorAll('a[href^="controlador.php?acao=procedimento_trabalhar&"]');
            links.forEach(link => {
                if (!link.getAttribute('data-ordem-original')) {
                    link.setAttribute('data-ordem-original', String(l));
                }
            });
            const linksAlterados = linha.querySelectorAll('a[data-ordem-original]');
            if (linksAlterados.length === 0)
                throw new Error('Link do processo não encontrado.');
            const link = linksAlterados[0];
            const numeroFormatado = link.textContent;
            if (!numeroFormatado)
                throw new Error('Número do processo não encontrado.');
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
            const numero = ano * 1000000000 + ordinal + local / 10000;
            const campos = ['tipo', 'especificacao', 'anotacao', 'prioridade', 'marcador'];
            const informacao = campos.reduce((obj, dado) => {
                var _a, _b;
                const texto = (_b = (_a = linha.querySelectorAll(`.${dado}`)[0]) === null || _a === void 0 ? void 0 : _a.textContent) !== null && _b !== void 0 ? _b : '';
                return Object.assign(Object.assign({}, obj), { [dado]: texto.toLocaleLowerCase() });
            }, {
                elemento: linha,
                numero,
                ordemOriginal: Number(link.getAttribute('data-ordem-original')),
            });
            informacoes.push(informacao);
        });
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
        if (agrupar) {
            informacoes.sort(gerarFuncaoOrdenarPorMarcador(funcaoOrdenacao, (ordenacao & Ordenacao.INVERTER) > 0));
        }
        else {
            informacoes.sort(funcaoOrdenacao);
        }
        if (ordenacao & Ordenacao.INVERTER) {
            informacoes.reverse();
        }
        tabela.tBodies[0].append(...informacoes.map(x => x.elemento));
    });
}

const criarCheckboxBoolean = (texto, fnPreferencia, fnAlternarExibicao) => () => criarCheckbox(texto, fnPreferencia(), chkbox => {
    fnPreferencia(chkbox.checked);
    fnAlternarExibicao(chkbox.checked);
});
const criarCheckboxTipo = criarCheckboxBoolean('Mostrar tipo e especificação dos processos', usuarioDesejaMostrarTipo, alternarExibicaoTipo);
const criarCheckboxAnotacoes = criarCheckboxBoolean('Mostrar anotações dos processos', usuarioDesejaMostrarAnotacoes, alternarExibicaoAnotacoes);
const criarCheckboxMarcadores = criarCheckboxBoolean('Mostrar texto dos marcadores dos processos', usuarioDesejaMostrarMarcadores, alternarExibicaoMarcadores);
const criarCheckboxCor = criarCheckboxBoolean('Mostrar cores conforme tipo de processo', usuarioDesejaMostrarCores, alternarExibicaoCores);
function criarSelectOrdenacao() {
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
    select.value = String(usuarioDesejaOrdenarTabelas());
    const label = document.createElement('label');
    label.className = 'infraLabelOpcional';
    label.append('Ordenação dos processos: ', select);
    select.addEventListener('change', () => {
        const valor = Number(select.value);
        usuarioDesejaOrdenarTabelas(valor);
        definirOrdenacaoTabelas(valor, usuarioDesejaAgruparMarcadores());
    });
    return label;
}
function criarCheckboxAgruparMarcadores() {
    return criarCheckbox('Agrupar processos por marcador', usuarioDesejaAgruparMarcadores(), chkbox => {
        usuarioDesejaAgruparMarcadores(chkbox.checked);
        definirOrdenacaoTabelas(usuarioDesejaOrdenarTabelas(), chkbox.checked);
    });
}
function criarFormulario({ divRecebidos }) {
    const legend = document.createElement('legend');
    legend.style.fontSize = '1em';
    legend.appendChild(criarCheckbox('Ocultar preferências', usuarioDesejaOcultarFieldset(), chkbox => {
        usuarioDesejaOcultarFieldset(chkbox.checked);
        alternarOcultacaoFieldset(chkbox.checked);
    }));
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'infraFieldset';
    fieldset.append(legend, criarCheckboxTipo(), document.createElement('br'), criarCheckboxAnotacoes(), document.createElement('br'), criarCheckboxCor(), document.createElement('br'), criarCheckboxMarcadores(), document.createElement('br'), criarCheckboxAgruparMarcadores(), document.createElement('br'), criarSelectOrdenacao());
    divRecebidos.insertAdjacentElement('beforebegin', fieldset);
}
function criarCheckbox(texto, checked, handler) {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'infraCheckbox';
    input.checked = checked;
    const label = document.createElement('label');
    label.className = 'infraLabelOpcional';
    label.append(input, ` ${texto}`);
    input.addEventListener('change', () => handler(input));
    return label;
}

function corrigirHTML(texto) {
    return texto
        .replace(/\\r/g, '\r')
        .replace(/\\n/g, '\n')
        .replace(/\\&/g, '&')
        .replace(/\r\n/g, '<br/>');
}

const makeCriarColunaAdicional = (htmlCelulaCabecalho, htmlCelulaCorpo) => (tabela) => {
    tabela.querySelectorAll('tr').forEach(linha => {
        const terceiro = linha.querySelector('th:nth-child(3), td:nth-child(3)');
        if (!terceiro)
            throw new Error('Linha não possui colunas suficientes.');
        if (terceiro.matches('th')) {
            terceiro.insertAdjacentHTML('afterend', htmlCelulaCabecalho);
        }
        else {
            terceiro.insertAdjacentHTML('afterend', htmlCelulaCorpo);
        }
    });
};
const criarColunaAdicional = makeCriarColunaAdicional('<th class="tituloControle colAdicional"><span class="tipo">Tipo / Especificação</span><span class="ambos"> / </span><span class="anotacao">Anotações</span></th>', '<td class="colAdicional"></td>');
const criarColunaAdicionalMarcador = makeCriarColunaAdicional('<th class="tituloControle colAdicionalMarcador">Marcador</th>', '<td class="colAdicionalMarcador"></td>');

const obterColunaAdicional = (className, fnCriarColunas) => (elemento) => {
    const linha = elemento.closest('tr');
    if (!linha)
        throw new Error('Elemento não está contido em uma linha.');
    const go = (criadas = false) => {
        const colunas = linha.querySelectorAll(`td.${className}`);
        if (colunas.length > 0)
            return colunas[0];
        else if (!criadas) {
            fnCriarColunas();
            return go(true);
        }
        else
            throw new Error('Erro ao criar colunas adicionais.');
    };
    return go();
};
const makeCriarColunasAdicionais = (fn) => () => document.querySelectorAll('table.tabelaControle').forEach(fn);
const criarColunasAdicionais = makeCriarColunasAdicionais(criarColunaAdicional);
const criarColunasAdicionaisMarcador = makeCriarColunasAdicionais(criarColunaAdicionalMarcador);
const obterColuna = obterColunaAdicional('colAdicional', criarColunasAdicionais);
const obterColunaMarcador = obterColunaAdicional('colAdicionalMarcador', criarColunasAdicionaisMarcador);

const makeEscreverColunaAdicional = (fnObterColuna) => (elemento, html) => {
    const coluna = fnObterColuna(elemento);
    coluna.insertAdjacentHTML('beforeend', html);
};
const escreverColunaAdicional = makeEscreverColunaAdicional(obterColuna);
const escreverColunaAdicionalMarcador = makeEscreverColunaAdicional(obterColunaMarcador);
function escreverColunaAdicionalAnotacao(elemento, html, url, prioridade) {
    const classes = ['anotacao'];
    if (prioridade) {
        classes.push('prioridade');
    }
    const imagem = prioridade
        ? 'imagens/sei_anotacao_prioridade_pequeno.gif'
        : 'imagens/sei_anotacao_pequeno.gif';
    escreverColunaAdicional(elemento, `<div class="${classes.join(' ')}"><a href="${url}"><img src="${imagem}"/></a> ${html}</div>`);
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

function analisarTipo() {
    document
        .querySelectorAll('tr a[href^="controlador.php?acao=procedimento_trabalhar"][onmouseover]')
        .forEach(link => {
        const mouseover = link.getAttribute('onmouseover');
        const match = /^return infraTooltipMostrar\('(.*)','(.+)'\);$/.exec(mouseover);
        if (!match)
            throw new Error();
        const [, text, title] = match;
        escreverColunaAdicional(link, `<div class="tipo">${corrigirHTML(title)}</div>`);
        if (text !== '') {
            escreverColunaAdicional(link, `<div class="especificacao">${corrigirHTML(text)}</div>`);
        }
        const cor = obterCor(title);
        link.closest('tr').style.background = cor;
    });
}
function analisarAnotacoes() {
    const analisarAnotacao = (prioridade) => (img) => {
        const link = img.parentElement;
        const mouseover = link.getAttribute('onmouseover');
        const match = /^return infraTooltipMostrar\('(.*)','(.*)'\);$/.exec(mouseover);
        if (!match)
            throw new Error();
        const [, text, user] = match;
        escreverColunaAdicionalAnotacao(img, `${corrigirHTML(text)} (${corrigirHTML(user)})`, link.getAttribute('href'), prioridade);
        img.classList.add('iconeAnotacao');
    };
    document
        .querySelectorAll('a[href][onmouseover] > img[src="imagens/sei_anotacao_prioridade_pequeno.gif"]')
        .forEach(analisarAnotacao(true));
    document
        .querySelectorAll('a[href][onmouseover] > img[src="imagens/sei_anotacao_pequeno.gif"]')
        .forEach(analisarAnotacao(false));
}
function analisarMarcadores() {
    document
        .querySelectorAll('table a[onmouseover] > img[src^="imagens/marcador_"]')
        .forEach(img => {
        const match = /^imagens\/marcador_(.*)\.png$/.exec(img.getAttribute('src'));
        if (!match)
            throw new Error();
        const [, cor] = match;
        const mouseover = img.parentElement.getAttribute('onmouseover');
        const match2 = /^return infraTooltipMostrar\('(.*)','(.+)'\);$/.exec(mouseover);
        if (!match2)
            throw new Error();
        const [, text, title] = match2;
        escreverColunaAdicionalMarcador(img, `<div class="marcador" data-cor="${cor}">${corrigirHTML(title)}</div>`);
        if (text !== '') {
            escreverColunaAdicionalMarcador(img, `<div class="marcadorTexto">${corrigirHTML(text)}</div>`);
        }
        img.classList.add('iconeMarcador');
    });
}

function modificarTabelas() {
    analisarTipo();
    analisarAnotacoes();
    analisarMarcadores();
}

function query(selector, parentNode = document) {
    const element = parentNode.querySelector(selector);
    return element === null
        ? Promise.reject(new Error(`Elemento não encontrado: \`${selector}\`.`))
        : Promise.resolve(element);
}

function modificarTelaProcessos() {
    return __awaiter(this, void 0, void 0, function* () {
        adicionarEstilos();
        const divRecebidos = yield query('div#divRecebidos');
        criarFormulario({ divRecebidos });
        modificarTabelas();
        alternarExibicaoTipo(usuarioDesejaMostrarTipo());
        alternarExibicaoAnotacoes(usuarioDesejaMostrarAnotacoes());
        alternarExibicaoMarcadores(usuarioDesejaMostrarMarcadores());
        alternarExibicaoCores(usuarioDesejaMostrarCores());
        definirOrdenacaoTabelas(usuarioDesejaOrdenarTabelas(), usuarioDesejaAgruparMarcadores());
        alternarOcultacaoFieldset(usuarioDesejaOcultarFieldset());
    });
}

function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const params = new URL(document.location.href).searchParams;
        if (params.get('acao') === 'procedimento_controlar') {
            yield modificarTelaProcessos();
        }
    });
}

main().catch(err => {
    console.error(err);
});
