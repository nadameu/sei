// ==UserScript==
// @name        SEI!
// @namespace   http://nadameu.com.br/sei
// @require     https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @include     https://sei.trf4.jus.br/sei/controlador.php?*
// @version     9
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// ==/UserScript==

const Ordenacao = {
	PADRAO: 0,
	NUMERO: 1,
	TIPO: 2,
	ANOTACAO: 3,
	INVERTER: 4,
	PRIORITARIOS: 8
};

const CORES_MARCADORES = [
	{cor: 'preto', hex: '000'},
	{cor: 'branco', hex: 'fff', inverterTexto: true},
	{cor: 'cinza', hex: 'c0c0c0', inverterTexto: true},
	{cor: 'vermelho', hex: 'ed1c24'},
	{cor: 'amarelo', hex: 'fff200', inverterTexto: true},
	{cor: 'verde', hex: '0f0', inverterTexto: true},
	{cor: 'azul', hex: '4285f4'},
	{cor: 'rosa', hex: 'ff1cae'},
	{cor: 'roxo', hex: '68339b'},
	{cor: 'ciano', hex: '0ff', inverterTexto: true}
];

if (/[?&]acao=procedimento_controlar(&|$)/.test(window.location.search)) {
	modificarTelaProcessos();
}

function modificarTelaProcessos() {
	adicionarEstilos();
	criarBotoes();
	modificarTabelas();
	alternarExibicaoTipo(usuarioDesejaMostrarTipo());
	alternarExibicaoAnotacoes(usuarioDesejaMostrarAnotacoes());
	alternarExibicaoMarcadores(usuarioDesejaMostrarMarcadores());
	alternarExibicaoCores(usuarioDesejaMostrarCores());
	definirOrdenacaoTabelas(usuarioDesejaOrdenarTabelas(), usuarioDesejaAgruparMarcadores());
	alternarOcultacaoFieldset(usuarioDesejaOcultarFieldset());
}

function adicionarEstilos() {
	GM_addStyle([
		'table.tabelaControle { border-collapse: collapse; }',
		'.mostrarTipo table.tabelaControle td { border: 0 solid black; border-width: 1px 0; }',
		'table.tabelaControle td.colAdicional, table.tabelaControle td.colAdicionalMarcador { padding: 0.5em 0.3em; }',
		'div.anotacao { background-color: #ffa; }',
		'div.anotacao.prioridade { background-color: #faa; font-weight: bold; }',
		'div.tipo { font-weight: bold; }',
		'div.marcador { text-align: center; font-weight: bold; }',
		'td.colAdicionalMarcador img { float: left; padding-right: 1ex; }'
	].join(' '));
	GM_addStyle([
		'.colAdicional, .colAdicionalMarcador, .anotacao, .tipo, .especificacao, .ambos { display: none; }',
		'.mostrarAnotacoes .colAdicional, .mostrarTipo .colAdicional { display: table-cell; }',
		'.mostrarAnotacoes .anotacao { display: block; }',
		'.mostrarAnotacoes .iconeAnotacao { display: none; }',
		'.mostrarTipo .tipo, .mostrarTipo .especificacao { display: block; }',
		'.mostrarTipo th .tipo, .mostrarAnotacoes th .anotacao, .mostrarTipo.mostrarAnotacoes th .ambos { display: inline; font-weight: bold; }',
		'.mostrarMarcadores .iconeMarcador { display: none; }',
		'.mostrarMarcadores .colAdicionalMarcador { display: table-cell; }',
		'.ocultarCores tr { background: none !important; }',
		'.ocultarFieldset fieldset > * { display: none; }',
		'.ocultarFieldset fieldset legend { display: inherit; }'
	].join(' '));
	var cores = ['div.marcador, tr.infraTrAcessada div.marcador { padding: 1px; border: 1px solid black; border-radius: 4px; color: white; }'];
	CORES_MARCADORES.forEach(function(info) {
		cores.push('div.marcador[data-cor="' + info.cor + '"], tr.infraTrAcessada div.marcador[data-cor="' + info.cor + '"] { border-color: #' + info.hex + '; background-color: #' + info.hex + ';' + (info.inverterTexto ? ' color: black;' : '') + ' }');
	});
	GM_addStyle(cores.join(' '));
}

function criarBotoes() {
	let fragmento = document.createDocumentFragment();
	let fieldset = document.createElement('fieldset');
	fieldset.className = 'infraFieldset';
	fragmento.appendChild(fieldset);
	let legend = document.createElement('legend');
	legend.style.fontSize = '1em';
	legend.appendChild(criarBotao('Ocultar preferências', usuarioDesejaOcultarFieldset(), function() {
		usuarioDesejaOcultarFieldset(this.checked);
		alternarOcultacaoFieldset(this.checked);
	}));
	fieldset.appendChild(legend);
	fieldset.appendChild(criarBotaoTipo());
	fieldset.appendChild(document.createElement('br'));
	fieldset.appendChild(criarBotaoAnotacoes());
	fieldset.appendChild(document.createElement('br'));
	fieldset.appendChild(criarBotaoCor());
	fieldset.appendChild(document.createElement('br'));
	fieldset.appendChild(criarBotaoMarcadores());
	fieldset.appendChild(document.createElement('br'));
	fieldset.appendChild(criarBotaoAgruparMarcadores());
	fieldset.appendChild(document.createElement('br'));
	fieldset.appendChild(criarBotaoOrdenacao());
	$('#divRecebidos').before(fragmento);
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

function criarBotaoMarcadores() {
	return criarBotao('Mostrar texto dos marcadores dos processos', usuarioDesejaMostrarMarcadores(), function() {
		usuarioDesejaMostrarMarcadores(this.checked);
		alternarExibicaoMarcadores(this.checked);
	});
}

function criarBotaoCor() {
	return criarBotao('Mostrar cores conforme tipo de processo', usuarioDesejaMostrarCores(), function() {
		usuarioDesejaMostrarCores(this.checked);
		alternarExibicaoCores(this.checked);
	});
}

function criarBotaoOrdenacao() {
	var botao = $('<select class="infraSelect" style="display: inline-block; font-size: 1em;"></select>');
	[
		{valor: Ordenacao.PADRAO, nome: 'Padrão'},
		{valor: Ordenacao.NUMERO, nome: 'Ano e número (antigos primeiro)'},
		{valor: Ordenacao.NUMERO | Ordenacao.INVERTER, nome: 'Ano e número (novos primeiro)'},
		{valor: Ordenacao.TIPO, nome: 'Tipo, especificação e anotação'},
		{valor: Ordenacao.ANOTACAO, nome: 'Anotação (somente texto)'},
		{valor: Ordenacao.ANOTACAO | Ordenacao.PRIORITARIOS, nome: 'Anotação (prioritários primeiro)'}
	].forEach(function(opcao) {
		botao.append('<option value="' + opcao.valor + '">' + opcao.nome + '</option>');
	});
	botao.val(usuarioDesejaOrdenarTabelas());
	var label = $('<label class="infraLabelOpcional"></label>');
	label.append('Ordenação dos processos: ').append(botao);
	botao.on('change', function() {
		let valor = this.value | 0;
		usuarioDesejaOrdenarTabelas(valor);
		definirOrdenacaoTabelas(valor, usuarioDesejaAgruparMarcadores());
	});
	return label.get(0);
}

function criarBotaoAgruparMarcadores() {
	return criarBotao('Agrupar processos por marcador', usuarioDesejaAgruparMarcadores(), function() {
		usuarioDesejaAgruparMarcadores(this.checked);
		definirOrdenacaoTabelas(usuarioDesejaOrdenarTabelas(), this.checked);
	});
}

function criarBotao(texto, checked, handler) {
	var botao = $('<input type="checkbox" class="infraCheckbox"/>');
	botao.get(0).checked = checked;
	var label = $('<label class="infraLabelOpcional"></label>');
	label.append(botao).append(' ' + texto);
	botao.on('change', handler);
	return label.get(0);
}

function usuarioDesejaMostrarTipo(value) {
	return getSetBoolean('mostrarTipo', value);
}

function usuarioDesejaMostrarAnotacoes(value) {
	return getSetBoolean('mostrarAnotacoes', value);
}

function usuarioDesejaMostrarCores(value) {
	return getSetBoolean('mostrarCores', value);
}

function usuarioDesejaMostrarMarcadores(value) {
	return getSetBoolean('mostrarMarcadores', value);
}

function usuarioDesejaOrdenarTabelas(value) {
	return getSetInt('ordenarTabelas', value);
}

function usuarioDesejaAgruparMarcadores(value) {
	return getSetBoolean('agruparMarcadores', value);
}

function usuarioDesejaOcultarFieldset(value) {
	return getSetBoolean('ocultarFieldset', value);
}

function getSetBoolean(name, value) {
	if (typeof value !== 'undefined') {
		if (value !== true && value !== false) {
			throw new Error('Valor inválido para "' + name + '": "' + value + '"');
		}
		GM_setValue(name, value === true ? 'S' : 'N');
	}
	return GM_getValue(name, 'N') === 'S';
}

function getSetInt(name, value) {
	if (typeof value !== 'undefined') {
		if (isNaN(value)) {
			throw new Error('Valor inválido para "' + name + '": "' + value + '"');
		}
		GM_setValue(name, value | 0);
	}
	return GM_getValue(name, 0) | 0;
}

function criarColunasAdicionais() {
	$('table.tabelaControle').each(function(i, tabela) {
		criarColunaAdicional(tabela);
	});
}

function criarColunasAdicionaisMarcador() {
	$('table.tabelaControle').each(function(i, tabela) {
		criarColunaAdicionalMarcador(tabela);
	});
}

function criarColunaAdicional(tabela) {
	$(tabela).find('tr').each(function(i, linha) {
		if ($(linha).find('th').length > 0) {
			$('th:nth-child(3)', linha).after('<th class="tituloControle colAdicional"><span class="tipo">Tipo / Especificação</span><span class="ambos"> / </span><span class="anotacao">Anotações</span></th>');
		} else {
			$('td:nth-child(3)', linha).after('<td class="colAdicional"></td>');
		}
	});
}

function criarColunaAdicionalMarcador(tabela) {
	$(tabela).find('tr').each(function(i, linha) {
		if ($(linha).find('th').length > 0) {
			$('th:nth-child(3)', linha).after('<th class="tituloControle colAdicionalMarcador">Marcador</th>');
		} else {
			$('td:nth-child(3)', linha).after('<td class="colAdicionalMarcador"></td>');
		}
	});
}

function modificarTabelas() {
	analisarTipo();
	analisarAnotacoes();
	analisarMarcadores();
}

function analisarTipo() {
	$('a[href^="controlador.php?acao=procedimento_trabalhar"]').each(function(i, link) {
		var mouseover = $(link).attr('onmouseover');
		let [trash, text, title] = /^return infraTooltipMostrar\('(.*)','(.*)'\);$/.exec(mouseover);
		escreverColunaAdicional(link, '<div class="tipo">' + corrigirHTML(title) + '</div>');
		if (text !== '') {
			escreverColunaAdicional(link, '<div class="especificacao">' + corrigirHTML(text) + '</div></td>');
		}
		var cor = obterCor(title);
		$(link).parents('tr').css({background: cor});
	});
}

function obterCor(texto) {
	var STEPS_H = 10;
	var MULTI_H = 240 / STEPS_H;
	var h = 0;
	for (var i = 0, len = texto.length; i < len; i++) {
		h = (h + texto.charCodeAt(i)) % STEPS_H;
	}
	var h = Math.floor(h * MULTI_H);
	return 'hsl(' + h + ', 60%, 85%)';
}

function analisarAnotacoes() {
	$('img[src="imagens/sei_anotacao_prioridade_pequeno.gif"]').each(function(i, img) {
		var mouseover = $(img).attr('onmouseover');
		let [trash, text, user] = /^return infraTooltipMostrar\('(.*)','(.*)'\);$/.exec(mouseover);
		escreverColunaAdicional(img, '<div class="anotacao prioridade">' + corrigirHTML(text) + ' (' + corrigirHTML(user) + ')</div>');
		$(img).addClass('iconeAnotacao');
	});
	$('img[src="imagens/sei_anotacao_pequeno.gif"]').each(function(i, img) {
		var mouseover = $(img).attr('onmouseover');
		let [trash, text, user] = /^return infraTooltipMostrar\('(.*)','(.*)'\);$/.exec(mouseover);
		escreverColunaAdicional(img, '<div class="anotacao">' + corrigirHTML(text) + ' (' + corrigirHTML(user) + ')</div>');
		$(img).addClass('iconeAnotacao');
	});
}

function analisarMarcadores() {
	$('table img[src^="imagens/marcador_"]').each(function(i, img) {
		let [, cor] = /^imagens\/marcador_(.*)\.png$/.exec($(img).attr('src'));
		var mouseover = $(img).attr('onmouseover');
		let [, text, title] = /^return infraTooltipMostrar\('(.*)','(.*)'\);$/.exec(mouseover);
		escreverColunaAdicionalMarcador(img, '<div class="marcador" data-cor="' + cor + '">' + corrigirHTML(title) + '</div>');
		if (text !== '') {
			escreverColunaAdicionalMarcador(img, '<div class="marcadorTexto">' + corrigirHTML(text) + '</div>');
		}
		$(img).addClass('iconeMarcador');
	});
}

function escreverColunaAdicional(elemento, texto) {
	var coluna = obterColuna(elemento);
	$(coluna).append(texto);
}

function escreverColunaAdicionalMarcador(elemento, texto) {
	var coluna = obterColunaMarcador(elemento);
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

function obterColunaMarcador(elemento) {
	var coluna, colunas = $(elemento).parents('tr').find('td.colAdicionalMarcador');
	if (colunas.length > 0) {
		return colunas[0];
	} else {
		criarColunasAdicionaisMarcador();
		return obterColunaMarcador(elemento);
	}
}

function alternarOcultacaoFieldset(ocultar) {
	$('body').toggleClass('ocultarFieldset', ocultar);
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

function alternarExibicaoMarcadores(exibir) {
	$('body').toggleClass('mostrarMarcadores', exibir);
}

function alternarExibicaoCores(exibir) {
	$('body').toggleClass('ocultarCores', !exibir);
}

function definirOrdenacaoTabelas(ordenacao, agrupar) {
	$('table.tabelaControle').each(function(t, tabela) {
		let linhas = $(tabela).find('tr[id]');
		let informacoes = [];
		
		linhas.each(function(l, linha) {
			let $linha = $(linha);
			let links = $linha.find('a[tabindex]');
			links.each(function(i, link) {
				$(link).attr('data-ordem-original', link.tabIndex).attr('tabindex', null);
			})
			let link = $linha.find('a[data-ordem-original]')[0], $link = $(link);
			let informacao = {
				elemento: linha,
				id: link.href.match(/\&id_procedimento=(\d+)\&/)[1] | 0,
				ordemOriginal: $link.attr('data-ordem-original')
			};
			['tipo', 'especificacao', 'anotacao', 'prioridade', 'marcador'].forEach(function(dado) {
				let elementos = $linha.find('.' + dado);
				let texto;
				if (elementos.length === 0) {
					texto = '';
				} else {
					texto = elementos[0].textContent;
				}
				informacao[dado] = texto.toLocaleLowerCase();
			});
			informacoes.push(informacao);
		});
		
		let funcaoOrdenacao;
		switch (ordenacao & 3) {
			case Ordenacao.ANOTACAO:
				if (ordenacao & Ordenacao.PRIORITARIOS) {
					funcaoOrdenacao = ordenarPorAnotacaoPrioritariosPrimeiro;
				} else {
					funcaoOrdenacao = ordenarPorAnotacao;
				}
				break;

			case Ordenacao.TIPO:
				funcaoOrdenacao = ordenarPorTipoEspecificacaoAnotacao;
				break;
				
			case Ordenacao.NUMERO:
				funcaoOrdenacao = ordenarPorId;
				break;
				
			case Ordenacao.PADRAO:
			default:
				funcaoOrdenacao = ordenarPorOrdemPadrao;
				break;
		}
		if (agrupar) {
			informacoes.sort(gerarFuncaoOrdenarPorMarcador(funcaoOrdenacao, ordenacao & Ordenacao.INVERTER));
		} else {
			informacoes.sort(funcaoOrdenacao);
		}
		if (ordenacao & Ordenacao.INVERTER) {
			informacoes.reverse();
		}

		let fragmento = document.createDocumentFragment();
		informacoes.forEach(function(informacao) {
			fragmento.appendChild(informacao.elemento);
		});
		tabela.tBodies[0].appendChild(fragmento);
	});
}

function gerarFuncaoOrdenarPorMarcador(fnOrdenacao, inverter) {
	return function(a, b) {
		let textoA = a.marcador === '' ? 'zz' : a.marcador;
		let textoB = b.marcador === '' ? 'zz' : b.marcador;
		if (inverter) {
			let temp = textoA;
			textoA = textoB;
			textoB = temp;
		}
		if (textoA < textoB) {
			return -1;
		} else if (textoA > textoB) {
			return +1;
		} else {
			return fnOrdenacao(a, b);
		}
	};
}

function ordenarPorAnotacao(a, b) {
	let textoA = a.anotacao === '' ? 'zz' : a.anotacao;
	let textoB = b.anotacao === '' ? 'zz' : b.anotacao;
	if (textoA < textoB) {
		return -1;
	} else if (textoA > textoB) {
		return +1;
	} else {
		return ordenarPorOrdemPadrao(a, b);
	}
}

function ordenarPorAnotacaoPrioritariosPrimeiro(a, b) {
	let textoA = a.prioridade === '' ? 'zz' : a.prioridade;
	let textoB = b.prioridade === '' ? 'zz' : b.prioridade;
	textoA += a.anotacao === '' ? 'zz' : a.anotacao;
	textoB += b.anotacao === '' ? 'zz' : b.anotacao;
	if (textoA < textoB) {
		return -1;
	} else if (textoA > textoB) {
		return +1;
	} else {
		return ordenarPorOrdemPadrao(a, b);
	}
}

function ordenarPorId(a, b) {
	return a.id - b.id;
}

function ordenarPorOrdemPadrao(a, b) {
	return a.ordemOriginal - b.ordemOriginal;
}

function ordenarPorTipoEspecificacaoAnotacao(a, b) {
	let textoA = [a.tipo, a.especificacao, a.anotacao].join('');
	let textoB = [b.tipo, b.especificacao, b.anotacao].join('');
	if (textoA < textoB) {
		return -1;
	} else if (textoA > textoB) {
		return +1;
	} else {
		return ordenarPorOrdemPadrao(a, b);
	}
}

function corrigirHTML(texto) {
	return texto.replace(/\\r/g, '\r').replace(/\\n/g, '\n').replace(/\\&/g, '&').replace(/\r\n/g, '<br/>');
}
