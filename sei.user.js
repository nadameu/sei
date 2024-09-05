// ==UserScript==
// @name        SEI!
// @namespace   http://nadameu.com.br/sei
// @include     https://sei.trf4.jus.br/sei/controlador.php?*
// @include     https://sei.trf4.jus.br/controlador.php?*
// @run-at      document-end
// @version     14.1.0
// ==/UserScript==
    
class ResultBase {
}
class Ok extends ResultBase {
    constructor(value) {
        super();
        this.value = value;
    }
}
function ok(value) {
    return new Ok(value);
}
class Err extends ResultBase {
    constructor(reason) {
        super();
        this.reason = reason;
    }
}
function err(reason) {
    return new Err(reason);
}
function isErr(result) {
    return result instanceof Err;
}
function tryCatch(fn, recover) {
    try {
        return ok(fn());
    }
    catch (e) {
        if (recover)
            return recover(e);
        return err(e);
    }
}
function all(results) {
    let ret = [];
    for (const result of results) {
        if (result instanceof Ok) {
            ret.push(result.value);
        }
        else {
            return result;
        }
    }
    return ok(ret);
}
function chain(f) {
    return (fa) => {
        if (fa instanceof Ok)
            return f(fa.value);
        return fa;
    };
}
function map(f) {
    return chain(x => ok(f(x)));
}
function hasLength(obj, length) {
    return obj.length === length;
}

function pipe(x) {
  let y = x;
  for (let i = 1, len = arguments.length; i < len; i += 1) {
    y = arguments[i](y);
  }
  return y;
}

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

class ParseError extends Error {
    constructor() {
        super(...arguments);
        this.name = 'ParseError';
    }
}

function analisarPagina() {
    const tabelas = document.querySelectorAll('table.tabelaControle');
    if (tabelas.length < 1 || tabelas.length > 2)
        return err(new ParseError(`Número inesperado de tabelas: ${tabelas.length}.`));
    const infoTabelas = all(Array.from(tabelas, analisarTabela));
    const divRecebidos = document.querySelector('div#divRecebidos, div#divGerados');
    if (!divRecebidos)
        return err(new ParseError('Elemento não encontrado: "#divRecebidos" | "#divGerados.'));
    return pipe(infoTabelas, map(infoTabelas => ({ divRecebidos, tabelas: infoTabelas })));
}
function analisarTabela(tabela) {
    return pipe(tryCatch(() => {
        if (!hasLength(tabela.tBodies, 1))
            throw new ParseError('Erro ao analisar tabela.');
        const tbody = tabela.tBodies[0];
        const cabecalho = tabela.rows[0];
        function assertCabecalho(condition) {
            if (!condition)
                throw new ParseError('Erro ao analisar cabeçalho.');
        }
        assertCabecalho(cabecalho !== undefined);
        const celulasCabecalho = Array.from(cabecalho.cells);
        assertCabecalho(celulasCabecalho.every(x => x.matches('th')));
        assertCabecalho(hasLength(celulasCabecalho, 2));
        assertCabecalho(celulasCabecalho[1].colSpan === 3);
        const linhasProcessos = Array.from(tabela.rows).slice(1);
        return pipe(all(linhasProcessos.map(analisarLinha)), map(processos => ({
            tabela,
            tbody,
            cabecalho,
            cabecalhoCells: celulasCabecalho,
            processos,
        })));
    }, e => {
        if (e instanceof ParseError)
            return err(e);
        throw e;
    }), chain(x => x));
}
function analisarTooltipLinkComMouseover(link) {
    const match = link
        .getAttribute('onmouseover')
        .match(/^return infraTooltipMostrar\('(.*)','(.+)'\);$/);
    if (!match || !hasLength(match, 3))
        return err(new ParseError('Erro ao analisar tooltip.'));
    const [, texto, titulo] = match;
    return ok({ titulo, texto: texto || undefined });
}
function analisarLinha(linha, ordemOriginal) {
    const cells = linha.cells;
    if (!hasLength(cells, 4))
        return err(new ParseError(`Número inesperado de células: ${cells.length}.`));
    const linkProcesso = cells[2].querySelector('a[href^="controlador.php?acao=procedimento_trabalhar&"][onmouseover]');
    if (!linkProcesso)
        return err(new ParseError('Link do processo não encontrado.'));
    const numeroFormatado = linkProcesso.textContent;
    if (!numeroFormatado)
        return err(new ParseError('Número do processo não encontrado.'));
    const numero = analisarNumeroFormatado(numeroFormatado);
    const imgAnotacao = cells[1].querySelector([1, 2].map(n => `a[href][onmouseover] > img[src^="svg/anotacao${n}\.svg"]`).join(', '));
    const anotacao = imgAnotacao ? analisarAnotacao(imgAnotacao) : ok(undefined);
    const imgMarcador = cells[1].querySelector(CoresMarcadores.map(({ cor }) => `a[href][onmouseover] > img[src^="svg/marcador_${cor}.svg"]`).join(', '));
    const marcador = imgMarcador ? analisarMarcador(imgMarcador) : ok(undefined);
    return pipe(all([analisarTooltipLinkComMouseover(linkProcesso), numero, anotacao, marcador]), map(([{ titulo: tipo, texto: especificacao }, numero, anotacao, marcador]) => ({
        linha,
        cells,
        link: linkProcesso,
        ordemOriginal,
        numero,
        tipo,
        especificacao,
        anotacao,
        marcador,
    })));
}
function analisarNumeroFormatado(numeroFormatado) {
    const textoNumero = numeroFormatado.replace(/[.\-\/]/g, '');
    let ano, ordinal, local;
    if (textoNumero.length === 20) {
        ano = Number(textoNumero.slice(9, 13));
        ordinal = Number(textoNumero.slice(0, 7));
        local = Number(textoNumero.slice(16, 20));
    }
    else if (textoNumero.length === 13) {
        ano = 2000 + Number(textoNumero.slice(0, 2));
        ordinal = Number(textoNumero.slice(3, 12));
        local = Number(textoNumero.slice(2, 3));
    }
    else if (textoNumero.length === 10) {
        ano = Number(textoNumero.slice(6, 10));
        ordinal = Number(textoNumero.slice(0, 6));
        local = 0;
    }
    else {
        return err(new ParseError(`Tipo de número desconhecido: ${numeroFormatado}.`));
    }
    return ok(ano * 1000000000 + ordinal + local / 10000);
}
function analisarAnotacao(imgAnotacao) {
    const link = imgAnotacao.parentElement;
    return pipe(analisarTooltipLinkComMouseover(link), chain(({ titulo: usuario, texto }) => {
        if (!texto)
            return err(new ParseError('Erro ao analisar tooltip.'));
        const prioridade = /^svg\/anotacao2\.svg/.test(imgAnotacao.getAttribute('src'));
        return ok({
            texto,
            usuario,
            prioridade,
            imagem: imgAnotacao,
            src: imgAnotacao.src,
            url: link.href,
        });
    }));
}
function analisarMarcador(imgMarcador) {
    return pipe(imgMarcador.parentElement, analisarTooltipLinkComMouseover, map(({ titulo: nome, texto }) => ({
        imagem: imgMarcador,
        nome,
        cor: imgMarcador.getAttribute('src').match(/^svg\/marcador_(.*)\.svg/)[1],
        texto,
    })));
}

const Criterio = {
    PADRAO: 0,
    NUMERO: 1,
    TIPO: 2,
    ANOTACAO: 3,
};
const sord = {
    parse(representation) {
        const valor = Number(representation);
        if (!Number.isInteger(valor) || valor < 0 || valor > 15)
            return { valid: false };
        return {
            valid: true,
            value: {
                criterio: (valor & 3),
                inverter: (valor & 4) === 4,
                prioritarios: (valor & 8) === 8,
            },
        };
    },
    serialize(value) {
        return (value.criterio + (value.inverter ? 4 : 0) + (value.prioritarios ? 8 : 0)).toString();
    },
};

const sbool = {
    parse(representation) {
        if (representation === 'S')
            return { valid: true, value: true };
        if (representation === 'N')
            return { valid: true, value: false };
        return { valid: false };
    },
    serialize(value) {
        return value ? 'S' : 'N';
    },
};
function getSetBoolean(name, value) {
    if (typeof value === 'boolean')
        setValue(name, sbool, value);
    return getValue(name, sbool, false);
}
function getSetOrdenacao(name, value) {
    if (typeof value !== 'undefined')
        setValue(name, sord, value);
    return getValue(name, sord, { criterio: Criterio.PADRAO, inverter: false, prioritarios: false });
}
function getValue(name, serializable, defaultValue) {
    const str = localStorage.getItem(name);
    if (str) {
        const result = serializable.parse(str);
        if (result.valid) {
            return result.value;
        }
        localStorage.removeItem(name);
    }
    return defaultValue;
}
function setValue(name, serializable, value) {
    localStorage.setItem(name, serializable.serialize(value));
}
function obterPreferencias() {
    return {
        ocultarFieldset: getSetBoolean('ocultarFieldset'),
        mostrarTipo: getSetBoolean('mostrarTipo'),
        mostrarAnotacoes: getSetBoolean('mostrarAnotacoes'),
        mostrarCores: getSetBoolean('mostrarCores'),
        mostrarMarcadores: getSetBoolean('mostrarMarcadores'),
        agruparMarcadores: getSetBoolean('agruparMarcadores'),
        ordemTabelas: getSetOrdenacao('ordemTabelas'),
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

function criarColunasAdicionaisCabecalho(cabecalhoCells) {
    const coluna = cabecalhoCells[1];
    coluna.colSpan = 2;
    coluna.insertAdjacentHTML('afterend', [
        '<th class="infraTh tituloControle colAdicionalMarcador">Marcador</th>',
        '<th class="infraTh tituloControle colAdicional"><span class="tipo">Tipo / Especificação</span><span class="ambos"> / </span><span class="anotacao">Anotações</span></th>',
        '<th class="infraTh"></th>',
    ].join(''));
}
function criarColunasAdicionaisProcesso({ cells, marcador, tipo, especificacao, anotacao, }) {
    const coluna = cells[2];
    coluna.insertAdjacentHTML('afterend', [
        criarColunaAdicionalMarcador(marcador),
        '<td class="colAdicional">',
        criarDivTipo(tipo),
        criarDivEspecificacao(especificacao),
        criarDivAnotacao(anotacao),
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
    const makeValor = ({ criterio = Criterio.PADRAO, inverter = false, prioritarios = false, }) => sord.serialize({
        criterio,
        inverter,
        prioritarios,
    });
    const campos = [
        {
            valor: { criterio: Criterio.PADRAO },
            nome: 'Padrão',
        },
        {
            valor: { criterio: Criterio.NUMERO },
            nome: 'Ano e número (antigos primeiro)',
        },
        {
            valor: { criterio: Criterio.NUMERO, inverter: true },
            nome: 'Ano e número (novos primeiro)',
        },
        {
            valor: { criterio: Criterio.TIPO },
            nome: 'Tipo, especificação e anotação',
        },
        {
            valor: { criterio: Criterio.ANOTACAO },
            nome: 'Anotação (somente texto)',
        },
        {
            valor: { criterio: Criterio.ANOTACAO, prioritarios: true },
            nome: 'Anotação (prioritários primeiro)',
        },
    ];
    const options = campos.map(({ nome, valor }) => `<option value="${makeValor(valor)}">${nome}</option>`);
    select.insertAdjacentHTML('beforeend', options.join(''));
    select.value = String(valor);
    const label = document.createElement('label');
    label.className = 'infraLabelOpcional';
    label.append('Ordenação dos processos: ', select);
    select.addEventListener('change', () => {
        const parsed = sord.parse(select.value);
        if (parsed.valid) {
            dispatch(Acao.setOrdenacao(parsed.value));
        }
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
    switch (ordenacao.criterio) {
        case Criterio.ANOTACAO:
            if (ordenacao.prioritarios) {
                funcaoOrdenacao = ordenarPorAnotacaoPrioritariosPrimeiro;
            }
            else {
                funcaoOrdenacao = ordenarPorAnotacao;
            }
            break;
        case Criterio.TIPO:
            funcaoOrdenacao = ordenarPorTipoEspecificacaoAnotacao;
            break;
        case Criterio.NUMERO:
            funcaoOrdenacao = ordenarPorNumero;
            break;
        case Criterio.PADRAO:
        default:
            funcaoOrdenacao = ordenarPorOrdemPadrao;
            break;
    }
    if (agrupar)
        funcaoOrdenacao = gerarFuncaoOrdenarPorMarcador(funcaoOrdenacao, ordenacao.inverter);
    const linhas = tabela.processos
        .slice()
        .sort(funcaoOrdenacao)
        .map(x => x.linha);
    const linhasOrdenadas = ordenacao.inverter ? linhas.reverse() : linhas;
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
    for (const { cabecalhoCells, processos } of pagina.tabelas) {
        for (const celula of cabecalhoCells)
            celula.removeAttribute('width');
        criarColunasAdicionaisCabecalho(cabecalhoCells);
        for (const processo of processos) {
            processo.linha.style.backgroundColor = obterCor(processo.tipo);
            for (const celula of processo.cells)
                celula.removeAttribute('width');
            criarColunasAdicionaisProcesso(processo);
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
    var _a;
    const params = new URL(document.location.href).searchParams;
    if (params.get('acao') === 'procedimento_controlar') {
        if (((_a = document.querySelector('input#hdnTipoVisualizacao')) === null || _a === void 0 ? void 0 : _a.value) !== 'R') {
            return ok(undefined);
        }
        const pagina = analisarPagina();
        const preferencias = obterPreferencias();
        return pipe(pagina, map(pagina => {
            const atualizar = renderizarPagina(pagina, preferencias, dispatch);
            function dispatch(acao) {
                switch (acao.tipo) {
                    case 'setBool':
                        getSetBoolean(acao.nome, acao.valor);
                        break;
                    case 'setOrdenacao':
                        getSetOrdenacao('ordemTabelas', acao.valor);
                        break;
                }
                atualizar(obterPreferencias());
            }
        }));
    }
    else {
        return ok(undefined);
    }
}

try {
    const result = main();
    if (isErr(result)) {
        console.error(result.reason);
    }
}
catch (err) {
    console.error(err);
}
