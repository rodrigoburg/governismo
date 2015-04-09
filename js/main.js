
var width = $("body").width()* 0.9
var height = 550
var margins = {
    bottom:110,
    left:70,
    right:70,
    top:80
}

var pagina = null
var baixar = {}
var url_base = "https://spreadsheets.google.com/feeds/cells/1cR-OkyIUsU3vTw2JiCc9JbyTWvBl2dlzvtSfeTczlx0/2/public/values?alt=json"


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
    return celulas
}

var baixa_planilha_dados = function (callback) {
    $.getJSON(url_base, function  (d) {
        var dados = le_planilha(d)
        console.log(dados)
        var saida = []
        for (key in dados) {
            var item = dados[key]
            saida.push(item)
        }
        if (callback) callback(saida)
    })
}



/*

var svg = dimple.newSvg("#grafico", 590, 400);
d3.tsv("/data/example_data.tsv", function (data) {
    var myChart = new dimple.chart(svg, data);
    myChart.setBounds(60, 30, 500, 330)
    myChart.addMeasureAxis("x", "Unit Sales Monthly Change");
    myChart.addMeasureAxis("y", "Price Monthly Change");
    myChart.addMeasureAxis("z", "Operating Profit");
    myChart.addSeries(["SKU", "Channel"], dimple.plot.bubble);
    myChart.addLegend(200, 10, 360, 20, "right");
    myChart.draw();
});


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

function adiciona_partidos() {
    var botao = $("#partSelecionados")
    //primeiro botão é o que tira todos
    var item = '<li role="presentation" data-pos="'+1+'"><a role="menuitem" style="width:140px" onclick="tira_todos();" class="selecionada" tabindex="-1" href="#">Retirar todos</a></li>'
    botao.append(item)
    
    var i = 2
    partidos.forEach(function (d) {
        item = '<li role="presentation" data-pos="'+i+'"><a role="menuitem" style="width:100px" onclick="toggleSelect(this);" class="selecionada glyphicon glyphicon-remove-circle" tabindex="-1" href="#"> '+d+'</a></li>'
        botao.append(item)
        i++
    })
    
    //e, na outra lista, colocamos botão que coloca todos
    item = '<li role="presentation" data-pos="1"><a role="menuitem" style="width:140px"onclick="coloca_todos();" class="nao-selecionada" tabindex="-1" href="#">Selecionar todos</a></li>'
    $("#partNSelecionados").append(item)
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
