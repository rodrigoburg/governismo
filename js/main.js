
var width = $("body").width()* 0.9
var height = 550
var margins = {
    bottom:110,
    left:70,
    right:70,
    top:50
}

var url_gov = "data/variancia_camara_mes.json",
    url_pop = "https://spreadsheets.google.com/feeds/cells/1cR-OkyIUsU3vTw2JiCc9JbyTWvBl2dlzvtSfeTczlx0/2/public/values?alt=json",
    serie_atual = "por_partido",
    dados = [],
    partidos = [],
    partidos_selecionados = [],
    datas = [],
    datas_selecionadas = [],
    dados_gov,
    dados_pop,
    grafico

var paleta = {
    GERAL:"#666666",
    PTC:'#A11217',
    PT:'#BE003E',
    PCdoB:'#BC005C',
    PSL:'#BA007C',
    PRB:'#98007F',
    PRTB:'#7B057E',
    PP:'#5E196F',
    PHS:'#45187D',
    PMDB:'#3A3A8B',
    PTB:'#00408F',
    PRP:'#00528B',
    PSB:'#0066A4',
    PROS:'#007CC0',
    PTN:'#009BDB',
    PDT:'#0096B2',
    PR:'#009493',
    PTdoB:'#008270',
    PV:'#009045',
    PSC:'#00602D',
    PMN:'#5F8930',
    PSD:'#7BAC39',
    PEN:'#A3BD31',
    PSDC:'#CAD226',
    SDD:'#FEEE00',
    PSOL:'#E9BC00',
    PPS:'#B6720A',
    DEM:'#9A740F',
    PSDB:'#634600',
    PST:'#634600',
    PL:'#634600',
    PPL:'#634600',
    PMR:'#634600',
    PFL_DEM:'#634600',
    PRONA:'#634600',
    PAN:'#634600',
    PPB:'#634600'
}

var baixa_dados = function () {
    $.getJSON(url_pop, function  (d) {
        dados_pop = le_planilha(d)
        d3.json(url_gov, function(e) {
            dados_gov = e
            arruma_dados()
            desenha_grafico()
            adiciona_partidos()
            adiciona_datas()
        })
    })
}

var le_planilha = function(d) {
    var cells = d.feed.entry; // d são os dados recebidos do Google...
    var numCells = cells.length;
    var cellId, cellPos , conteudo;
    var celulas = {}
    var titulos = {};

    for(var i=0; i < numCells; i++) {

        // lê na string do id a coluna e linha
        cellId = cells[i].id.$t.split('/');
        cellPos = cellId[cellId.length - 1].split('C');
        cellPos[0] = cellPos[0].replace('R', '');
        conteudo = cells[i].content.$t

        if (cellPos[0] == "1") {
            titulos[cellPos[1]] = conteudo

        } else {
            if (!(cellPos[0] in celulas)) {
                celulas[cellPos[0]] = {}
            }
            celulas[cellPos[0]][titulos[cellPos[1]]] = conteudo
        }
    }
    saida = []
    for (key in celulas) {
        saida.push(celulas[key])
    }
    return saida
}

var arruma_dados = function () {

    //pega só os dados para DILMA E LULA
    var presidentes = ["DILMA","LULA"]
    dados_pop = $.grep(dados_pop, function(d) {
        return presidentes.indexOf(d.PRESIDENTE) > -1;
    });

    //coloca as datas do data_gov em formato de data
    dados_gov = dados_gov.map(function (d) {
        var saida = acha_governismo(d.governismo)
        var data = saida[0].map(function (e) {
            return e.substring(0, 7)
        })
        var governismo = saida[1]
        //e agora pegamos só as variávies que queremos
        return {
            sigla: d.name,
            data: data,
            governismo: governismo
        }
    })

    //agora vamos montar a variável final dos dados
    //vamos usar os dados de populariadde como referência, já que há menos data com pesquisa q com o governismo
    dados_pop.forEach(function (d) {
        //para cada dado de popularidade, pegamos a data e colocamos no formato ano-mês
        var data = d.CAMPO.split("/")[2]+"-"+d.CAMPO.split("/")[1]

        //adicionamos ela no array de datas
        if (datas.indexOf(data) == -1) {
            datas.push(data)
        }

        //e procuramos o governismo dos partidos nessa data específica
        var i = dados_gov.map(function (e){
            var governismo = filtra_gov(e,data)
            if (governismo) {
                return {
                    sigla: e.sigla,
                    governismo:governismo
                }
            }
        })
        //agora colocamos os dados dessa data no dicionário de dados e o nome dos partidos para o select
        //também vamos criar 2 variáveis para calcularmos a média geral desse período
        var media = 0
        var total = 0
        var popularidade
        i.forEach(function (e) {
            if (e != undefined) {
                e["data"] = data
                e["popularidade"] = d.saldo
                media += parseInt(e.governismo)
                total += 1
                popularidade = d.saldo
                dados.push(e)
                if (partidos.indexOf(e.sigla) == -1) {
                    partidos.push(e.sigla)
                }
            }
        })

        //agora colocamos a média também no dados
        var governismo = parseInt(media/total)
        if (!(isNaN(governismo))) {
            var item = {
                sigla:"GERAL",
                governismo:governismo,
                data:data,
                popularidade:popularidade
            }
            dados.push(item)
        }
    })
}


function filtra_gov(item,data) {
    var index = item.data.indexOf(data)
    if (index == -1) {
        //console.log(item.sigla,data)
        return null
    } else {
        return item.governismo[index]
    }
}

function acha_governismo(lista) {
    var datas = []
    var govs = []
    lista.forEach(function (d) {
        datas.push(d[0])
        govs.push(d[1])
    })
    return [datas,govs]
}


baixa_dados()

function desenha_grafico() {
    var svg = dimple.newSvg("#grafico", width+60, height);
    var dados_filtrados = dimple.filterData(dados,"sigla","GERAL");

    grafico = new dimple.chart(svg, dados_filtrados);
    grafico.setBounds(margins.left,margins.top, width-margins.right, height-margins.bottom)
    var x = grafico.addMeasureAxis("x", "governismo");
    x.title = "Taxa de governismo (%)"
    x.overrideMin = 0;
    x.overrideMax = 100;

    var y = grafico.addMeasureAxis("y", "popularidade");
    y.title = "Saldo de popularidade do governo (%)"
    y.overrideMin = -55;
    y.overrideMax = 80;

    //myChart.addMeasureAxis("z", "Operating Profit");
    serie = grafico.addSeries(["data","sigla"], dimple.plot.bubble);
    serie.getTooltipText = function (e) {
        return [
                "Data: " + e.aggField[0],
                "Sigla: "+ e.aggField[1],
                "Popularidade do governo: " + e.yValue +"%",
                "Governismo da sigla: " + e.xValue +"%"
        ];
    };


    //agora coloca as cores da paleta
    for (var partido in paleta) {
        grafico.assignColor(partido,paleta[partido])
    }
    //myChart.addLegend(200, 10, 360, 20, "right");
    grafico.draw();

    //inicializa as duas variáveis básicas de seleção
    partidos_selecionados.push("GERAL")
    datas_selecionadas = datas
}

function muda_grafico(item) {
    //se tiver algum item, muda nos menus e na lista de partidos ou datas selecionadas
    if (item) {
        var texto = item.text.trim()
        //agora checamos se é data ou partido e mudamos na lista e na variável certa para cada caso
        if (texto.indexOf("-") == -1) {
            //se a sigla não estiver selecionada, colocamos ela lá
            if (partidos_selecionados.indexOf(texto) == -1) {
                partidos_selecionados.push(texto)
                $(item).addClass("glyphicon")
                $(item).addClass("glyphicon-ok")
            } else {
                //se já estiver selecionada, retiramos
                partidos_selecionados.splice(partidos_selecionados.indexOf(texto),1)
                $(item).removeClass("glyphicon")
                $(item).removeClass("glyphicon-ok")
            }
        } else {
            if (datas_selecionadas.indexOf(texto) == -1) {
                datas_selecionadas.push(texto)
                $(item).addClass("glyphicon")
                $(item).addClass("glyphicon-ok")
            } else {
                datas_selecionadas.splice(datas_selecionadas.indexOf(texto), 1)
                $(item).removeClass("glyphicon")
                $(item).removeClass("glyphicon-ok")
            }
        }
    }

    //agora muda as séries de acordo com a opção que tiver sido selecionada
    var novos_dados = dimple.filterData(dados, "sigla", partidos_selecionados)
    novos_dados = dimple.filterData(novos_dados, "data", datas_selecionadas)

    grafico.data = novos_dados
    grafico.draw();
}

function adiciona_partidos() {
    var botao = $("#lista_partidos")
    var item = '<li role="presentation" data-pos="'+1+'"><a role="menuitem" style="width:100px" onclick="muda_grafico(this);" class="selecionada glyphicon glyphicon-ok" tabindex="-1" href="#"> GERAL</a></li>'
    botao.append(item)

    var i = 2
    partidos.forEach(function (d) {
        item = '<li role="presentation" data-pos="'+i+'"><a role="menuitem" style="width:100px" onclick="muda_grafico(this);" class="selecionada" tabindex="-1" href="#"> '+d+'</a></li>'
        botao.append(item)
        i++
    })

}


function adiciona_datas() {
    var botao = $("#lista_datas")
    var item = '<li role="presentation" data-pos="'+1+'"><a role="menuitem" style="width:100px" onclick="muda_grafico(this);" class="selecionada glyphicon glyphicon-ok" tabindex="-1" href="#"> TODAS</a></li>'
    botao.append(item)

    var i = 2
    datas.forEach(function (d) {
        item = '<li role="presentation" data-pos="'+i+'"><a role="menuitem" style="width:100px" onclick="muda_grafico(this);" class="selecionada" tabindex="-1" href="#"> '+d+'</a></li>'
        botao.append(item)
        i++
    })

}
function revoluciona_grafico(item) {
    var opcao = $(item).text().trim().toLowerCase().replace(" ","_")
    serie_atual = opcao

    /*//esconde ou mostra o botão do filtro
    if (opcao == "por_data") {
        $(".botao-partido").css("visibility","hidden")
        $("#lista_partidos").css("visibility","hidden")
        $(".botao-data").css("visibility","visible")
        $("#lista_datas").css("visibility","visible")
    } else if (opcao == "por_partido") {
        $("#lista_partidos").css("visibility","visible")
        $(".botao-partido").css("visibility","visible")
        $(".botao-data").css("visibility","hidden")
        $("#lista_datas").css("visibility","hidden")
    }*/

    //atualiza o gráfico
    muda_grafico()
    console.log(opcao)
}
