'use strict';

var async = require('async');

var AbstractTemplate = require('./abstractTemplate');

var dbBoardLane = require('../../db/boardLane');

class CycleTemplate extends AbstractTemplate
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
        let itemTypes = [
            {title: 'Processo', wipLimit: 0, policy: 'Melhoria de processo e auditoria', avatar: {icon: 'fa-gears', foreColor: {a: 1, b: 0, g: 0, r: 0}, backgroundColor: {a: 0, b: 255, g: 255, r: 255}}, board: board._id},
            {title: 'Manutenção corretiva', wipLimit: 0, policy: 'Correção de sistemas', avatar: {icon: 'fa-bug', foreColor: {a: 1, b: 0, g: 0, r: 0}, backgroundColor: {a: 0, b: 255, g: 255, r: 255}}, board: board._id},
            {title: 'Manutenção evolutiva', wipLimit: 0, policy: 'Melhorias de software', avatar: {icon: 'fa-car', foreColor: {a: 1, b: 0, g: 0, r: 0}, backgroundColor: {a: 0, b: 255, g: 255, r: 255}}, board: board._id},
            {title: 'Novo desenvolvimento', wipLimit: 0, policy: 'Construção de novos sistemas e manutenções evolutivas complexas', avatar: {icon: 'fa-road', foreColor: {a: 1, b: 0, g: 0, r: 0}, backgroundColor: {a: 0, b: 255, g: 255, r: 255}}, board: board._id},
            {title: 'Resolução de Incidente', wipLimit: 0, policy: 'Execução de procedimentos que não requerem recompilação de software, mas que precisam ser testados antes de serem efetuados', avatar: {icon: 'fa-chain-broken', foreColor: {a: 1, b: 27, g: 2, r: 208}, backgroundColor: {a: 0, b: 255, g: 255, r: 255}}, board: board._id}
        ];

        let itemSizes = [
            {title: 'Pequeno', wipLimit: 0, policy: 'Projetos com menos de 6 horas de duração', avatar: {letter: 'P', foreColor: {a: 1, b: 0, g: 0, r: 0}, backgroundColor: {a: 0, b: 255, g: 255, r: 255}}, board: board._id},
            {title: 'Médio', wipLimit: 0, policy: 'Projetos com duração entre 6 e 40 horas', avatar: {letter: 'M', foreColor: {a: 1, b: 0, g: 0, r: 0}, backgroundColor: {a: 0, b: 255, g: 255, r: 255}}, board: board._id},
            {title: 'Grande', wipLimit: 0, policy: 'Projetos com mais de 40 horas', avatar: {letter: 'G', foreColor: {a: 1, b: 0, g: 0, r: 0}, backgroundColor: {a: 0, b: 255, g: 255, r: 255}}, board: board._id}
        ];

        let metrics = [
            {title: 'Percentual', wipLimit: 0, policy: 'Items medidos em percentual', avatar: {icon: null, foreColor: {a: 1, b: 0, g: 0, r: 0}, backgroundColor: {a: 0, b: 255, g: 255, r: 255}}, board: board._id},
            {title: 'HH', wipLimit: 0, policy: 'Items medidos em ponto de função', avatar: {icon: null, foreColor: {a: 1, b: 0, g: 0, r: 0}, backgroundColor: {a: 0, b: 255, g: 255, r: 255}}, board: board._id},
            {title: 'PF', wipLimit: 0, policy: 'Items medidos em homem-hora', avatar: {icon: null, foreColor: {a: 1, b: 0, g: 0, r: 0}, backgroundColor: {a: 0, b: 255, g: 255, r: 255}}, board: board._id}
        ];

        let ratingTypes = [
            {title: 'Risco', wipLimit: 0, maxRating: 5, policy: 'Risco do item', avatar: {icon: 'thumbs outline up icon', foreColor: {a: 1, b: 0, g: 0, r: 0}, backgroundColor: {a: 0, b: 255, g: 255, r: 255}}, board: board._id},
            {title: 'Benefício', wipLimit: 0, maxRating: 5, policy: 'Benefício do item', avatar: {icon: 'thumbs outline up icon', foreColor: {a: 1, b: 0, g: 0, r: 0}, backgroundColor: {a: 0, b: 255, g: 255, r: 255}}, board: board._id},
            {title: 'Custo', wipLimit: 0, maxRating: 5, policy: 'Custo do item', avatar: {icon: 'dollar icon', foreColor: {a: 1, b: 0, g: 0, r: 0}, backgroundColor: {a: 0, b: 255, g: 255, r: 255}}, board: board._id}
        ];

        let taskTypes = [
        ];

        let impedimentTypes = [
            {title: 'Aguardando Cliente', policy: 'Aguardando Cliente', avatar: {icon: 'clock icon', foreColor: {a: 1, b: 255, g: 255, r: 255}, backgroundColor: {a: 1, b: 27, g: 2, r: 208}}, board: board._id}
        ];

        let aging = [
            {title: '1 semana', wipLimit: 0, numberOfDays: 8, avatar: {icon: null, foreColor: {a: 1, b: 255, g: 255, r: 255}, backgroundColor: {a: 1, b: 220, g: 220, r: 220}}, board: board._id},
            {title: '2 semanas', wipLimit: 0, numberOfDays: 16, avatar: {icon: null, foreColor: {a: 1, b: 255, g: 255, r: 255}, backgroundColor: {a: 1, b: 189, g: 189, r: 189}}, board: board._id},
            {title: '3 semanas', wipLimit: 0, numberOfDays: 24, avatar: {icon: null, foreColor: {a: 1, b: 255, g: 255, r: 255}, backgroundColor: {a: 1, b: 150, g: 150, r: 150}}, board: board._id},
            {title: '4 semanas ou +', wipLimit: 0, numberOfDays: 32, avatar: {icon: null, foreColor: {a: 1, b: 255, g: 255, r: 255}, backgroundColor: {a: 1, b: 113, g: 113, r: 113}}, board: board._id}
        ];

        let createLayoutFunction = (outerNextTask) =>
        {
            let root = new dbBoardLane({board: board._id.toString(), rootNode: {laneType: null, title: 'root', orientation: 0, wipLimit: 0, children: []}});

            let selected = {laneType: 'ready', title: 'Backlog', cardsWide: 2, orientation: 0, wipLimit: 10, activity: '', policy: 'Items que ainda não foram planejados', children: []};

            let execution = {laneType: null, title: 'Planejamento', orientation: 0, wipLimit: 3, activity: 'PLAN', policy: 'Items planejados', children: []};
            execution.children.push({laneType: 'wait', title: 'Próximo cíclo', cardsWide: 2, orientation: 0, wipLimit: 2, children: []});
            execution.children.push({laneType: 'inprogress', title: 'Cíclo corrente', cardsWide: 2, orientation: 0, wipLimit: 2, children: []});

            let done = {laneType: 'completed', title: 'Concluídos', cardsWide: 2, orientation: 0, wipLimit: 0, children: [], dateMetricConfig: {isEndCycleTime: true, isEndLeadTime: true}};

            root.rootNode.children.push(selected);
            root.rootNode.children.push(execution);
            root.rootNode.children.push(done);

            let createRoot = (nextTask) => root.save((err, rootLane) => nextTask(err, rootLane));
            let endTask = (rootLane, nextTask) => nextTask(null);

            async.waterfall([createRoot.bind(this), endTask.bind(this)], outerNextTask.bind(this)); //eslint-disable0line consistent-return
        };

        super(logger, loggerInfo, board, createLayoutFunction, priorities, classOfServices, itemTypes, itemSizes, metrics, ratingTypes, taskTypes, impedimentTypes, aging);
    }
}

module.exports = CycleTemplate;
