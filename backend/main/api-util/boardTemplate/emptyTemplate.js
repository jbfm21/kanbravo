'use strict';

var async = require('async');

var AbstractTemplate = require('./abstractTemplate');

var dbBoardLane = require('../../db/boardLane');

class EmptyTemplate extends AbstractTemplate
{
    constructor(logger, loggerInfo, board)
    {
        let priorities = [
            {title: 'Alta', wipLimit: 0, policy: 'Itens que precisam ser priorizados tão logo seja possível', avatar: {icon: 'fa-flag', foreColor: {a: 1, b: 27, g: 2, r: 208}, backgroundColor: {a: 0, b: 255, g: 255, r: 255}}, board: board._id},
            {title: 'Média', wipLimit: 0, policy: 'Itens que devem ser priorizados caso não existam itens com prioridade média', avatar: {icon: 'fa-flag', foreColor: {a: 1, b: 35, g: 166, r: 245}, backgroundColor: {a: 0, b: 255, g: 255, r: 255}}, board: board._id},
            {title: 'Baixa', wipLimit: 0, policy: 'Itens que devem ser feito por melhorar o processo no dia a dia', avatar: {icon: 'fa-flag', foreColor: {a: 1, b: 5, g: 117, r: 65}, backgroundColor: {a: 0, b: 255, g: 255, r: 255}}, board: board._id},
            {title: 'Normal', wipLimit: 0, policy: 'Itens que não possuem prioridade definida e seguem o fluxo normal do quadro', avatar: {icon: null, foreColor: {a: 1, b: 0, g: 0, r: 0}, backgroundColor: {a: 0, b: 255, g: 255, r: 255}}, board: board._id}
        ];
        let classOfServices = [
            {title: 'Legal', wipLimit: 0, policy: 'Demandas que precisam atender a exigências legais', avatar: {icon: 'fa-legal', foreColor: {a: 1, b: 0, g: 0, r: 0}, backgroundColor: {a: 0, b: 255, g: 255, r: 255}}, board: board._id},
            {title: 'Expedite', wipLimit: 0, policy: 'Demandas urgentes que se não forem resolvidas o quanto antes podem impactar o negócio e gerar perdas', avatar: {icon: 'fa-flash', foreColor: {a: 1, b: 27, g: 2, r: 208}, backgroundColor: {a: 0, b: 255, g: 255, r: 255}}, board: board._id},
            {title: 'Prazo definido', wipLimit: 0, policy: 'Demandas que possuem um prazo definido para a entrega, e que se não forem entregues no prazo acordado podem impactar o negócio e gerar perdas', avatar: {icon: 'fa-calendar-plus-o', foreColor: {a: 1, b: 0, g: 0, r: 0}, backgroundColor: {a: 0, b: 255, g: 255, r: 255}}, board: board._id},
            {title: 'Normal', wipLimit: 0, policy: 'Demandas que seguem o fluxo normal de atendimento', avatar: {icon: null, foreColor: {a: 1, b: 0, g: 0, r: 0}, backgroundColor: {a: 0, b: 255, g: 255, r: 255}}, board: board._id}
        ];
        let itemTypes = [];

        let itemSizes = [
            {title: 'Pequeno', wipLimit: 0, policy: 'Projetos com menos de 6 horas de duração', avatar: {letter: 'P', foreColor: {a: 1, b: 0, g: 0, r: 0}, backgroundColor: {a: 0, b: 255, g: 255, r: 255}}, board: board._id},
            {title: 'Médio', wipLimit: 0, policy: 'Projetos com duração entre 6 e 40 horas', avatar: {letter: 'M', foreColor: {a: 1, b: 0, g: 0, r: 0}, backgroundColor: {a: 0, b: 255, g: 255, r: 255}}, board: board._id},
            {title: 'Grande', wipLimit: 0, policy: 'Projetos com mais de 40 horas', avatar: {letter: 'G', foreColor: {a: 1, b: 0, g: 0, r: 0}, backgroundColor: {a: 0, b: 255, g: 255, r: 255}}, board: board._id}
        ];

        let metrics = [];

        let ratingTypes = [];

        let taskypes = [];

        let impedimentTypes = [];

        let aging = [
            {title: '1 semana', wipLimit: 0, numberOfDays: 8, avatar: {icon: null, foreColor: {a: 1, b: 255, g: 255, r: 255}, backgroundColor: {a: 1, b: 220, g: 220, r: 220}}, board: board._id},
            {title: '2 semanas', wipLimit: 0, numberOfDays: 16, avatar: {icon: null, foreColor: {a: 1, b: 255, g: 255, r: 255}, backgroundColor: {a: 1, b: 189, g: 189, r: 189}}, board: board._id},
            {title: '3 semanas', wipLimit: 0, numberOfDays: 24, avatar: {icon: null, foreColor: {a: 1, b: 255, g: 255, r: 255}, backgroundColor: {a: 1, b: 150, g: 150, r: 150}}, board: board._id},
            {title: '4 semanas ou +', wipLimit: 0, numberOfDays: 32, avatar: {icon: null, foreColor: {a: 1, b: 255, g: 255, r: 255}, backgroundColor: {a: 1, b: 113, g: 113, r: 113}}, board: board._id}
        ];

        let createLayoutFunction = (outerNextTask) =>
        {
            //TODO: NOVO_LAYOUT_TREE
            let root = new dbBoardLane({board: board._id.toString(), rootNode: {laneType: null, title: 'root', orientation: 0, wipLimit: 0, children: []}});

            let todo = {laneType: 'ready', title: 'A Fazer', cardsWide: 3, orientation: 0, wipLimit: 0, activity: null, policy: 'Itens aguardando execução', children: []};
            let doing = {laneType: 'inprogress', title: 'Fazendo', cardsWide: 2, orientation: 0, wipLimit: 3, activity: null, policy: 'Itens em execução', children: []};
            let done = {laneType: 'completed', title: 'Feito', cardsWide: 3, orientation: 0, wipLimit: 0, children: []};

            root.rootNode.children.push(todo);
            root.rootNode.children.push(doing);
            root.rootNode.children.push(done);

            let createRoot = (nextTask) => root.save((err, rootLane) => nextTask(err, rootLane));
            let endTask = (rootLane, nextTask) => nextTask(null);

            async.waterfall([createRoot.bind(this), endTask.bind(this)], outerNextTask.bind(this)); //eslint-disable0line consistent-return
        };

        super(logger, loggerInfo, board, createLayoutFunction, priorities, classOfServices, itemTypes, itemSizes, metrics, ratingTypes, taskypes, impedimentTypes, aging);
    }
}

module.exports = EmptyTemplate;
