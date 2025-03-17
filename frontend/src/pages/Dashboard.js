// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css'; // Importe o arquivo CSS

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        deadline: '',
        labels: [],
        status: 'todo',
        assignees: [], // Sempre inicializado como array vazio
    });
    const [users, setUsers] = useState([]); // Lista de usuários disponíveis
    const [feedback, setFeedback] = useState(null); // Feedback visual
    const [searchTerm, setSearchTerm] = useState(''); // Termo de pesquisa
    const [showDropdown, setShowDropdown] = useState(false); // Controla a visibilidade do dropdown
    const navigate = useNavigate();
    const [showStatusPopup, setShowStatusPopup] = useState(false); // Controla a visibilidade do popup de notificação
    const [movedTask, setMovedTask] = useState(null); // Armazena a tarefa que foi movida
    const [refreshKey, setRefreshKey] = useState(0); // Adicione este estado

    // Labels predefinidas
    const predefinedLabels = [
        { id: 'bug', name: 'Bug', color: '#e53e3e' },
        { id: 'feature', name: 'Feature', color: '#38a169' },
        { id: 'enhancement', name: 'Melhoria', color: '#805ad5' },
        { id: 'documentation', name: 'Documentação', color: '#3182ce' },
        { id: 'design', name: 'Design', color: '#d69e2e' },
        { id: 'test', name: 'Teste', color: '#718096' },
        { id: 'high', name: 'Alta Prioridade', color: '#e53e3e' },
        { id: 'medium', name: 'Média Prioridade', color: '#d69e2e' },
        { id: 'low', name: 'Baixa Prioridade', color: '#38a169' },
    ];

    // Função para alternar a seleção de uma label
    const toggleLabel = (labelId) => {
        setNewTask(prev => ({
            ...prev,
            labels: prev.labels.includes(labelId)
                ? prev.labels.filter(id => id !== labelId)
                : [...prev.labels, labelId]
        }));
    };

    // Busca as tarefas e usuários do backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login'); // Redireciona para a página de login se o token não estiver presente
                    return;
                }

                const tasksResponse = await axios.get('http://localhost:5000/api/tasks', {
                    headers: { Authorization: token },
                });
                setTasks(tasksResponse.data);

                const usersResponse = await axios.get('http://localhost:5000/api/users', {
                    headers: { Authorization: token },
                });
                setUsers(usersResponse.data);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };
        fetchData();
    }, [navigate, refreshKey]); // Adicione refreshKey como dependência

    // Função para lidar com o arrastar e soltar
    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        // Verifica se o destino é válido
        if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
            return;
        }

        // Cria uma cópia do estado atual das tarefas
        const updatedTasks = [...tasks];

        // Encontra a tarefa que está sendo arrastada
        const task = updatedTasks.find((t) => t.id.toString() === draggableId);

        // Atualiza o status da tarefa para o novo status (destination.droppableId)
        task.status = destination.droppableId;

        // Remove a tarefa da lista de tarefas
        const [removedTask] = updatedTasks.splice(source.index, 1);

        // Insere a tarefa na nova posição
        updatedTasks.splice(destination.index, 0, removedTask);

        // Atualiza o estado das tarefas
        setTasks(updatedTasks);

        // Atualiza o status da tarefa no backend
        axios.put(`http://localhost:5000/api/tasks/${task.id}`, { status: destination.droppableId }, {
            headers: { Authorization: localStorage.getItem('token') },
        });

        // Exibe o popup de notificação
        setMovedTask(task); // Define a tarefa que foi movida
        setShowStatusPopup(true); // Exibe o popup
    };

    // Função para abrir o pop-up de criação de tarefa
    const openPopup = () => {
        setShowPopup(true);
    };

    // Função para fechar o pop-up
    const closePopup = () => {
        setShowPopup(false);
        setFeedback(null); // Limpa o feedback ao fechar
    };

    // Função para lidar com a mudança nos campos do formulário
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTask({ ...newTask, [name]: value });
    };

    // Função para adicionar ou remover um usuário da lista de assignees
    const handleAssigneeChange = (userId) => {
        const updatedAssignees = newTask.assignees.includes(userId)
            ? newTask.assignees.filter((id) => id !== userId) // Remove o usuário
            : [...newTask.assignees, userId]; // Adiciona o usuário
        setNewTask({ ...newTask, assignees: updatedAssignees });
    };

    // Função para enviar a nova tarefa para o backend
    const handleCreateTask = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:5000/api/tasks',
                { ...newTask, creator_id: 1 }, // Substitua pelo ID do usuário logado
                { headers: { Authorization: token } }
            );

            // Verifica se a resposta contém os dados esperados
            if (response.data && response.data.title) {
                setTasks([...tasks, response.data]); // Adiciona a nova tarefa ao estado
                setFeedback({ type: 'success', message: 'Tarefa criada com sucesso!' });
                setTimeout(() => closePopup(), 2000); // Fecha o pop-up após 2 segundos
                setRefreshKey(oldKey => oldKey + 1); // Força o recarregamento dos dados
            } else {
                throw new Error('Dados da tarefa inválidos');
            }
        } catch (error) {
            console.error('Failed to create task:', error);
            setFeedback({ type: 'error', message: 'Erro ao criar a tarefa. Tente novamente.' });
        }
    };

    // Função para filtrar tarefas com base no termo de pesquisa
    const filteredTasks = tasks.filter(task =>
        task && task.title && task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task && task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Agrupa as tarefas por status
    const groupedTasks = filteredTasks.reduce((acc, task) => {
        if (!acc[task.status]) {
            acc[task.status] = [];
        }
        acc[task.status].push(task);
        return acc;
    }, {});

    const columns = [
        { id: 'todo', title: 'Para Fazer' },
        { id: 'in_progress', title: 'Em Progresso' },
        { id: 'doing', title: 'Fazendo' },
        { id: 'done', title: 'Feito' },
        { id: 'closed', title: 'Fechado' },
        { id: 'canceled', title: 'Cancelado' },
    ];

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">Quadro Kanban</h1>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Pesquisar tarefas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button 
                        className="create-task-button" 
                        onClick={() => setShowPopup(true)}
                        style={{ backgroundColor: '#4f46e5' }}
                    >
                        Criar Tarefa
                    </button>
                </div>
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="kanban-board">
                    {columns.map((column) => (
                        <Droppable key={column.id} droppableId={column.id}>
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="column"
                                >
                                    <h2 className="column-title">{column.title}</h2>
                                    <div className="task-list">
                                        {groupedTasks[column.id]?.map((task, index) => (
                                            <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`task ${task.status}`}
                                                        style={provided.draggableProps.style}
                                                        onClick={() => navigate(`/task/${task.id}`)}
                                                    >
                                                        <h3>{task.title || 'Tarefa sem título'}</h3>
                                                        <p>{task.description}</p>
                                                        <p>Prazo: {task.deadline}</p>
                                                        <p>Responsáveis: {
                                                            Array.isArray(task.assignees) && task.assignees.length > 0
                                                                ? task.assignees.join(', ')
                                                                : 'Nenhum responsável'
                                                        }</p>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>

            {/* Pop-up de criação de tarefa */}
            {showPopup && (
                <div className="popup">
                    <div className="popup-content">
                        <h2>Criar Nova Tarefa</h2>
                        {feedback && (
                            <div className={`feedback ${feedback.type}`}>
                                {feedback.message}
                            </div>
                        )}
                        <input
                            type="text"
                            name="title"
                            placeholder="Título"
                            value={newTask.title}
                            onChange={handleInputChange}
                        />
                        <textarea
                            name="description"
                            placeholder="Descrição"
                            value={newTask.description}
                            onChange={handleInputChange}
                        />
                        <input
                            type="date"
                            name="deadline"
                            value={newTask.deadline}
                            onChange={handleInputChange}
                        />

                        <div className="labels-section">
                            <h3>Labels:</h3>
                            <div className="labels-container">
                                {predefinedLabels.map(label => (
                                    <div
                                        key={label.id}
                                        className={`label-item ${newTask.labels.includes(label.id) ? 'selected' : ''}`}
                                        onClick={() => toggleLabel(label.id)}
                                    >
                                        <div 
                                            className="label-color"
                                            style={{ backgroundColor: label.color }}
                                        />
                                        <span className="label-text">{label.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="assignees-section">
                            <h3>Atribuir a:</h3>
                            <div className="dropdown">
                                <button
                                    className="dropdown-toggle"
                                    onClick={() => setShowDropdown(!showDropdown)}
                                >
                                    Selecione os responsáveis
                                </button>
                                {showDropdown && (
                                    <div className="dropdown-menu">
                                        {users.length > 0 ? (
                                            users.map((user) => (
                                                <div
                                                    key={user.id}
                                                    className="dropdown-item"
                                                    onClick={() => handleAssigneeChange(user.id)}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={newTask.assignees.includes(user.id)}
                                                        onChange={() => handleAssigneeChange(user.id)}
                                                    />
                                                    {user.username}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="dropdown-item">Nenhum usuário disponível</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="selected-assignees">
                                {newTask.assignees.map((userId) => {
                                    const user = users.find((u) => u.id === userId);
                                    return (
                                        <span key={userId} className="assignee-tag">
                                            {user?.username}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="popup-buttons">
                            <button onClick={handleCreateTask}>Criar</button>
                            <button onClick={closePopup}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
            {showStatusPopup && movedTask && (
                <div className="popup">
                    <div className="popup-content">
                        <h2>Status da Tarefa Atualizado</h2>
                        <p>A tarefa <strong>{movedTask.title}</strong> foi movida para <strong>{movedTask.status}</strong>.</p>
                        <p>Responsáveis:</p>
                        <ul>
                            {movedTask.assignees && movedTask.assignees.length > 0 ? (
                                movedTask.assignees.map((userId) => {
                                    const user = users.find((u) => u.id === userId);
                                    return <li key={userId}>{user?.username}</li>;
                                })
                            ) : (
                                <li>Nenhum responsável atribuído.</li>
                            )}
                        </ul>
                        <div className="popup-buttons">
                            <button onClick={() => setShowStatusPopup(false)}>Fechar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;