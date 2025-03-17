const TaskService = require('../services/taskService');

class TaskController {
    static getAll(req, res) {
        console.log('Buscando todas as tarefas...');
        TaskService.getAll((err, tasks) => {
            if (err) {
                console.error('Erro ao buscar tarefas:', err);
                return res.status(500).json({ 
                    message: 'Failed to fetch tasks',
                    error: err.message 
                });
            }
            console.log(`${tasks.length} tarefas encontradas`);
            res.json(tasks);
        });
    }

    static create(req, res) {
        console.log('Criando nova tarefa:', req.body);
        const task = req.body;
        TaskService.create(task, (err, result) => {
            if (err) {
                console.error('Erro ao criar tarefa:', err);
                return res.status(500).json({ 
                    message: 'Failed to create task',
                    error: err.message 
                });
            }
            console.log('Tarefa criada com sucesso:', result);
            res.json(result);
        });
    }

    static updateStatus(req, res) {
        const { status } = req.body;
        const taskId = req.params.id;
        console.log(`Atualizando status da tarefa ${taskId} para ${status}`);
        
        TaskService.updateStatus(taskId, status, (err) => {
            if (err) {
                console.error('Erro ao atualizar status:', err);
                return res.status(500).json({ 
                    message: 'Failed to update task status',
                    error: err.message 
                });
            }
            console.log('Status atualizado com sucesso');
            res.json({ message: 'Task status updated successfully' });
        });
    }
}

module.exports = TaskController;