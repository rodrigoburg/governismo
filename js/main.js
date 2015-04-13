
var width = $("body").width()* 0.9
var height = 550
var margins = {
    bottom:110,
    left:70,
    right:70,
    top:50
}

var url_gov = "data/variancia_camara.json",
    url_pop = "https://spreadsheets.google.com/feeds/cells/1cR-OkyIUsU3vTw2JiCc9JbyTWvBl2dlzvtSfeTczlx0/2/public/values?alt=json",
    dados = [],
    partidos = [],
    dados_gov,
    dados_pop,
    grafico


var baixa_dados = function () {
    $.getJSON(url_pop, function  (d) {
        dados_pop = le_planilha(d)
        d3.json(url_gov, function(e) {
            dados_gov = e
            arruma_dados()
            desenha_grafico()
            adiciona_partidos()
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
    grafico.addSeries("data", dimple.plot.bubble);
    //myChart.addLegend(200, 10, 360, 20, "right");
    grafico.draw();
}

function muda_grafico(item) {
    var novos_dados = dimple.filterData(dados, "sigla",item.text.trim())
    console.log(novos_dados)
    grafico.data = novos_dados
    grafico.draw();
}

function adiciona_partidos() {
    var botao = $("#lista_partidos")
    var item = '<li role="presentation" data-pos="'+1+'"><a role="menuitem" style="width:140px" onclick="muda_grafico(this);" class="selecionada" tabindex="-1" href="#">GERAL</a></li>'
    botao.append(item)

    var i = 2
    partidos.forEach(function (d) {
        item = '<li role="presentation" data-pos="'+i+'"><a role="menuitem" style="width:100px" onclick="muda_grafico(this);" class="selecionada" tabindex="-1" href="#"> '+d+'</a></li>'
        botao.append(item)
        i++
    })

}

/*
 * Created by rodrigoburg on 23/03/15.

url = "data/variancia_camara.json"

//div da tooltip
var div = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);


//função para o menu de partidos
function toggleSelect(el) {
    var container_selecionadas = $("#partSelecionados"),
        container_n_selecionadas = $("#partNSelecionados"),
        item = $(el).parent();
    $(el).toggleClass("selecionada").toggleClass("nao-selecionada").toggleClass("glyphicon").toggleClass("glyphicon-remove-circle");
    if (item.parent()[0].id == "partNSelecionados") {
        container_selecionadas.append(item);
        partidos_selecionados.push($(el).text());
        coloca_partido($(el).text())
    } else {
        container_n_selecionadas.append(item);
        partidos_selecionados.splice(partidos_selecionados.indexOf($(el).text().trim()),1);
        tira_partido($(el).text())
    }
    $("#partSelecionados li").sort(sort_comp).appendTo("#partSelecionados");
    $("#partNSelecionados li").sort(sort_comp).appendTo("#partNSelecionados");
}



tecnica = d3.select("#tecnica")

//coloca hover na tooltip
d3.select("#nota")
    .on("mouseover", function (d) {
        tecnica.style("left", (d3.event.pageX - 50) + "px")
                .style("top", (d3.event.pageY - 120) + "px")
        tecnica.transition()
            .duration(300)
            .style("display", "block");
    })
    .on('mousemove', function(d) {
        tecnica.style("left", (d3.event.pageX - 50) + "px")
                .style("top", (d3.event.pageY - 120) + "px");
    })
    .on("mouseout", function(d) {
        tecnica.transition()
            .duration(400)
            .style("display", "none");
    });


*/
