const Task = require('../models/Task');
const User = require('../models/User');

class TaskService {
    static getAll(callback) {
        Task.getAll((err, results) => {
            if (err) {
                console.error('Erro ao buscar tarefas:', err);
                return callback(err);
            }

            const processTask = async (task) => {
                try {
                    // Parse dos assignees e labels com tratamento de erro
                    let assigneeIds = [];
                    try {
                        assigneeIds = task.assignees ? JSON.parse(task.assignees) : [];
                    } catch (e) {
                        console.error('Erro ao fazer parse dos assignees:', e);
                        assigneeIds = [];
                    }

                    let labels = [];
                    try {
                        labels = task.labels ? JSON.parse(task.labels) : [];
                    } catch (e) {
                        console.error('Erro ao fazer parse dos labels:', e);
                        labels = [];
                    }

                    // Se não há responsáveis, retorna a tarefa sem buscar usuários
                    if (assigneeIds.length === 0) {
                        return {
                            ...task,
                            assignees: [],
                            labels: labels
                        };
                    }

                    // Busca os usuários responsáveis
                    return new Promise((resolve, reject) => {
                        User.findByIds(assigneeIds, (err, users) => {
                            if (err) {
                                console.error('Erro ao buscar usuários:', err);
                                resolve({
                                    ...task,
                                    assignees: [],
                                    labels: labels
                                });
                                return;
                            }
                            resolve({
                                ...task,
                                assignees: users.map(user => user.username),
                                labels: labels
                            });
                        });
                    });
                } catch (error) {
                    console.error('Erro ao processar tarefa:', error);
                    return {
                        ...task,
                        assignees: [],
                        labels: []
                    };
                }
            };

            // Processa todas as tarefas
            Promise.all(results.map(processTask))
                .then(tasksWithAssignees => {
                    console.log('Tarefas processadas:', tasksWithAssignees);
                    callback(null, tasksWithAssignees);
                })
                .catch(error => {
                    console.error('Erro ao processar tarefas:', error);
                    callback(error);
                });
        });
    }

    static create(task, callback) {
        // Garante que assignees seja um array JSON válido
        const processedTask = {
            ...task,
            assignees: JSON.stringify(task.assignees || []),
            labels: JSON.stringify(task.labels || [])
        };

        Task.create(processedTask, (err, result) => {
            if (err) {
                console.error('Erro ao criar tarefa:', err);
                return callback(err);
            }
            callback(null, { id: result.insertId, ...task });
        });
    }

    static updateStatus(taskId, status, callback) {
        Task.updateStatus(taskId, status, (err) => {
            if (err) {
                console.error('Erro ao atualizar status da tarefa:', err);
                return callback(err);
            }
            callback(null);
        });
    }
}

module.exports = TaskService;