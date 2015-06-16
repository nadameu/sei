// ==UserScript==
// @name        SEI!
// @namespace   http://nadameu.com.br/sei
// @require     https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @include     https://sei.trf4.jus.br/sei/controlador.php?*
// @version     1
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_listValues
// @grant       GM_deleteValue
// ==/UserScript==
if (/[\?&]acao=procedimento_controlar[&$]/.test(window.location.search)) {
	modificarTelaProcessos();
}

function modificarTelaProcessos() {
	adicionarEstilos();
	criarBotoes();
	modificarTabelas();
	alternarExibicaoTipo(usuarioDesejaMostrarTipo());
	alternarExibicaoAnotacoes(usuarioDesejaMostrarAnotacoes());
}

function adicionarEstilos() {
	GM_addStyle('table.tabelaProcessos { border-collapse: collapse; } .mostrarTipo table.tabelaProcessos td { border: 0 solid black; border-width: 1px 0; } table.tabelaProcessos td.colAdicional { padding: 0.5em 0.3em; } div.anotacao { background-color: #ffa; }');
	GM_addStyle('.colAdicional, .anotacao, .tipo, .especificacao, .ambos { display: none; } .mostrarAnotacoes .colAdicional, .mostrarTipo .colAdicional { display: table-cell; } .mostrarAnotacoes .anotacao { display: block; } .mostrarAnotacoes .iconeAnotacao { display: none; } .mostrarTipo .tipo, .mostrarTipo .especificacao { display: block; } .mostrarTipo th .tipo, .mostrarAnotacoes th .anotacao, .mostrarTipo.mostrarAnotacoes th .ambos { display: inline; font-weight: bold; }');
}

function criarBotoes() {
	var botaoTipo = criarBotaoTipo();
	$('#ancMeusProcessos').after('<br/>');
	$('#ancMeusProcessos').next().after(botaoTipo);
	var botaoAnotacoes = criarBotaoAnotacoes();
	botaoTipo.after('<br/>');
	botaoTipo.next().after(botaoAnotacoes);
}

function criarBotaoTipo() {
	return criarBotao('Mostrar tipo e especificação dos processos', usuarioDesejaMostrarTipo(), function() {
		usuarioDesejaMostrarTipo(this.checked);
		alternarExibicaoTipo(this.checked);
	});
}

function criarBotaoAnotacoes() {
	return criarBotao('Mostrar anotações dos processos', usuarioDesejaMostrarAnotacoes(), function() {
		usuarioDesejaMostrarAnotacoes(this.checked);
		alternarExibicaoAnotacoes(this.checked);
	});
}

function criarBotao(texto, checked, handler) {
	var botao = $('<input type="checkbox">');
	botao.get(0).checked = checked;
	var label = $('<label></label>');
	label.append(botao).append(' ' + texto);
	botao.on('change', handler);
	return label;
}

function usuarioDesejaMostrarTipo(value) {
	if (typeof value !== 'undefined') {
		if (value !== true && value !== false) {
			throw new Error('Valor inválido: ' + value);
		}
		GM_setValue('mostrarTipo', value === true ? 'S' : 'N');
	}
	return GM_getValue('mostrarTipo', 'N') === 'S';
}

function usuarioDesejaMostrarAnotacoes(value) {
	if (typeof value !== 'undefined') {
		if (value !== true && value !== false) {
			throw new Error('Valor inválido: ' + value);
		}
		GM_setValue('mostrarAnotacoes', value === true ? 'S' : 'N');
	}
	return GM_getValue('mostrarAnotacoes', 'N') === 'S';
}

function criarColunasAdicionais() {
	$('table.tabelaProcessos').each(function(i, tabela) {
		criarColunaAdicional(tabela);
	});
}

function criarColunaAdicional(tabela) {
	$(tabela).find('tr').each(function(i, linha) {
		if ($(linha).find('th').length > 0) {
			$('th:nth-child(3)', linha).after('<th class="tituloProcessos colAdicional"><span class="tipo">Tipo / Especificação</span><span class="ambos"> / </span><span class="anotacao">Anotações</span></th>');
		} else {
			$('td:nth-child(3)', linha).after('<td class="colAdicional"></td>');
		}
	});
}

function modificarTabelas() {
	analisarTipo();
	analisarAnotacoes();
}

function analisarTipo() {
	$('a[href^="controlador.php?acao=procedimento_trabalhar"]').each(function(i, link) {
		var mouseover = $(link).attr('onmouseover');
		let [trash, text, title] = /^return infraTooltipMostrar\('(.*)','(.*)'\);$/.exec(mouseover);
		escreverColunaAdicional(link, '<div class="tipo"><b>' + corrigirHTML(title) + '</b></div>');
		escreverColunaAdicional(link, '<div class="especificacao">' + corrigirHTML(text) + '</div></td>');
	});
}

function analisarAnotacoes() {
	$('img[src="imagens/sei_anotacao_pequeno.gif"]').each(function(i, img) {
		var mouseover = $(img).attr('onmouseover');
		let [trash, text, user] = /^return infraTooltipMostrar\('(.*)','(.*)'\);$/.exec(mouseover);
		escreverColunaAdicional(img, '<div class="anotacao">' + corrigirHTML(text) + ' (' + corrigirHTML(user) + ')</div>');
		$(img).addClass('iconeAnotacao');
	});
}

function escreverColunaAdicional(elemento, texto) {
	var coluna = obterColuna(elemento);
	$(coluna).append(texto);
}

function obterColuna(elemento) {
	var coluna, colunas = $(elemento).parents('tr').find('td.colAdicional');
	if (colunas.length > 0) {
		return colunas[0];
	} else {
		criarColunasAdicionais();
		return obterColuna(elemento);
	}
}

function alternarExibicaoTipo(exibir) {
	$('body').toggleClass('mostrarTipo', exibir);
	if (exibir) {
		var fn = function(i, link) {
			$(link).attr('onmouseover', 'return; ' + $(link).attr('onmouseover'));
		};
	} else {
		var fn = function(i, link) {
			$(link).attr('onmouseover', $(link).attr('onmouseover').replace(/^return; /, ''));
		};
	}
	$('a[href^="controlador.php?acao=procedimento_trabalhar"]').each(fn);
}

function alternarExibicaoAnotacoes(exibir) {
	$('body').toggleClass('mostrarAnotacoes', exibir);
}

function corrigirHTML(texto) {
	return texto.replace(/\\r/g, '\r').replace(/\\n/g, '\n').replace(/\\&/g, '&');
}
